# Research & Design Decisions: Frontend-Backend Integration

**Feature**: Frontend-Backend Integration for RAG Chatbot
**Date**: 2025-12-12
**Phase**: 0 - Research

## Decision 1: HTTP Client Choice

**Decision**: Use native **Fetch API** with custom error handling wrapper

**Rationale**:
- Fetch API is natively supported in all modern browsers (no external dependency)
- Docusaurus builds are already large - avoiding axios saves ~13KB gzipped
- TypeScript typing for fetch is built-in and well-maintained
- Sufficient for single endpoint integration (not building a complex API client)
- Async/await pattern maps cleanly to React hooks

**Alternatives Considered**:
1. **axios** (rejected):
   - ✗ Adds dependency and bundle size (~13KB gzipped)
   - ✓ Better default error handling and timeout support
   - ✓ Automatic JSON transformation
   - Rejected because: Bundle size matters for educational site performance, and we can replicate axios benefits with ~20 LOC wrapper

2. **ky** (rejected):
   - ✗ Another external dependency (~6KB)
   - ✓ Modern fetch wrapper with retries and timeouts
   - Rejected because: Overkill for single endpoint, can implement needed features ourselves

**Implementation Approach**:
- Create `chatService.ts` with `fetchWithTimeout()` wrapper
- Handle AbortController for timeout implementation
- Centralize error transformation (network → user-friendly messages)

---

## Decision 2: CORS Configuration Pattern

**Decision**: Use **FastAPI CORSMiddleware** with environment-based origin whitelist

**Rationale**:
- CORSMiddleware is FastAPI's recommended approach (official docs)
- Supports dynamic origin configuration via environment variables
- Handles preflight OPTIONS requests automatically
- Works globally for all endpoints (simpler than per-route decorators)
- Environment-based origins enable different configs for dev/staging/prod

**Alternatives Considered**:
1. **Manual CORS headers per route** (rejected):
   - ✗ Must manually handle OPTIONS preflight
   - ✗ Repetitive code across endpoints
   - ✓ More granular control
   - Rejected because: Single endpoint doesn't need per-route control, middleware cleaner

2. **Third-party CORS library** (rejected):
   - ✗ Unnecessary when FastAPI has built-in solution
   - Rejected because: FastAPI's middleware is production-ready and well-tested

**Implementation Approach**:
```python
from fastapi.middleware.cors import CORSMiddleware

# In main.py
origins = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=["POST", "GET", "OPTIONS"],
    allow_headers=["Content-Type"],
)
```

---

## Decision 3: Chat State Management

**Decision**: Use **useState + custom useChat hook** (no Context API)

**Rationale**:
- State is local to ChatWidget component (not shared across app)
- Custom hook encapsulates state logic and keeps component clean
- useState sufficient for simple state (messages array + loading + error)
- No performance concerns (not rendering thousands of messages)
- Easier to test hook logic independently

**Alternatives Considered**:
1. **useReducer** (rejected):
   - ✓ Better for complex state transitions
   - ✗ Overkill for simple message array management
   - Rejected because: State logic is straightforward (add message, set loading, set error)

2. **Context API** (rejected):
   - ✗ Not needed - state not shared between components
   - ✗ Adds unnecessary complexity
   - Rejected because: Single widget owns all chat state

3. **External state library (Zustand, Redux)** (rejected):
   - ✗ Massive overkill for local widget state
   - ✗ Additional dependencies
   - Rejected because: No cross-component state sharing needed

**Implementation Approach**:
```tsx
// useChat.ts custom hook
function useChat(config: BackendConfig) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ErrorState | null>(null);

  const sendMessage = async (question: string) => { /* ... */ };
  const retryLast = () => { /* ... */ };

  return { messages, isLoading, error, sendMessage, retryLast };
}
```

---

## Decision 4: Error Handling Strategy

**Decision**: **Four-tier error classification** with retry capability

**Error Types**:
1. **Validation errors**: Empty query, too long → User-facing message, no retry
2. **Network errors**: fetch() rejects → "Connection failed. Check your internet." + Retry button
3. **Timeout errors**: AbortController triggers → "Request timed out. Try again." + Retry button
4. **Backend errors**: 4xx/5xx responses → Parse error.detail or generic message + Retry button

**Rationale**:
- Clear distinction helps users understand what went wrong
- Validation errors prevent unnecessary API calls
- Network/timeout errors always retryable (transient failures)
- Backend errors retryable (might be temporary backend issue)
- Preserves original query for retry (no re-typing needed)

**Alternatives Considered**:
1. **Generic error messages** (rejected):
   - ✗ Less helpful to users ("Something went wrong")
   - Rejected because: Spec requires user-friendly, specific messages

2. **Exponential backoff retries** (rejected):
   - ✓ Better for production resilience
   - ✗ Complexity not needed for educational site (low traffic)
   - Rejected because: Manual retry sufficient, auto-retry could spam backend

**Implementation Approach**:
```tsx
function categorizeError(error: unknown): ErrorState {
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return {
      type: 'network',
      message: 'Connection failed. Please check your internet connection.',
      retryable: true,
    };
  }
  if (error.name === 'AbortError') {
    return {
      type: 'timeout',
      message: 'Request timed out. Please try again.',
      retryable: true,
    };
  }
  // ... backend errors
}
```

---

## Decision 5: Environment Configuration

**Decision**: **Build-time environment variables** via Docusaurus config

**Rationale**:
- Docusaurus supports `customFields` in `docusaurus.config.js`
- Values injected at build time from process.env
- No runtime configuration needed (backend URL doesn't change per user)
- Simple access via `useDocusaurusContext()`
- Supports different values for dev/staging/prod builds

**Alternatives Considered**:
1. **Runtime configuration (public JSON file)** (rejected):
   - ✓ Can change without rebuild
   - ✗ Extra HTTP request on page load
   - ✗ Security risk (exposes config to tampering)
   - Rejected because: Backend URL is static per environment, no need for runtime changes

2. **Hardcoded URLs with conditional logic** (rejected):
   - ✗ Not configurable per deployment
   - ✗ Requires code changes for new environments
   - Rejected because: Violates spec requirement for configurable endpoint

**Implementation Approach**:
```js
// docusaurus.config.js
module.exports = {
  customFields: {
    backendURL: process.env.BACKEND_URL || 'http://localhost:8000',
  },
};

// In ChatWidget.tsx
const { siteConfig } = useDocusaurusContext();
const backendURL = siteConfig.customFields.backendURL as string;
```

**Environment files**:
- `.env.development`: `BACKEND_URL=http://localhost:8000`
- `.env.production`: `BACKEND_URL=https://api.yourdomain.com`

---

## Decision 6: Docusaurus Component Integration

**Decision**: **Swizzle Root component** and inject ChatWidget globally

**Rationale**:
- Swizzling `@theme/Root` lets us wrap entire app with custom components
- ChatWidget available on all pages without modifying each page
- Clean integration point (Docusaurus recommended pattern for global UI)
- No plugin development needed (simpler than custom plugin)
- Component tree: Root → ChatWidget → (rest of Docusaurus layout)

**Alternatives Considered**:
1. **Custom Docusaurus plugin** (rejected):
   - ✓ More "official" way to extend Docusaurus
   - ✗ Overkill for single component
   - ✗ Requires plugin API knowledge and boilerplate
   - Rejected because: Swizzling Root is simpler and officially supported

2. **Manually add to each MDX page** (rejected):
   - ✗ Repetitive and error-prone
   - ✗ Doesn't scale (every page needs `<ChatWidget />`)
   - Rejected because: Violates spec requirement "accessible from any page"

3. **CSS-only overlay (no swizzling)** (rejected):
   - ✗ Can't inject React component via pure CSS
   - Rejected because: Need React component, not just styling

**Implementation Approach**:
```bash
# Swizzle Root component
npm run swizzle @docusaurus/theme-classic Root -- --wrap

# In src/theme/Root.tsx
import ChatWidget from '@site/src/components/ChatWidget';

export default function Root({children}) {
  return (
    <>
      {children}
      <ChatWidget position="bottom-right" />
    </>
  );
}
```

---

## Research Summary

**Decisions Made**: 6 of 6
**Dependencies Added**:
- Frontend: None (using native Fetch API, Docusaurus built-ins)
- Backend: fastapi.middleware.cors.CORSMiddleware (already in FastAPI)

**Technology Stack Finalized**:
- Frontend: React 18, TypeScript, Docusaurus 2.x, Fetch API
- Backend: FastAPI, CORSMiddleware, Pydantic models
- State Management: React useState + custom hook
- Testing: Jest, React Testing Library

**All NEEDS CLARIFICATION Resolved**: ✅ Yes

**Next Phase**: Generate data models and API contracts
