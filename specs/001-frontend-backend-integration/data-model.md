# Data Models: Frontend-Backend Integration

**Feature**: Frontend-Backend Integration for RAG Chatbot
**Date**: 2025-12-12
**Phase**: 1 - Design

## Frontend TypeScript Interfaces

### ChatMessage

Represents a single message in the chat interface (user query or assistant response).

```typescript
interface ChatMessage {
  /** Unique identifier for this message (UUID v4) */
  id: string;

  /** Message type */
  type: 'user' | 'assistant' | 'error';

  /** Message content (question or answer text) */
  content: string;

  /** Source citations (only for assistant messages) */
  sources: Source[] | null;

  /** When this message was created */
  timestamp: Date;

  /** Current status of this message */
  status: 'pending' | 'completed' | 'failed';
}
```

**Validation Rules**:
- `id`: Must be valid UUID v4 format
- `content`: Non-empty string (1-50000 chars)
- `sources`: Null for user messages, may be empty array for assistant
- `timestamp`: Must be valid Date object
- `status`: 'pending' only for user messages waiting for response

**State Transitions**:
- User message: `pending` → `completed` (when assistant responds)
- User message: `pending` → `failed` (on error)
- Assistant message: Always created with `status: 'completed'`

---

### Source

Represents a source citation from the RAG backend.

```typescript
interface Source {
  /** Title of the source document/section */
  title: string;

  /** Absolute or relative URL to source content */
  url: string;

  /** Relevance score from RAG system (0.0-1.0) */
  relevanceScore: number;
}
```

**Validation Rules**:
- `title`: Non-empty string (1-200 chars)
- `url`: Valid URL format (starts with http://, https://, or / for relative)
- `relevanceScore`: Number in range [0.0, 1.0]

**Display Behavior**:
- Sources sorted by relevanceScore descending
- Only sources with relevanceScore ≥ 0.3 displayed (filter out low-relevance)
- Clicking source URL navigates in same tab if relative, new tab if external

---

### ChatState

Top-level state for the chat widget component.

```typescript
interface ChatState {
  /** All messages in current session (chronological order) */
  messages: ChatMessage[];

  /** Whether a request is currently in flight */
  isLoading: boolean;

  /** Current error state (null if no error) */
  error: ErrorState | null;

  /** Current text in input field */
  inputValue: string;
}
```

**Invariants**:
- `messages`: Ordered by timestamp ascending (oldest first)
- `isLoading`: True only when waiting for backend response
- `error`: Set to non-null when request fails, cleared when retry succeeds
- `inputValue`: Cleared after successful message send

**Derived State** (computed from ChatState):
- `lastUserMessage`: messages.filter(m => m.type === 'user').pop()
- `canRetry`: error !== null && error.retryable === true
- `canSend`: !isLoading && inputValue.trim().length > 0

---

### ErrorState

Represents an error that occurred during chat interaction.

```typescript
interface ErrorState {
  /** Type of error that occurred */
  type: 'network' | 'timeout' | 'backend' | 'validation';

  /** User-friendly error message */
  message: string;

  /** Whether this error can be retried */
  retryable: boolean;

  /** Original query that failed (for retry) */
  originalQuery: string | null;
}
```

**Error Type Meanings**:
- `network`: fetch() rejected, likely no internet connection
- `timeout`: Request exceeded timeout threshold (30s default)
- `backend`: Backend returned 4xx/5xx HTTP status
- `validation`: Client-side validation failed (empty query, too long, etc.)

**Validation Rules**:
- `message`: Non-empty string (1-500 chars)
- `retryable`: False for validation errors, true for others
- `originalQuery`: Non-null only if retryable is true

**Error Message Examples**:
- Network: "Connection failed. Please check your internet connection."
- Timeout: "Request timed out. The server took too long to respond."
- Backend: "Server error. Please try again later." (or parse backend error.detail)
- Validation: "Question cannot be empty." or "Question is too long (max 10,000 characters)."

---

### BackendConfig

Configuration for backend API communication.

```typescript
interface BackendConfig {
  /** Base URL for backend API (from environment) */
  baseURL: string;

  /** Request timeout in milliseconds */
  timeout: number;

  /** Maximum number of retry attempts (future - currently unused) */
  maxRetries: number;
}
```

**Default Values**:
```typescript
const DEFAULT_CONFIG: BackendConfig = {
  baseURL: '', // Injected from Docusaurus config
  timeout: 30000, // 30 seconds
  maxRetries: 0, // No automatic retries (manual retry only)
};
```

**Validation Rules**:
- `baseURL`: Valid URL (http:// or https://)
- `timeout`: Positive integer (1000-120000 ms)
- `maxRetries`: Non-negative integer (0-5)

---

## Backend Pydantic Models

### ChatRequest

Request payload for chat endpoint.

```python
from pydantic import BaseModel, Field, validator

class ChatRequest(BaseModel):
    """Request model for chat query endpoint."""

    question: str = Field(
        ...,
        min_length=1,
        max_length=10000,
        description="User's question to the RAG system"
    )

    @validator('question')
    def question_not_empty_after_strip(cls, v):
        if not v.strip():
            raise ValueError('Question cannot be empty or whitespace only')
        return v.strip()

    class Config:
        schema_extra = {
            "example": {
                "question": "What is semantic search?"
            }
        }
```

---

### SourceResponse

Source citation in response.

```python
class SourceResponse(BaseModel):
    """Source citation from RAG retrieval."""

    title: str = Field(..., description="Title of source document/section")
    url: str = Field(..., description="URL to source content")
    relevance_score: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="Relevance score (0.0-1.0)"
    )

    class Config:
        schema_extra = {
            "example": {
                "title": "Introduction to Vector Databases",
                "url": "/docs/intro/vector-databases",
                "relevance_score": 0.87
            }
        }
```

---

### ChatResponse

Response payload for chat endpoint.

```python
from datetime import datetime
from typing import List, Optional

class ChatResponse(BaseModel):
    """Response model for chat query endpoint."""

    answer: str = Field(..., description="Generated answer from RAG system")
    sources: Optional[List[SourceResponse]] = Field(
        None,
        description="Source citations (null if no sources)"
    )
    timestamp: str = Field(
        default_factory=lambda: datetime.utcnow().isoformat(),
        description="Response timestamp (ISO 8601)"
    )

    class Config:
        schema_extra = {
            "example": {
                "answer": "Semantic search uses vector embeddings to find relevant documents based on meaning rather than exact keyword matches.",
                "sources": [
                    {
                        "title": "Semantic Search Basics",
                        "url": "/docs/search/semantic",
                        "relevance_score": 0.92
                    }
                ],
                "timestamp": "2025-12-12T10:30:45.123456"
            }
        }
```

---

## Data Flow Diagram

```
User Input (ChatWidget)
  ↓
validate(question) → ErrorState if invalid
  ↓
createUserMessage() → ChatMessage (status: pending)
  ↓
addToMessages(userMessage)
  ↓
sendQuery(question, config) → fetch POST /api/chat/query
  ↓
Backend: ChatRequest → RAG Pipeline → ChatResponse
  ↓
[Success Path]
  ↓
createAssistantMessage(response) → ChatMessage (status: completed, sources)
  ↓
addToMessages(assistantMessage)
  ↓
updateUserMessage(status: completed)

[Error Path]
  ↓
categorizeError(error) → ErrorState
  ↓
updateUserMessage(status: failed)
  ↓
setError(errorState)
```

---

## Persistence & Lifecycle

**Session Lifecycle**:
- Chat state created when widget mounts
- Messages persist in memory until page refresh
- No localStorage/sessionStorage (as per spec requirements)
- On page refresh: State resets, all messages lost

**Message ID Generation**:
- Use `crypto.randomUUID()` for browser-native UUID v4
- Fallback for older browsers: timestamp + random (not critical for collision resistance)

**Timestamp Handling**:
- Frontend: Store as JavaScript `Date` object
- Display: Format using `toLocaleTimeString()` or relative time ("2 minutes ago")
- Backend: Return ISO 8601 string, parse on frontend with `new Date(isoString)`

---

## TypeScript Type Guards

```typescript
/** Type guard for ChatMessage */
export function isChatMessage(value: unknown): value is ChatMessage {
  const msg = value as ChatMessage;
  return (
    typeof msg?.id === 'string' &&
    ['user', 'assistant', 'error'].includes(msg?.type) &&
    typeof msg?.content === 'string' &&
    msg?.timestamp instanceof Date &&
    ['pending', 'completed', 'failed'].includes(msg?.status)
  );
}

/** Type guard for Source */
export function isSource(value: unknown): value is Source {
  const src = value as Source;
  return (
    typeof src?.title === 'string' &&
    typeof src?.url === 'string' &&
    typeof src?.relevanceScore === 'number' &&
    src.relevanceScore >= 0 &&
    src.relevanceScore <= 1
  );
}
```

---

## Summary

**Frontend Models**: 5 TypeScript interfaces
- ChatMessage, Source, ChatState, ErrorState, BackendConfig

**Backend Models**: 3 Pydantic models
- ChatRequest, SourceResponse, ChatResponse

**Validation**: Client-side (TypeScript) + server-side (Pydantic)

**State Management**: Simple array-based message history with loading/error flags

**Next Phase**: Create API contracts and quickstart guide
