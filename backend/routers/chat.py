"""
Chat Router - FastAPI endpoint for RAG queries

Handles POST /api/chat/query endpoint with Qdrant retrieval and Cohere generation.
"""

import os
import logging
from typing import List
from datetime import datetime

from fastapi import APIRouter, HTTPException, status
from dotenv import load_dotenv
import cohere
from qdrant_client import QdrantClient
from qdrant_client.models import Filter, FieldCondition, MatchValue

try:
    # Try absolute import (when running from project root)
    from backend.models.chat_models import ChatRequest, ChatResponse, SourceResponse
except ModuleNotFoundError:
    # Fall back to relative import (when running from backend directory)
    from models.chat_models import ChatRequest, ChatResponse, SourceResponse

# Load environment variables
load_dotenv()

# Configure logging
logger = logging.getLogger(__name__)

# Environment configuration
COHERE_API_KEY = os.getenv('COHERE_API_KEY')
QDRANT_URL = os.getenv('QDRANT_URL')
QDRANT_API_KEY = os.getenv('QDRANT_API_KEY')
COLLECTION_NAME = os.getenv('COLLECTION_NAME', 'physical_ai_textbook')
TOP_K_RESULTS = int(os.getenv('TOP_K_RESULTS', '5'))

# Initialize clients (singleton pattern)
cohere_client = cohere.Client(COHERE_API_KEY)
qdrant_client = QdrantClient(url=QDRANT_URL, api_key=QDRANT_API_KEY)

# Create router
router = APIRouter(prefix="/api/chat", tags=["chat"])


async def retrieve_relevant_chunks(query: str, top_k: int = TOP_K_RESULTS) -> List[dict]:
    """
    Retrieve relevant chunks from Qdrant using semantic search.

    Args:
        query: User's question
        top_k: Number of top results to retrieve

    Returns:
        List of relevant chunks with metadata
    """
    try:
        # Generate query embedding
        response = cohere_client.embed(
            texts=[query],
            model='embed-english-v3.0',
            input_type='search_query'
        )
        query_embedding = response.embeddings[0]

        # Search Qdrant
        search_results = qdrant_client.search(
            collection_name=COLLECTION_NAME,
            query_vector=query_embedding,
            limit=top_k,
            score_threshold=0.3  # Filter low-relevance results
        )

        # Format results
        chunks = []
        for result in search_results:
            chunks.append({
                'text': result.payload.get('text', ''),
                'url': result.payload.get('url', ''),
                'page_title': result.payload.get('page_title', 'Unknown'),
                'relevance_score': result.score
            })

        return chunks

    except Exception as e:
        logger.error(f"Retrieval error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve relevant content: {str(e)}"
        )


async def generate_answer(query: str, context_chunks: List[dict]) -> str:
    """
    Generate answer using Cohere with retrieved context.

    Args:
        query: User's question
        context_chunks: Retrieved chunks from Qdrant

    Returns:
        Generated answer text
    """
    try:
        # Build context from retrieved chunks
        context = "\n\n".join([
            f"[Source: {chunk['page_title']}]\n{chunk['text']}"
            for chunk in context_chunks
        ])

        # Generate answer with Cohere
        response = cohere_client.chat(
            message=query,
            preamble=(
                "You are an AI assistant for a Physical AI and Humanoid Robotics textbook. "
                "Answer questions based on the provided context. "
                "If the context doesn't contain relevant information, say so clearly. "
                "Be concise, accurate, and educational."
            ),
            documents=[{"text": context}] if context else None,
            model='command-r-plus'
        )

        return response.text

    except Exception as e:
        logger.error(f"Generation error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate answer: {str(e)}"
        )


@router.post(
    "/query",
    response_model=ChatResponse,
    status_code=status.HTTP_200_OK,
    summary="Submit a question to the RAG system",
    description="Send a question and receive an AI-generated answer with source citations"
)
async def chat_query(request: ChatRequest) -> ChatResponse:
    """
    Handle chat query with RAG pipeline.

    Process:
    1. Retrieve relevant chunks from Qdrant (semantic search)
    2. Generate answer using Cohere with retrieved context
    3. Return answer with source citations

    Args:
        request: ChatRequest with user's question

    Returns:
        ChatResponse with answer, sources, and timestamp

    Raises:
        HTTPException: 400 for validation errors, 500 for internal errors
    """
    try:
        logger.info(f"Received query: {request.question[:100]}...")

        # Step 1: Retrieve relevant chunks
        chunks = await retrieve_relevant_chunks(request.question)

        if not chunks:
            logger.warning("No relevant chunks found")
            return ChatResponse(
                answer="I couldn't find relevant information in the textbook to answer your question. Please try rephrasing or asking about a different topic.",
                sources=None,
                timestamp=datetime.utcnow().isoformat()
            )

        logger.info(f"Retrieved {len(chunks)} relevant chunks")

        # Step 2: Generate answer
        answer = await generate_answer(request.question, chunks)

        # Step 3: Format sources (deduplicate by URL)
        seen_urls = set()
        sources = []
        for chunk in chunks:
            url = chunk['url']
            if url not in seen_urls:
                sources.append(SourceResponse(
                    title=chunk['page_title'],
                    url=url,
                    relevance_score=chunk['relevance_score']
                ))
                seen_urls.add(url)

        logger.info(f"Generated answer with {len(sources)} unique sources")

        return ChatResponse(
            answer=answer,
            sources=sources if sources else None,
            timestamp=datetime.utcnow().isoformat()
        )

    except HTTPException:
        raise  # Re-raise HTTP exceptions
    except Exception as e:
        logger.error(f"Unexpected error in chat_query: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred. Please try again."
        )


@router.get(
    "/health",
    status_code=status.HTTP_200_OK,
    summary="Health check endpoint",
    description="Check if the chat service is healthy and can connect to dependencies"
)
async def health_check():
    """
    Health check endpoint for monitoring.

    Returns:
        Status dict with service health and dependency connectivity
    """
    try:
        # Check Qdrant connection
        qdrant_client.get_collection(COLLECTION_NAME)

        return {
            "status": "healthy",
            "timestamp": datetime.utcnow().isoformat(),
            "dependencies": {
                "qdrant": "connected",
                "cohere": "initialized"
            }
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Service unhealthy: {str(e)}"
        )
