"""Pydantic models package"""

try:
    from backend.models.chat_models import ChatRequest, ChatResponse, SourceResponse
except ModuleNotFoundError:
    from .chat_models import ChatRequest, ChatResponse, SourceResponse

__all__ = ["ChatRequest", "ChatResponse", "SourceResponse"]
