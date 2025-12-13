# Quickstart Guide: Frontend-Backend Integration

**Feature**: Chat Widget for RAG-Powered Textbook
**Audience**: Developers integrating the chat widget into Docusaurus site
**Time to Complete**: ~30 minutes

## Prerequisites

- Docusaurus 2.x site already set up and running
- FastAPI backend with RAG system deployed (or running locally)
- Node.js 16+ and npm/yarn installed
- Basic familiarity with React and TypeScript

---

## Part 1: Backend Setup (CORS Configuration)

### Step 1: Install CORS Middleware (if not already installed)

FastAPI includes CORS middleware by default - no installation needed.

### Step 2: Configure CORS in FastAPI

Edit your `backend/main.py` (or wherever your FastAPI app is defined):

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI()

# Configure CORS
origins = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # List of allowed origins
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type"],
)
```

### Step 3: Set Environment Variables

Create or edit `.env` file in backend directory:

```bash
# Development
CORS_ORIGINS=http://localhost:3000

# Production (comma-separated for multiple origins)
# CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

### Step 4: Test CORS Configuration

Run backend locally:
```bash
cd backend
uvicorn main:app --reload
```

Test CORS from browser console (on http://localhost:3000):
```javascript
fetch('http://localhost:8000/api/chat/query', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ question: 'test' })
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
```

If you see response (not CORS error), backend is configured correctly! ✅

---

## Part 2: Frontend Setup (Chat Widget)

### Step 1: Create Component Files

In your Docusaurus project, create these files:

```bash
frontend/src/
├── components/
│   └── ChatWidget/
│       ├── ChatWidget.tsx
│       ├── ChatMessage.tsx
│       ├── ChatInput.tsx
│       ├── ErrorDisplay.tsx
│       ├── chatService.ts
│       └── ChatWidget.module.css
├── hooks/
│   └── useChat.ts
└── types/
    └── chat.ts
```

### Step 2: Define TypeScript Types

`frontend/src/types/chat.ts`:

```typescript
export interface ChatMessage {
  id: string;
  type: 'user' | 'assistant' | 'error';
  content: string;
  sources: Source[] | null;
  timestamp: Date;
  status: 'pending' | 'completed' | 'failed';
}

export interface Source {
  title: string;
  url: string;
  relevanceScore: number;
}

export interface ErrorState {
  type: 'network' | 'timeout' | 'backend' | 'validation';
  message: string;
  retryable: boolean;
  originalQuery: string | null;
}

export interface BackendConfig {
  baseURL: string;
  timeout: number;
}
```

### Step 3: Implement API Service

`frontend/src/components/ChatWidget/chatService.ts`:

```typescript
import type { BackendConfig, ErrorState } from '@site/src/types/chat';

export interface ChatResponse {
  answer: string;
  sources: Array<{
    title: string;
    url: string;
    relevance_score: number;
  }> | null;
  timestamp: string;
}

export async function sendQuery(
  question: string,
  config: BackendConfig
): Promise<ChatResponse> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.timeout);

  try {
    const response = await fetch(`${config.baseURL}/api/chat/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Server error');
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeout);
    throw error;
  }
}

export function validateQuery(question: string): { valid: boolean; error?: string } {
  const trimmed = question.trim();

  if (trimmed.length === 0) {
    return { valid: false, error: 'Question cannot be empty' };
  }

  if (trimmed.length > 10000) {
    return { valid: false, error: 'Question is too long (max 10,000 characters)' };
  }

  return { valid: true };
}

export function categorizeError(error: unknown): ErrorState {
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return {
      type: 'network',
      message: 'Connection failed. Please check your internet connection.',
      retryable: true,
      originalQuery: null,
    };
  }

  if (error.name === 'AbortError') {
    return {
      type: 'timeout',
      message: 'Request timed out. Please try again.',
      retryable: true,
      originalQuery: null,
    };
  }

  return {
    type: 'backend',
    message: error instanceof Error ? error.message : 'An unexpected error occurred',
    retryable: true,
    originalQuery: null,
  };
}
```

### Step 4: Implement Custom Hook

`frontend/src/hooks/useChat.ts`:

```typescript
import { useState } from 'react';
import type { ChatMessage, ErrorState, BackendConfig } from '@site/src/types/chat';
import { sendQuery, validateQuery, categorizeError } from '@site/src/components/ChatWidget/chatService';

export function useChat(config: BackendConfig) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ErrorState | null>(null);

  const sendMessage = async (question: string) => {
    // Validate
    const validation = validateQuery(question);
    if (!validation.valid) {
      setError({
        type: 'validation',
        message: validation.error!,
        retryable: false,
        originalQuery: null,
      });
      return;
    }

    // Create user message
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      type: 'user',
      content: question,
      sources: null,
      timestamp: new Date(),
      status: 'pending',
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const response = await sendQuery(question, config);

      // Create assistant message
      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        type: 'assistant',
        content: response.answer,
        sources: response.sources?.map(s => ({
          title: s.title,
          url: s.url,
          relevanceScore: s.relevance_score,
        })) || null,
        timestamp: new Date(response.timestamp),
        status: 'completed',
      };

      setMessages(prev => [
        ...prev.map(m => m.id === userMessage.id ? { ...m, status: 'completed' as const } : m),
        assistantMessage,
      ]);
    } catch (err) {
      const errorState = categorizeError(err);
      errorState.originalQuery = question;

      setError(errorState);
      setMessages(prev =>
        prev.map(m => m.id === userMessage.id ? { ...m, status: 'failed' as const } : m)
      );
    } finally {
      setIsLoading(false);
    }
  };

  const retryLast = () => {
    if (error?.originalQuery) {
      sendMessage(error.originalQuery);
    }
  };

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    retryLast,
    clearError: () => setError(null),
  };
}
```

### Step 5: Implement ChatWidget Component (Minimal Example)

`frontend/src/components/ChatWidget/ChatWidget.tsx`:

```tsx
import React, { useState } from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { useChat } from '@site/src/hooks/useChat';
import styles from './ChatWidget.module.css';

export default function ChatWidget() {
  const { siteConfig } = useDocusaurusContext();
  const backendURL = siteConfig.customFields?.backendURL as string || 'http://localhost:8000';

  const [isCollapsed, setIsCollapsed] = useState(true);
  const [inputValue, setInputValue] = useState('');

  const { messages, isLoading, error, sendMessage, retryLast, clearError } = useChat({
    baseURL: backendURL,
    timeout: 30000,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      sendMessage(inputValue);
      setInputValue('');
    }
  };

  if (isCollapsed) {
    return (
      <button className={styles.toggleButton} onClick={() => setIsCollapsed(false)}>
        💬
      </button>
    );
  }

  return (
    <div className={styles.widget}>
      <div className={styles.header}>
        <span>AI Assistant</span>
        <button onClick={() => setIsCollapsed(true)}>✕</button>
      </div>

      <div className={styles.messages}>
        {messages.map(msg => (
          <div key={msg.id} className={styles[msg.type]}>
            <div>{msg.content}</div>
            {msg.sources && msg.sources.length > 0 && (
              <div className={styles.sources}>
                <strong>Sources:</strong>
                <ul>
                  {msg.sources
                    .filter(s => s.relevanceScore >= 0.3)
                    .sort((a, b) => b.relevanceScore - a.relevanceScore)
                    .map((source, i) => (
                      <li key={i}>
                        <a href={source.url}>{source.title}</a>
                      </li>
                    ))}
                </ul>
              </div>
            )}
          </div>
        ))}
        {isLoading && <div className={styles.loading}>Thinking...</div>}
      </div>

      {error && (
        <div className={styles.error}>
          {error.message}
          {error.retryable && (
            <button onClick={retryLast}>Retry</button>
          )}
          <button onClick={clearError}>✕</button>
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.inputForm}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ask a question..."
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading || !inputValue.trim()}>
          Send
        </button>
      </form>
    </div>
  );
}
```

### Step 6: Add Basic Styling

`frontend/src/components/ChatWidget/ChatWidget.module.css`:

```css
.toggleButton {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 60px;
  height: 60px;
  border-radius: 30px;
  border: none;
  background: #007bff;
  color: white;
  font-size: 24px;
  cursor: pointer;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.widget {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 400px;
  height: 600px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  z-index: 1000;
}

.header {
  padding: 16px;
  background: #007bff;
  color: white;
  border-radius: 12px 12px 0 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header button {
  background: none;
  border: none;
  color: white;
  font-size: 20px;
  cursor: pointer;
}

.messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.user {
  align-self: flex-end;
  background: #007bff;
  color: white;
  padding: 12px;
  border-radius: 12px;
  max-width: 70%;
}

.assistant {
  align-self: flex-start;
  background: #f1f3f5;
  padding: 12px;
  border-radius: 12px;
  max-width: 70%;
}

.sources {
  margin-top: 8px;
  font-size: 0.9em;
}

.sources ul {
  margin: 4px 0;
  padding-left: 20px;
}

.loading {
  align-self: flex-start;
  font-style: italic;
  color: #666;
}

.error {
  padding: 12px;
  background: #fef2f2;
  border: 1px solid #fca5a5;
  border-radius: 8px;
  margin: 0 16px;
  display: flex;
  gap: 8px;
  align-items: center;
}

.inputForm {
  display: flex;
  gap: 8px;
  padding: 16px;
  border-top: 1px solid #e5e7eb;
}

.inputForm input {
  flex: 1;
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
}

.inputForm button {
  padding: 12px 24px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
}

.inputForm button:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}
```

### Step 7: Integrate Widget Globally

Swizzle the Root component:

```bash
npm run swizzle @docusaurus/theme-classic Root -- --wrap
```

Edit `src/theme/Root.tsx`:

```tsx
import React from 'react';
import ChatWidget from '@site/src/components/ChatWidget/ChatWidget';

export default function Root({children}) {
  return (
    <>
      {children}
      <ChatWidget />
    </>
  );
}
```

### Step 8: Configure Backend URL

Edit `docusaurus.config.js`:

```js
module.exports = {
  // ... existing config
  customFields: {
    backendURL: process.env.BACKEND_URL || 'http://localhost:8000',
  },
};
```

Create `.env` files:

`.env.development`:
```
BACKEND_URL=http://localhost:8000
```

`.env.production`:
```
BACKEND_URL=https://api.yourdomain.com
```

---

## Part 3: Testing

### Test Locally

1. Start backend:
```bash
cd backend
uvicorn main:app --reload
```

2. Start frontend:
```bash
cd frontend
npm start
```

3. Open http://localhost:3000
4. Click chat widget button (bottom-right)
5. Type a question and press Enter
6. Verify response appears with sources

### Test Error Scenarios

**Network Error**:
- Stop backend server
- Try sending a message
- Should see "Connection failed" error with Retry button

**Timeout**:
- Modify backend to sleep 35 seconds before responding
- Send message
- Should see "Request timed out" error

**Validation Error**:
- Try sending empty message
- Should see "Question cannot be empty" error (no retry button)

---

## Part 4: Production Deployment

### Frontend Build

```bash
cd frontend
BACKEND_URL=https://api.yourdomain.com npm run build
```

Deploy `build/` directory to hosting (GitHub Pages, Netlify, Vercel, etc.)

### Backend Deployment

Set production CORS origins:

```bash
export CORS_ORIGINS="https://yourdomain.com,https://www.yourdomain.com"
```

Deploy FastAPI backend (Docker, AWS Lambda, etc.)

---

## Troubleshooting

### Issue: CORS Errors in Browser Console

**Symptom**: `Access-Control-Allow-Origin` error

**Solution**:
1. Check backend CORS_ORIGINS includes your frontend domain
2. Verify backend is running and accessible
3. Check browser dev tools Network tab → Options preflight request succeeds
4. Clear browser cache and reload

### Issue: Widget Not Appearing

**Symptom**: No chat button visible

**Solution**:
1. Check Root.tsx swizzled correctly (`npm run swizzle` output)
2. Verify ChatWidget imported in Root.tsx
3. Check browser console for errors
4. Inspect with dev tools - widget should have z-index: 1000

### Issue: Responses Not Appearing

**Symptom**: Loading indicator shows but no response

**Solution**:
1. Check browser console for errors
2. Verify backend URL in customFields
3. Check Network tab - request should POST to correct URL
4. Verify backend returns correct JSON structure (answer, sources, timestamp)

### Issue: Sources Not Clickable

**Symptom**: Source links don't navigate

**Solution**:
1. Check source URLs are correct (relative or absolute)
2. Verify `<a href={source.url}>` not missing
3. Check CSS not blocking pointer events

---

## Next Steps

**Enhancements**:
- Add markdown rendering for responses
- Persist conversation in localStorage
- Add voice input capability
- Implement conversation history UI
- Add typing indicator animation
- Mobile-responsive layout improvements

**Production Checklist**:
- [ ] Backend CORS configured for production domain
- [ ] Environment variables set correctly
- [ ] Widget tested in production build
- [ ] Accessibility tested (keyboard navigation)
- [ ] Performance tested (Lighthouse score)
- [ ] Error handling tested (all scenarios)

---

## Support

For issues or questions:
- Check [backend-api.md](./contracts/backend-api.md) for API contract
- Check [chat-widget.md](./contracts/chat-widget.md) for component specs
- Review [data-model.md](./data-model.md) for type definitions
- Consult Docusaurus docs: https://docusaurus.io

**Time to Complete**: ✅ ~30 minutes (faster if backend already has chat endpoint!)
