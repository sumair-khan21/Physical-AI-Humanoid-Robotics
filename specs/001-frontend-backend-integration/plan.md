# Implementation Plan: Frontend-Backend Integration for RAG Chatbot

**Branch**: `001-frontend-backend-integration` | **Date**: 2025-12-12 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-frontend-backend-integration/spec.md`

## Summary

Integrate the FastAPI RAG backend with the Docusaurus frontend to enable users to ask questions and receive AI-powered answers directly inside the published textbook. Primary requirement: Create a chat interface (React component) that sends user queries to a backend endpoint, displays responses with source citations, handles errors gracefully, and works across localhost and production environments with proper CORS configuration.

## Technical Context

**Language/Version**:
- Frontend: TypeScript 4.9+ with React 18+ (Docusaurus 2.x requirement)
- Backend: Python 3.12+ with FastAPI (existing backend)

**Primary Dependencies**:
- Frontend: React 18, Docusaurus 2.x, axios for HTTP (or fetch API)
- Backend: FastAPI, python-cors-middleware (for CORS)

**Storage**: N/A (chat state in-memory, no persistence required)

**Testing**:
- Frontend: Jest + React Testing Library (manual simulation tests for network errors)
- Backend: pytest for CORS endpoint testing (assuming existing test infrastructure)

**Target Platform**:
- Frontend: Modern browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- Backend: Linux server (existing FastAPI deployment)

**Project Type**: Web application (frontend + backend)

**Performance Goals**:
- Chat widget loads <1 second
- 95% of queries complete <5 seconds (network + backend processing)
- UI remains responsive during concurrent queries

**Constraints**:
- No design-heavy UI - functional integration only
- No persistence - session-based chat history only
- Backend endpoint URL configurable via environment variables
- CORS must work for localhost:3000 (dev) and production domain

**Scale/Scope**:
- Single chat widget component (~300-500 LOC)
- 1 backend endpoint integration
- 3 environment configurations (local, staging, production)
- Expected concurrent users: <100 (low-traffic educational site)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Evaluation Against Physical AI Textbook Constitution

**I. Content Accuracy & Technical Rigor**: ✅ PASS
- Feature integrates with existing backend (no new technical claims)
- Code examples will be tested and functional
- Dependencies versioned (React 18, Docusaurus 2.x, FastAPI)

**II. Educational Clarity & Accessibility**: ✅ PASS
- Chat interface enhances textbook accessibility (users can ask questions)
- No new educational content to validate - purely integration feature
- Alt text requirement noted for any UI elements

**III. Consistency & Standards**: ✅ PASS
- React component follows Docusaurus plugin/component conventions
- TypeScript for type safety (standard for Docusaurus sites)
- Code formatting: Prettier (standard for React/TS projects)

**IV. Docusaurus Structure & Quality**: ✅ PASS
- Chat widget integrates as Docusaurus component (theme component or plugin)
- No new pages - widget accessible from all pages
- Metadata: Component documented in quickstart.md

**V. Code Example Quality**: ✅ PASS
- Integration code will be complete and runnable
- Dependencies listed with versions
- Comments explain integration points (not React syntax)

**VI. Deployment & Publishing Standards**: ✅ PASS
- Build gates apply: Docusaurus must build without errors
- CORS configuration documented for deployment
- Performance targets met (widget load <1s)

**Constitution Compliance**: ✅ ALL GATES PASS - Proceed to Phase 0

## Project Structure

### Documentation (this feature)

```text
specs/001-frontend-backend-integration/
├── spec.md              # Feature specification (completed)
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (decisions on axios vs fetch, CORS patterns, etc.)
├── data-model.md        # Phase 1 output (frontend state model)
├── quickstart.md        # Phase 1 output (integration guide)
├── contracts/           # Phase 1 output (API contract, component props)
│   ├── backend-api.md   # FastAPI endpoint contract
│   └── chat-widget.md   # React component interface
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
# Option 2: Web application (frontend + backend integration)

backend/
├── main.py               # Existing FastAPI app
├── routers/
│   └── chat.py           # NEW: Chat endpoint with CORS middleware
├── models/
│   └── chat_models.py    # NEW: Request/Response Pydantic models
└── tests/
    └── test_chat_cors.py # NEW: CORS integration tests

frontend/
├── src/
│   ├── components/
│   │   └── ChatWidget/
│   │       ├── ChatWidget.tsx        # NEW: Main chat component
│   │       ├── ChatMessage.tsx       # NEW: Message display component
│   │       ├── ChatInput.tsx         # NEW: Input field component
│   │       ├── ErrorDisplay.tsx      # NEW: Error handling component
│   │       └── chatService.ts        # NEW: API communication service
│   ├── hooks/
│   │   └── useChat.ts                # NEW: Custom hook for chat state
│   └── types/
│       └── chat.ts                   # NEW: TypeScript interfaces
├── docusaurus.config.js              # MODIFIED: Add chat widget to theme
├── .env.example                      # NEW: Backend URL template
└── tests/
    └── components/
        └── ChatWidget.test.tsx       # NEW: Component tests

# Environment configuration files
.env.development    # NEW: Localhost backend URL
.env.production     # NEW: Production backend URL
```

**Structure Decision**: Web application structure selected because feature integrates a React frontend (Docusaurus) with a FastAPI backend. Frontend code lives in Docusaurus site structure. Backend adds a single new router endpoint with CORS middleware. Clear separation enables independent testing of frontend (component tests) and backend (CORS configuration tests).

## Complexity Tracking

> **No constitution violations** - all gates passed. No complexity justification required.

---

## Phase 0: Research & Design Decisions

### Research Tasks

1. **HTTP Client Choice** (axios vs fetch API)
   - Decision needed: Which client to use for backend requests
   - Research: Docusaurus best practices, browser compatibility, error handling patterns

2. **CORS Configuration Pattern**
   - Decision needed: How to configure CORS in FastAPI (middleware vs decorator)
   - Research: FastAPI CORS best practices, origin whitelisting patterns, preflight handling

3. **Chat State Management**
   - Decision needed: React useState vs useReducer vs Context API
   - Research: Best practices for local state in Docusaurus components

4. **Error Handling Strategy**
   - Decision needed: Error types to distinguish (network, timeout, backend error)
   - Research: User-friendly error messages, retry patterns

5. **Environment Configuration**
   - Decision needed: How to inject backend URL into Docusaurus build
   - Research: Docusaurus environment variables, build-time vs runtime config

6. **Docusaurus Component Integration**
   - Decision needed: Theme component vs plugin vs swizzled component
   - Research: Docusaurus component override patterns, global availability

### Output: research.md

Document 6 design decisions with:
- What was chosen
- Rationale (why this approach)
- Alternatives considered (what else evaluated)

---

## Phase 1: Data Models & Contracts

### Data Models (data-model.md)

Based on Key Entities from spec:

1. **ChatMessage** (frontend TypeScript interface)
   - id: string (UUID)
   - type: 'user' | 'assistant' | 'error'
   - content: string
   - sources: Source[] | null
   - timestamp: Date
   - status: 'pending' | 'completed' | 'failed'

2. **Source** (source citation)
   - title: string
   - url: string
   - relevanceScore: number

3. **ChatState** (React state model)
   - messages: ChatMessage[]
   - isLoading: boolean
   - error: ErrorState | null
   - inputValue: string

4. **ErrorState**
   - type: 'network' | 'timeout' | 'backend' | 'validation'
   - message: string (user-friendly)
   - retryable: boolean
   - originalQuery: string | null

5. **BackendConfig** (environment configuration)
   - baseURL: string
   - timeout: number (milliseconds)
   - maxRetries: number

### API Contracts (contracts/)

**backend-api.md**: FastAPI Endpoint Specification

```
POST /api/chat/query
Content-Type: application/json

Request:
{
  "question": string (1-10000 chars, non-empty after trim)
}

Response (200 OK):
{
  "answer": string,
  "sources": [
    {
      "title": string,
      "url": string,
      "relevance_score": number (0.0-1.0)
    }
  ] | null,
  "timestamp": string (ISO 8601)
}

Error Response (4xx, 5xx):
{
  "detail": string
}

CORS Headers:
- Access-Control-Allow-Origin: http://localhost:3000, https://yourdomain.com
- Access-Control-Allow-Methods: POST, OPTIONS
- Access-Control-Allow-Headers: Content-Type
```

**chat-widget.md**: React Component Interface

```tsx
// ChatWidget.tsx - Main component
interface ChatWidgetProps {
  backendURL?: string;  // Optional override for backend URL
  timeout?: number;     // Optional timeout in ms (default 30000)
  position?: 'bottom-right' | 'bottom-left';  // Widget position
}

// ChatMessage.tsx - Message display
interface ChatMessageProps {
  message: ChatMessage;
  onSourceClick: (url: string) => void;
}

// ChatInput.tsx - Input field
interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (question: string) => void;
  disabled: boolean;
  placeholder?: string;
}

// ErrorDisplay.tsx - Error handling
interface ErrorDisplayProps {
  error: ErrorState;
  onRetry: () => void;
  onDismiss: () => void;
}

// chatService.ts - API service
export async function sendQuery(
  question: string,
  config: BackendConfig
): Promise<ChatResponse>;

export function validateQuery(question: string): {
  valid: boolean;
  error?: string;
};
```

### Quickstart Guide (quickstart.md)

**Content**:
1. Installation: How to integrate chat widget into existing Docusaurus site
2. Configuration: Setting backend URL via environment variables
3. Usage: Basic example of widget rendering
4. CORS Setup: Backend configuration for local + production
5. Testing: How to test locally with mocked backend
6. Troubleshooting: Common issues (CORS errors, timeouts, etc.)

### Agent Context Update

Run: `.specify/scripts/bash/update-agent-context.sh claude`

Updates `.claude/context.md` with:
- React 18, TypeScript, Docusaurus 2.x
- FastAPI CORS middleware
- axios (if chosen) or fetch API
- Jest, React Testing Library

---

## Phase 2: Constitution Re-Check

*Re-evaluate after Phase 1 design completion*

**Expected Result**: ✅ ALL GATES PASS (no new concerns introduced by design)

**Potential Concerns to Verify**:
- Code examples in quickstart.md are complete and tested
- Component interfaces fully typed (TypeScript)
- CORS configuration documented with safety warnings
- Performance: Widget bundle size <100KB (check after implementation)

---

## Delivery Plan

**Phase 0 Output** (research.md):
- 6 design decisions documented
- All NEEDS CLARIFICATION resolved

**Phase 1 Output**:
- data-model.md: 5 entities with TypeScript interfaces
- contracts/backend-api.md: OpenAPI-style endpoint spec
- contracts/chat-widget.md: React component interfaces
- quickstart.md: Integration guide with code examples
- .claude/context.md: Updated with technology stack

**Phase 2**:
- Run `/sp.tasks` to generate implementation task breakdown
- Tasks will organize by user story (P1: Query Display, P2: Error Handling, P3: CORS)

**Success Criteria**:
- All research decisions documented with rationale
- All contracts specify validation rules and error cases
- Quickstart guide enables developer to integrate widget in <30 minutes
- Constitution check passes on re-evaluation
