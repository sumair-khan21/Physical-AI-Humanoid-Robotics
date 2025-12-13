"""
Pydantic models for chat endpoint

Defines request/response models for the /api/chat/query endpoint.
Matches the frontend TypeScript interfaces and backend API contract.
"""

from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    """Request model for chat queries"""

    question: str = Field(
        ...,
        min_length=1,
        max_length=10000,
        description="User's question to the RAG system",
        examples=["What is semantic search?"]
    )

    class Config:
        json_schema_extra = {
            "example": {
                "question": "What is semantic search?"
            }
        }


class SourceResponse(BaseModel):
    """Source citation from RAG retrieval"""

    title: str = Field(
        ...,
        description="Title of the source document/section",
        examples=["Introduction to Semantic Search"]
    )

    url: str = Field(
        ...,
        description="URL to the source (absolute or relative)",
        examples=["/docs/search/semantic-intro"]
    )

    relevance_score: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="Relevance score from RAG system (0.0 to 1.0)",
        examples=[0.92]
    )

    class Config:
        json_schema_extra = {
            "example": {
                "title": "Introduction to Semantic Search",
                "url": "/docs/search/semantic-intro",
                "relevance_score": 0.92
            }
        }


class ChatResponse(BaseModel):
    """Response model for chat queries"""

    answer: str = Field(
        ...,
        description="Generated answer from RAG system",
        examples=["Semantic search uses vector embeddings to find relevant content..."]
    )

    sources: Optional[List[SourceResponse]] = Field(
        None,
        description="Source citations (null if no sources found)",
        examples=[[
            {
                "title": "Introduction to Semantic Search",
                "url": "/docs/search/semantic-intro",
                "relevance_score": 0.92
            }
        ]]
    )

    timestamp: str = Field(
        default_factory=lambda: datetime.utcnow().isoformat(),
        description="Response generation timestamp (ISO 8601 format)",
        examples=["2025-12-12T10:30:45.123456"]
    )

    class Config:
        json_schema_extra = {
            "example": {
                "answer": "Semantic search uses vector embeddings to find relevant content...",
                "sources": [
                    {
                        "title": "Introduction to Semantic Search",
                        "url": "/docs/search/semantic-intro",
                        "relevance_score": 0.92
                    }
                ],
                "timestamp": "2025-12-12T10:30:45.123456"
            }
        }
