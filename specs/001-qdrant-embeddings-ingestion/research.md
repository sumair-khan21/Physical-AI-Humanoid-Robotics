# Research & Technology Decisions

**Feature**: Qdrant Embeddings Ingestion Pipeline
**Date**: 2025-12-11
**Status**: Complete

## Overview

This document captures all technology choices, best practices research, and technical decisions made during the planning phase for the embeddings ingestion pipeline.

## Research Questions & Decisions

### 1. Sitemap Parsing

**Question**: Best approach to extract URLs from sitemap.xml?

**Decision**: Use Python's built-in `xml.etree.ElementTree` for sitemap parsing

**Rationale**:
- Docusaurus generates standard XML sitemaps following the sitemaps.org protocol
- No need for heavy dependencies like lxml
- ElementTree is part of Python standard library (no extra dependency)
- Simple namespace handling for sitemap xmlns

**Alternatives Considered**:
- `beautifulsoup4` with xml parser: Overkill for structured XML
- `lxml`: More powerful but unnecessary for simple sitemap parsing
- Manual regex parsing: Fragile and error-prone

**Implementation Pattern**:
```python
import xml.etree.ElementTree as ET
import requests

def parse_sitemap(url):
    response = requests.get(url)
    root = ET.fromstring(response.content)
    namespace = {'ns': 'http://www.sitemaps.org/schemas/sitemap/0.9'}
    urls = [loc.text for loc in root.findall('.//ns:loc', namespace)]
    return urls
```

---

### 2. HTML Content Extraction

**Question**: How to extract main content from Docusaurus pages while excluding navigation, headers, footers?

**Decision**: Use BeautifulSoup4 with specific Docusaurus content selectors

**Rationale**:
- Docusaurus uses consistent structure: main content in `<article>` or `main` tags
- BeautifulSoup4 provides flexible CSS selector support
- Easy to extract text while preserving structure (paragraphs, headings)

**Content Extraction Strategy**:
1. Primary selector: `article.markdown` or `article` tag
2. Fallback: `main` tag
3. Exclude: `nav`, `footer`, `.navbar`, `.sidebar`, `.pagination`
4. Clean: Remove code blocks syntax highlighting, preserve code content

**Implementation Pattern**:
```python
from bs4 import BeautifulSoup

def extract_content(html):
    soup = BeautifulSoup(html, 'html.parser')

    # Try to find article tag (Docusaurus v2/v3)
    article = soup.find('article')
    if not article:
        article = soup.find('main')

    if not article:
        return ""

    # Remove unwanted elements
    for element in article.find_all(['nav', 'footer', 'aside']):
        element.decompose()

    # Extract text
    text = article.get_text(separator='\n', strip=True)
    return text
```

**Alternatives Considered**:
- Trafilatura: Specialized content extraction library, but adds dependency
- Newspaper3k: Designed for news articles, not documentation
- Scrapy: Too heavy for sequential processing

---

### 3. Tokenization Library

**Question**: Which tokenizer to use for accurate token counting compatible with Cohere?

**Decision**: Use `tiktoken` with `cl100k_base` encoding

**Rationale**:
- OpenAI's tiktoken is industry standard for token counting
- `cl100k_base` encoding aligns well with modern embedding models
- Fast Rust implementation (via Python bindings)
- Cohere uses similar tokenization approaches

**Token Counting**:
```python
import tiktoken

encoding = tiktoken.get_encoding("cl100k_base")
token_count = len(encoding.encode(text))
```

**Alternatives Considered**:
- Cohere's tokenizer (not officially exposed via SDK)
- NLTK word tokenizer: Word count ≠ token count
- Simple split: Extremely inaccurate for API quota estimation

**Note**: Cohere API bills by tokens. Accurate pre-counting prevents unexpected costs.

---

### 4. Text Chunking Strategy

**Question**: How to implement sliding window chunking with overlap?

**Decision**: Sliding window at token level with 30-token overlap (midpoint of 20-40 range)

**Rationale**:
- 30 tokens ≈ 2-3 sentences, provides good context overlap
- Ensures no semantic boundaries are lost between chunks
- Keeps chunks in 300-500 token range as specified

**Algorithm**:
1. Tokenize entire text
2. Create chunks of target size (400 tokens - midpoint of 300-500)
3. Slide window by (chunk_size - overlap) tokens
4. Decode tokens back to text for each chunk

**Implementation Pattern**:
```python
def chunk_text_with_overlap(text, target_size=400, overlap=30):
    encoding = tiktoken.get_encoding("cl100k_base")
    tokens = encoding.encode(text)

    chunks = []
    start = 0
    while start < len(tokens):
        end = min(start + target_size, len(tokens))
        chunk_tokens = tokens[start:end]
        chunk_text = encoding.decode(chunk_tokens)
        chunks.append({
            'text': chunk_text,
            'token_count': len(chunk_tokens),
            'start_token': start,
            'end_token': end
        })
        start += (target_size - overlap)

    return chunks
```

**Alternatives Considered**:
- Semantic chunking (by paragraphs/sections): More complex, requires NLP
- Fixed character chunks: Inaccurate token estimation
- No overlap: Risks losing context at boundaries

---

### 5. Cohere Model Selection

**Question**: Which Cohere embedding model to use?

**Decision**: `embed-english-v3.0` with 1024 dimensions

**Rationale**:
- Best quality embeddings for English text
- 1024 dimensions: Good balance of quality vs storage
- Industry-standard for RAG applications
- Supports input type specification (`search_document` for indexing)

**Model Comparison**:

| Model | Dimensions | Quality | Speed | Use Case |
|-------|-----------|---------|-------|----------|
| embed-english-v3.0 | 1024 | High | Medium | Production RAG |
| embed-english-light-v3.0 | 384 | Medium | Fast | Prototyping |
| embed-multilingual-v3.0 | 1024 | High | Medium | Non-English |

**API Usage**:
```python
import cohere

co = cohere.Client(api_key=COHERE_API_KEY)
response = co.embed(
    texts=chunk_texts,
    model='embed-english-v3.0',
    input_type='search_document'  # Important for indexing
)
embeddings = response.embeddings
```

**Cost Consideration**: Free tier provides sufficient quota for ~200 pages (~5000 chunks). Estimated cost beyond free tier: ~$0.10 per 1M tokens.

---

### 6. Qdrant Collection Configuration

**Question**: How to configure Qdrant collection for optimal retrieval?

**Decision**: Cosine distance metric with 1024-dimensional vectors

**Configuration**:
```python
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams

client.create_collection(
    collection_name="rag_embedding",
    vectors_config=VectorParams(
        size=1024,  # Matches embed-english-v3.0
        distance=Distance.COSINE  # Best for normalized embeddings
    )
)
```

**Rationale**:
- Cosine distance is standard for embedding similarity
- Handles normalized vectors efficiently
- Qdrant optimizes cosine similarity with HNSW index

**Distance Metrics Comparison**:
- **Cosine**: Measures angle between vectors (orientation similarity) ✓
- Euclidean: Measures absolute distance (magnitude matters)
- Dot product: Combines magnitude and orientation

**Alternatives Considered**:
- Euclidean distance: Less suitable for normalized embeddings
- Dot product: Requires careful normalization management

---

### 7. Idempotency Strategy

**Question**: How to prevent duplicate ingestion on re-runs?

**Decision**: URL-based idempotency using Qdrant metadata queries

**Implementation**:
1. Before processing URL, query Qdrant: `filter: {url: {match: target_url}}`
2. If points exist with that URL, skip processing
3. No external state file needed - Qdrant is source of truth

**Rationale**:
- Qdrant supports efficient metadata filtering
- No need to maintain separate state file
- Supports incremental updates (only new pages processed)

**Query Pattern**:
```python
from qdrant_client.models import Filter, FieldCondition, MatchValue

existing = client.scroll(
    collection_name="rag_embedding",
    scroll_filter=Filter(
        must=[
            FieldCondition(
                key="url",
                match=MatchValue(value=target_url)
            )
        ]
    ),
    limit=1
)

if len(existing[0]) > 0:
    print(f"Skipping {target_url} - already processed")
    continue
```

**Alternatives Considered**:
- State file (JSON/CSV): Requires external file management, risk of desync
- Database table: Unnecessary complexity for simple use case
- Hash-based: Still requires state storage

---

### 8. Error Handling & Retry Logic

**Question**: How to handle API rate limits and transient failures?

**Decision**: Exponential backoff with tenacity library

**Configuration**:
```python
from tenacity import retry, stop_after_attempt, wait_exponential

@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=4, max=60)
)
def embed_with_retry(texts, cohere_client):
    return cohere_client.embed(
        texts=texts,
        model='embed-english-v3.0',
        input_type='search_document'
    )
```

**Retry Strategy**:
- Max 3 attempts per API call
- Exponential backoff: 4s, 16s, 60s
- Log each retry attempt
- Fail gracefully: Skip URL on permanent failure, continue pipeline

**Error Categories**:
1. **Network errors** (timeouts, connection failures): Retry
2. **Rate limits** (429 status): Retry with backoff
3. **Malformed HTML** (parsing errors): Log and skip
4. **API errors** (invalid input): Log and skip

**Alternatives Considered**:
- Constant retry delay: Can worsen rate limiting
- Infinite retries: Risk of hanging pipeline
- No retries: Too fragile for production use

---

### 9. Batch Processing

**Question**: Optimal batch size for Cohere embeddings and Qdrant uploads?

**Decision**:
- **Cohere batching**: 96 chunks per API call (Cohere limit)
- **Qdrant batching**: 100 points per upsert

**Rationale**:
- Cohere API supports up to 96 texts per call (documented limit)
- Batching reduces API calls, improves throughput
- Qdrant batch upsert is more efficient than individual inserts

**Implementation**:
```python
# Process in batches of 96
for i in range(0, len(chunks), 96):
    batch = chunks[i:i+96]
    embeddings = embed_with_retry([c['text'] for c in batch], cohere_client)

    # Prepare points for Qdrant
    points = [
        PointStruct(
            id=str(uuid.uuid4()),
            vector=embedding,
            payload={
                'text': chunk['text'],
                'url': url,
                'chunk_index': idx,
                'token_count': chunk['token_count']
            }
        )
        for idx, (chunk, embedding) in enumerate(zip(batch, embeddings))
    ]

    # Upload to Qdrant in batches of 100
    qdrant_client.upsert(collection_name="rag_embedding", points=points)
```

**Trade-offs**:
- Larger batches: Fewer API calls, but higher risk of partial failure
- Smaller batches: More resilient, but slower overall

---

## Best Practices Summary

### Code Quality
- ✓ Type hints for all function signatures
- ✓ Docstrings following Google style
- ✓ PEP 8 formatting (use `black` formatter)
- ✓ Error handling with specific exception types
- ✓ Logging with appropriate levels (INFO, WARNING, ERROR)

### Security
- ✓ API keys via environment variables (.env)
- ✓ Never commit .env file (add to .gitignore)
- ✓ Use python-dotenv for env loading
- ✓ Validate environment variables at startup

### Performance
- ✓ Batch API calls where possible
- ✓ Reuse HTTP sessions (requests.Session())
- ✓ Stream large responses if needed
- ✓ Progress logging for long-running operations

### Testing
- ✓ Unit tests for pure functions (chunking, parsing)
- ✓ Integration tests with small dataset (2-3 URLs)
- ✓ Mock external APIs in unit tests
- ✓ Manual validation on full dataset

---

## Dependencies Version Matrix

| Package | Version | Purpose |
|---------|---------|---------|
| python | >=3.11 | Runtime |
| requests | >=2.31.0 | HTTP client |
| beautifulsoup4 | >=4.12.0 | HTML parsing |
| tiktoken | >=0.5.0 | Token counting |
| cohere | >=4.37.0 | Embeddings API |
| qdrant-client | >=1.7.0 | Vector DB client |
| python-dotenv | >=1.0.0 | Env variables |
| tenacity | >=8.2.0 | Retry logic |
| pytest | >=7.4.0 | Testing (dev) |

**Lock File**: UV automatically generates `uv.lock` for reproducible builds.

---

## Open Questions & Future Improvements

### Phase 1 (Out of Scope)
- Parallel processing (use asyncio/threading for concurrent URL fetching)
- Incremental updates (detect changed pages, re-process only modified content)
- Advanced chunking (semantic segmentation by sections/topics)
- Multi-language support (use multilingual Cohere model)

### Phase 2 (Retrieval - Separate Feature)
- Query embedding generation (`input_type='search_query'`)
- Similarity search with top-k retrieval
- Re-ranking for improved relevance
- Hybrid search (combine vector + keyword search)

---

## References

1. [Cohere Embed API Documentation](https://docs.cohere.com/reference/embed)
2. [Qdrant Collection Configuration](https://qdrant.tech/documentation/concepts/collections/)
3. [Docusaurus Site Structure](https://docusaurus.io/docs/creating-pages)
4. [Sitemap Protocol](https://www.sitemaps.org/protocol.html)
5. [tiktoken GitHub Repository](https://github.com/openai/tiktoken)
6. [Tenacity Retry Library](https://tenacity.readthedocs.io/)

---

**Status**: All research questions resolved. Ready to proceed to data model design (Phase 1).
