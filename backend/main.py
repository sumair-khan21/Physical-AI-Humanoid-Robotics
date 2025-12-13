"""
Qdrant Embeddings Ingestion Pipeline

This script crawls a Docusaurus site via sitemap, extracts text content, chunks it,
generates embeddings using Cohere, and stores them in Qdrant vector database.
"""

import os
import logging
from typing import List, Dict, Tuple, Optional
from datetime import datetime
import xml.etree.ElementTree as ET
from uuid import uuid4

import requests
from bs4 import BeautifulSoup
import tiktoken
import cohere
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct
from tenacity import retry, stop_after_attempt, wait_exponential
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='[%(levelname)s] %(asctime)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)

# Environment configuration
COHERE_API_KEY = os.getenv('COHERE_API_KEY')
QDRANT_URL = os.getenv('QDRANT_URL')
QDRANT_API_KEY = os.getenv('QDRANT_API_KEY')
SITEMAP_URL = os.getenv('SITEMAP_URL')
COLLECTION_NAME = os.getenv('COLLECTION_NAME')
CHUNK_SIZE_MIN = int(os.getenv('CHUNK_SIZE_MIN', '300'))
CHUNK_SIZE_MAX = int(os.getenv('CHUNK_SIZE_MAX', '500'))
CHUNK_OVERLAP = int(os.getenv('CHUNK_OVERLAP', '30'))


def get_all_urls(sitemap_url: str) -> List[str]:
    """
    Parse sitemap XML and extract all page URLs.

    Args:
        sitemap_url: URL of the sitemap.xml file

    Returns:
        List of URLs found in the sitemap

    Raises:
        requests.RequestException: If sitemap fetch fails
        ET.ParseError: If XML parsing fails
    """
    logging.info(f"Fetching sitemap from {sitemap_url}...")
    response = requests.get(sitemap_url, timeout=30)
    response.raise_for_status()

    root = ET.fromstring(response.content)
    # Handle XML namespace
    namespace = {'ns': 'http://www.sitemaps.org/schemas/sitemap/0.9'}
    urls = [loc.text for loc in root.findall('.//ns:loc', namespace)]

    logging.info(f"Found {len(urls)} URLs in sitemap")
    return urls


def extract_text_from_url(url: str) -> Tuple[str, str]:
    """
    Fetch HTML from URL and extract title and main content.

    Args:
        url: URL to fetch and extract content from

    Returns:
        Tuple of (page_title, text_content)
        Returns empty strings if extraction fails
    """
    try:
        response = requests.get(url, timeout=30)
        response.raise_for_status()

        soup = BeautifulSoup(response.content, 'html.parser')

        # Extract title
        title = ''
        if soup.title:
            title = soup.title.string.strip()
        elif soup.h1:
            title = soup.h1.get_text().strip()

        # Extract main content (Docusaurus specific)
        main_content = soup.find('article') or soup.find('main')
        if main_content:
            # Remove navigation, footer, etc.
            for tag in main_content.find_all(['nav', 'footer', 'script', 'style']):
                tag.decompose()
            text = main_content.get_text(separator=' ', strip=True)
        else:
            text = soup.get_text(separator=' ', strip=True)

        return title, text

    except Exception as e:
        logging.error(f"Failed to extract text from {url}: {e}")
        return '', ''


def chunk_text(
    text: str,
    min_tokens: int,
    max_tokens: int,
    overlap: int
) -> List[Dict]:
    """
    Split text into overlapping chunks based on token count.

    Args:
        text: Input text to chunk
        min_tokens: Minimum chunk size in tokens
        max_tokens: Maximum chunk size in tokens
        overlap: Number of overlapping tokens between chunks

    Returns:
        List of chunk dictionaries with keys: text, token_count, start_token, end_token
    """
    encoding = tiktoken.get_encoding('cl100k_base')
    tokens = encoding.encode(text)
    total_tokens = len(tokens)

    if total_tokens == 0:
        return []

    chunks = []
    target_size = (min_tokens + max_tokens) // 2  # Target 400 tokens
    start = 0

    while start < total_tokens:
        # Calculate end position
        end = min(start + target_size, total_tokens)

        # Extract chunk tokens
        chunk_tokens = tokens[start:end]
        chunk_text = encoding.decode(chunk_tokens)

        chunks.append({
            'text': chunk_text,
            'token_count': len(chunk_tokens),
            'start_token': start,
            'end_token': end
        })

        # Move start position with overlap
        if end >= total_tokens:
            break
        start = end - overlap

    return chunks


@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
def embed(texts: List[str], cohere_client) -> List[List[float]]:
    """
    Generate embeddings for texts using Cohere API with retry logic.

    Args:
        texts: List of text strings to embed (max 96 per batch)
        cohere_client: Initialized Cohere client

    Returns:
        List of embedding vectors

    Raises:
        CohereAPIError: If API call fails after retries
    """
    if not texts:
        return []

    # Batch limit for Cohere
    batch_size = 96
    all_embeddings = []

    for i in range(0, len(texts), batch_size):
        batch = texts[i:i + batch_size]
        response = cohere_client.embed(
            texts=batch,
            model='embed-english-v3.0',
            input_type='search_document'
        )
        all_embeddings.extend(response.embeddings)

    return all_embeddings


def create_collection(
    qdrant_client: QdrantClient,
    collection_name: str,
    vector_size: int = 1024
) -> None:
    """
    Create Qdrant collection if it doesn't exist.

    Args:
        qdrant_client: Initialized Qdrant client
        collection_name: Name of the collection to create
        vector_size: Dimension of embedding vectors (default 1024 for Cohere)
    """
    try:
        qdrant_client.get_collection(collection_name)
        logging.info(f"Collection '{collection_name}' already exists")
    except Exception:
        logging.info(f"Creating collection '{collection_name}'...")
        qdrant_client.create_collection(
            collection_name=collection_name,
            vectors_config=VectorParams(
                size=vector_size,
                distance=Distance.COSINE
            )
        )
        logging.info(f"Collection '{collection_name}' created successfully")


@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
def save_chunk_to_qdrant(
    qdrant_client: QdrantClient,
    collection_name: str,
    points: List[PointStruct]
) -> None:
    """
    Upload embedding points to Qdrant with retry logic.

    Args:
        qdrant_client: Initialized Qdrant client
        collection_name: Name of the collection
        points: List of PointStruct objects to upload
    """
    if not points:
        return

    qdrant_client.upsert(
        collection_name=collection_name,
        points=points
    )


def is_url_processed(
    qdrant_client: QdrantClient,
    collection_name: str,
    url: str
) -> bool:
    """
    Check if a URL has already been processed and stored in Qdrant.

    Args:
        qdrant_client: Initialized Qdrant client
        collection_name: Name of the collection
        url: URL to check

    Returns:
        True if URL exists in collection, False otherwise
    """
    try:
        # First check if collection has any points
        collection_info = qdrant_client.get_collection(collection_name)
        if collection_info.points_count == 0:
            return False

        from qdrant_client.models import Filter, FieldCondition, MatchValue

        result = qdrant_client.scroll(
            collection_name=collection_name,
            scroll_filter=Filter(
                must=[
                    FieldCondition(
                        key="url",
                        match=MatchValue(value=url)
                    )
                ]
            ),
            limit=1
        )
        return len(result[0]) > 0
    except Exception:
        return False


def main():
    """Main pipeline orchestration function."""
    start_time = datetime.now()

    logging.info("Starting Qdrant embeddings ingestion pipeline...")
    logging.info(f"Sitemap URL: {SITEMAP_URL}")
    logging.info(f"Collection: {COLLECTION_NAME}")

    # Initialize clients
    logging.info("Initializing API clients...")
    cohere_client = cohere.Client(api_key=COHERE_API_KEY)
    qdrant_client = QdrantClient(url=QDRANT_URL, api_key=QDRANT_API_KEY)

    # Get all URLs from sitemap
    try:
        urls = get_all_urls(SITEMAP_URL)
    except Exception as e:
        logging.error(f"Failed to fetch sitemap: {e}")
        return

    # Create Qdrant collection
    create_collection(qdrant_client, COLLECTION_NAME)

    # Process each URL
    total_urls = len(urls)
    processed_count = 0
    skipped_count = 0
    error_count = 0
    total_chunks = 0
    total_embeddings = 0

    logging.info(f"Processing {total_urls} URLs...")

    for idx, url in enumerate(urls, 1):
        try:
            # Check if URL already processed
            if is_url_processed(qdrant_client, COLLECTION_NAME, url):
                logging.info(f"[{idx}/{total_urls}] Skipping (already processed): {url}")
                skipped_count += 1
                continue

            logging.info(f"[{idx}/{total_urls}] Processing: {url}")

            # Extract text
            title, text = extract_text_from_url(url)
            if not text:
                logging.warning(f"  - No content extracted, skipping")
                skipped_count += 1
                continue

            # Chunk text
            chunks = chunk_text(text, CHUNK_SIZE_MIN, CHUNK_SIZE_MAX, CHUNK_OVERLAP)
            if not chunks:
                logging.warning(f"  - No chunks created, skipping")
                skipped_count += 1
                continue

            logging.info(f"  - Created {len(chunks)} chunks")
            total_chunks += len(chunks)

            # Generate embeddings
            chunk_texts = [chunk['text'] for chunk in chunks]
            embeddings = embed(chunk_texts, cohere_client)
            total_embeddings += len(embeddings)
            logging.info(f"  - Generated {len(embeddings)} embeddings")

            # Create points for Qdrant
            points = []
            for chunk_idx, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
                point_id = str(uuid4())
                payload = {
                    'text': chunk['text'],
                    'url': url,
                    'chunk_index': chunk_idx,
                    'page_title': title,
                    'token_count': chunk['token_count'],
                    'created_at': datetime.now().isoformat()
                }
                points.append(PointStruct(
                    id=point_id,
                    vector=embedding,
                    payload=payload
                ))

            # Upload to Qdrant
            save_chunk_to_qdrant(qdrant_client, COLLECTION_NAME, points)
            logging.info(f"  - Uploaded {len(points)} points to Qdrant")

            processed_count += 1

        except Exception as e:
            logging.error(f"  - Error processing {url}: {e}")
            error_count += 1
            continue

    # Summary
    end_time = datetime.now()
    duration = end_time - start_time

    logging.info("\n" + "="*60)
    logging.info("Pipeline execution complete!")
    logging.info("="*60)
    logging.info(f"Total URLs: {total_urls}")
    logging.info(f"Successfully processed: {processed_count}")
    logging.info(f"Skipped (already processed): {skipped_count}")
    logging.info(f"Errors: {error_count}")
    logging.info(f"Total chunks created: {total_chunks}")
    logging.info(f"Total embeddings generated: {total_embeddings}")
    logging.info(f"Execution time: {duration}")
    logging.info("="*60)


if __name__ == "__main__":
    main()
