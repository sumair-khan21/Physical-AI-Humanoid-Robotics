# Frontend Component Contract: Chat Widget

**Feature**: Frontend-Backend Integration for RAG Chatbot
**Version**: 1.0
**Framework**: React 18 + TypeScript
**Platform**: Docusaurus 2.x

## Component Hierarchy

```
ChatWidget (main container)
  ├── ChatMessage[] (message list)
  │   └── Source[] (citation links)
  ├── ErrorDisplay (error state)
  └── ChatInput (user input)
```

---

## ChatWidget Component

Main container component that manages chat state and orchestrates child components.

### Interface

```typescript
interface ChatWidgetProps {
  /**
   * Override backend URL (optional)
   * Default: Loaded from Docusaurus config
   */
  backendURL?: string;

  /**
   * Request timeout in milliseconds (optional)
   * Default: 30000 (30 seconds)
   */
  timeout?: number;

  /**
   * Widget position on screen (optional)
   * Default: 'bottom-right'
   */
  position?: 'bottom-right' | 'bottom-left';

  /**
   * Initial collapsed state (optional)
   * Default: true (widget starts minimized)
   */
  initialCollapsed?: boolean;
}
```

### Usage Example

```tsx
import ChatWidget from '@site/src/components/ChatWidget';

// Default usage (in Root.tsx)
<ChatWidget />

// Custom configuration
<ChatWidget
  backendURL="https://api.example.com"
  timeout={60000}
  position="bottom-left"
  initialCollapsed={false}
/>
```

### State Management

**Internal State** (managed by `useChat` hook):
```typescript
{
  messages: ChatMessage[];
  isLoading: boolean;
  error: ErrorState | null;
  inputValue: string;
  isCollapsed: boolean;
}
```

**State Transitions**:
1. User types → `inputValue` updates
2. User submits → `isLoading: true`, add user message with `status: 'pending'`
3. Response received → `isLoading: false`, add assistant message, update user message `status: 'completed'`
4. Error occurred → `isLoading: false`, `error` set, update user message `status: 'failed'`
5. User retries → Clear `error`, repeat from step 2
6. User toggles widget → `isCollapsed` toggles

### Styling Requirements

**CSS Module** (`ChatWidget.module.css`):
- Fixed position (bottom-right or bottom-left based on prop)
- Z-index: 1000 (above Docusaurus content, below modals)
- Responsive: Hide on mobile (<768px) or collapse to icon only
- Transitions: Smooth expand/collapse animation (300ms)
- Dark mode support: Use CSS variables from Docusaurus theme

**Dimensions**:
- Collapsed: 60x60px button (floating action button style)
- Expanded: 400x600px panel (on desktop), full-screen on mobile

---

## ChatMessage Component

Displays a single message (user or assistant) with optional sources.

### Interface

```typescript
interface ChatMessageProps {
  /**
   * Message data to display
   */
  message: ChatMessage;

  /**
   * Callback when source link is clicked
   */
  onSourceClick: (url: string) => void;
}
```

### Usage Example

```tsx
<ChatMessage
  message={{
    id: '123',
    type: 'assistant',
    content: 'Semantic search uses vector embeddings...',
    sources: [
      { title: 'Intro to Search', url: '/docs/search', relevanceScore: 0.92 }
    ],
    timestamp: new Date(),
    status: 'completed'
  }}
  onSourceClick={(url) => window.location.href = url}
/>
```

### Rendering Rules

**Message Type Styling**:
- `user`: Right-aligned, light background
- `assistant`: Left-aligned, darker background
- `error`: Centered, red/warning styling

**Content Formatting**:
- Preserve newlines (use `white-space: pre-wrap`)
- Support basic markdown (optional enhancement)
- Linkify URLs automatically (optional enhancement)

**Sources Display**:
- Only show if `sources` is non-null and non-empty
- Filter sources with `relevanceScore < 0.3` (don't display low-relevance)
- Sort by `relevanceScore` descending
- Display as numbered list with clickable links
- Show relevance score as percentage (optional)

**Loading State**:
- If `status === 'pending'`, show typing indicator (animated dots)

---

## ChatInput Component

Text input field for user to enter questions.

### Interface

```typescript
interface ChatInputProps {
  /**
   * Current input value
   */
  value: string;

  /**
   * Callback when input changes
   */
  onChange: (value: string) => void;

  /**
   * Callback when user submits (Enter key or button click)
   */
  onSubmit: (question: string) => void;

  /**
   * Whether input is disabled (loading state)
   */
  disabled: boolean;

  /**
   * Placeholder text (optional)
   * Default: "Ask a question..."
   */
  placeholder?: string;

  /**
   * Maximum allowed characters (optional)
   * Default: 10000
   */
  maxLength?: number;
}
```

### Usage Example

```tsx
<ChatInput
  value={inputValue}
  onChange={setInputValue}
  onSubmit={handleSubmit}
  disabled={isLoading}
  placeholder="Ask about the textbook content..."
  maxLength={10000}
/>
```

### Behavior Spec

**Input Handling**:
- `Enter` key → submit (unless Shift+Enter for multi-line)
- `Shift+Enter` → add newline (multi-line input)
- Submit button → submit
- Auto-resize textarea height based on content (max 5 lines)

**Validation**:
- Trim whitespace before submit
- Block submission if empty after trim
- Show character count when >9000 characters (warning at 90%)
- Disable submit button when disabled prop is true

**Accessibility**:
- `aria-label="Chat input"`
- `aria-invalid` when validation fails
- Focus management: Auto-focus after message sent

---

## ErrorDisplay Component

Shows error messages with retry/dismiss actions.

### Interface

```typescript
interface ErrorDisplayProps {
  /**
   * Error state to display
   */
  error: ErrorState;

  /**
   * Callback when user clicks retry button
   */
  onRetry: () => void;

  /**
   * Callback when user dismisses error
   */
  onDismiss: () => void;
}
```

### Usage Example

```tsx
{error && (
  <ErrorDisplay
    error={error}
    onRetry={retryLastQuery}
    onDismiss={() => setError(null)}
  />
)}
```

### Rendering Rules

**Error Type Styling**:
- `network`: Yellow warning banner
- `timeout`: Yellow warning banner
- `backend`: Red error banner
- `validation`: Orange info banner

**Message Display**:
- Show `error.message` as primary text
- Icon based on type (⚠️ warning, ❌ error, ℹ️ info)
- Dismissible (X button in corner)

**Actions**:
- Show "Retry" button only if `error.retryable === true`
- Show "Dismiss" button always (X icon or text button)
- Retry button should be visually prominent (primary button style)

---

## chatService.ts (API Service)

Utility module for backend communication (not a component, but part of contract).

### Exported Functions

```typescript
/**
 * Send query to backend and return response
 * @throws Error if request fails (network, timeout, backend error)
 */
export async function sendQuery(
  question: string,
  config: BackendConfig
): Promise<ChatResponse>;

/**
 * Validate query before sending
 * @returns validation result with optional error message
 */
export function validateQuery(question: string): {
  valid: boolean;
  error?: string;
};

/**
 * Transform backend error to user-friendly ErrorState
 */
export function categorizeError(error: unknown): ErrorState;
```

### Implementation Details

**sendQuery**:
- Use Fetch API with AbortController for timeout
- Set `Content-Type: application/json` header
- Parse response JSON
- Throw on non-200 status (error handled by caller)

**validateQuery**:
- Check empty after trim → `{ valid: false, error: "Question cannot be empty" }`
- Check length >10000 → `{ valid: false, error: "Question is too long (max 10,000 characters)" }`
- Otherwise → `{ valid: true }`

**categorizeError**:
- `TypeError` (fetch rejection) → `{ type: 'network', ... }`
- `AbortError` → `{ type: 'timeout', ... }`
- HTTP 4xx/5xx → `{ type: 'backend', ... }` (parse `detail` from response)
- Unknown → `{ type: 'backend', message: 'An unexpected error occurred' }`

---

## useChat Hook (Custom Hook)

Encapsulates chat state logic for reusability and testing.

### Interface

```typescript
function useChat(config: BackendConfig): {
  messages: ChatMessage[];
  isLoading: boolean;
  error: ErrorState | null;
  inputValue: string;
  setInputValue: (value: string) => void;
  sendMessage: (question: string) => Promise<void>;
  retryLast: () => void;
  clearError: () => void;
};
```

### Behavior

**sendMessage**:
1. Validate query → return early if invalid (set validation error)
2. Create user message with `status: 'pending'`, add to messages
3. Set `isLoading: true`, clear previous error
4. Call `sendQuery()` from chatService
5. On success: Create assistant message, add to messages, update user message `status: 'completed'`
6. On error: Categorize error, set error state, update user message `status: 'failed'`
7. Set `isLoading: false`
8. Clear input value on success

**retryLast**:
1. Get `originalQuery` from current error state
2. Call `sendMessage(originalQuery)`
3. Error state cleared automatically if retry succeeds

---

## Integration with Docusaurus

### Swizzling Root Component

**File**: `src/theme/Root.tsx`

```tsx
import React from 'react';
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

**Steps to Swizzle**:
```bash
npm run swizzle @docusaurus/theme-classic Root -- --wrap
```

### Environment Configuration

**File**: `docusaurus.config.js`

```js
module.exports = {
  customFields: {
    backendURL: process.env.BACKEND_URL || 'http://localhost:8000',
  },
  // ... rest of config
};
```

**Access in Component**:
```tsx
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

const { siteConfig } = useDocusaurusContext();
const backendURL = siteConfig.customFields.backendURL as string;
```

---

## Testing Requirements

### Unit Tests (Jest + React Testing Library)

**ChatWidget.test.tsx**:
- [ ] Renders in collapsed state initially
- [ ] Expands when toggle button clicked
- [ ] Sends message when form submitted
- [ ] Displays loading indicator when isLoading true
- [ ] Displays error when error state set
- [ ] Clears error when retry clicked and succeeds

**ChatMessage.test.tsx**:
- [ ] Renders user message with correct styling
- [ ] Renders assistant message with sources
- [ ] Filters sources with low relevance score
- [ ] Calls onSourceClick when source clicked

**ChatInput.test.tsx**:
- [ ] Calls onSubmit when Enter pressed
- [ ] Adds newline when Shift+Enter pressed
- [ ] Disables when disabled prop true
- [ ] Shows character count warning at 9000+ chars

### Integration Tests

- [ ] Send message → receive response → display in UI
- [ ] Network error → display error → retry → success
- [ ] Timeout → display timeout error → retry
- [ ] CORS error → display network error (can't distinguish from network)

---

## Accessibility Requirements

**Keyboard Navigation**:
- Tab to toggle button → Enter to open
- Tab to input → Type → Enter to send
- Tab to retry button (if error) → Enter to retry
- Esc to close widget

**ARIA Labels**:
- Chat widget: `role="complementary"` `aria-label="AI Chat Assistant"`
- Toggle button: `aria-expanded={!isCollapsed}` `aria-label="Toggle chat"`
- Message list: `role="log"` `aria-live="polite"` (new messages announced)
- Input: `aria-label="Ask a question"` `aria-invalid={hasError}`

**Screen Reader Support**:
- Loading state: `aria-busy="true"` on message list
- Error: `role="alert"` for immediate announcement
- Sources: List with semantic `<ol>` and proper link labels

---

## Performance Targets

**Bundle Size**:
- ChatWidget component + dependencies: <50KB gzipped
- Initial load: Lazy-load component to avoid blocking page render

**Runtime Performance**:
- Message rendering: <16ms (60fps)
- Input debounce: Not needed (validation is cheap)
- Scroll performance: Virtualize message list if >100 messages (unlikely)

---

## Version History

| Version | Date       | Changes                          |
|---------|------------|----------------------------------|
| 1.0     | 2025-12-12 | Initial component specification  |

## Notes

- All TypeScript interfaces defined in `src/types/chat.ts`
- CSS modules used for styling (avoid global CSS conflicts with Docusaurus)
- Component designed for Docusaurus but portable to other React apps with minimal changes
- Future enhancement: Conversation persistence (localStorage), voice input, markdown rendering
