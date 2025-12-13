# Implementation Tasks: Frontend-Backend Integration for RAG Chatbot

**Feature Branch**: `001-frontend-backend-integration`
**Date**: 2025-12-12
**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

## Overview

**Total Tasks**: 21 tasks across 5 phases
**MVP Scope**: Phase 3 (User Story 1) - 8 tasks
**Parallel Opportunities**: 12 tasks can run in parallel (marked with [P])
**Test Strategy**: Manual testing via browser (no automated tests required per spec)

## Task Organization

Tasks are organized by user story to enable independent implementation and testing:
- **Phase 1**: Setup & Environment (2 tasks)
- **Phase 2**: Foundational - TypeScript Types (1 task)
- **Phase 3**: User Story 1 - Query Submission and Response Display (8 tasks) ← **MVP**
- **Phase 4**: User Story 2 - Error Handling and Resilience (5 tasks)
- **Phase 5**: User Story 3 - CORS and Multi-Environment Support (5 tasks)

---

## Phase 1: Setup & Environment (2 tasks)

**Goal**: Prepare project structure and environment configuration

**Tasks**:

- [ ] T001 Create directory structure for frontend components in frontend/src/components/ChatWidget/
- [ ] T002 [P] Create TypeScript types directory and environment configuration files (.env.development, .env.production)

**Completion Criteria**:
- ✅ Directory structure matches plan.md project structure
- ✅ Environment files exist with BACKEND_URL placeholders
- ✅ Ready for component implementation

---

## Phase 2: Foundational - TypeScript Types (1 task)

**Goal**: Define shared TypeScript interfaces used across all user stories

**Tasks**:

- [ ] T003 Create TypeScript type definitions in frontend/src/types/chat.ts (ChatMessage, Source, ErrorState, BackendConfig interfaces)

**Completion Criteria**:
- ✅ All 5 interfaces defined with complete type annotations
- ✅ Type guards implemented for runtime validation
- ✅ TypeScript compilation succeeds without errors

---

## Phase 3: User Story 1 - Query Submission and Response Display (8 tasks)

**User Story**: A reader browsing the published textbook wants to ask a question about the content. They open the chat interface, type their question, and receive an AI-generated answer based on the textbook content, along with source references showing where the information came from.

**Why MVP**: This is the core value proposition - without query/response flow, the feature has no value.

**Independent Test**: Submit a sample query through the UI and verify response appears with proper formatting and source citations.

**Tasks**:

- [ ] T004 [P] [US1] Create chatService.ts with sendQuery(), validateQuery(), and categorizeError() functions in frontend/src/components/ChatWidget/chatService.ts
- [ ] T005 [P] [US1] Implement useChat custom hook with message state management in frontend/src/hooks/useChat.ts
- [ ] T006 [P] [US1] Create ChatMessage component for displaying user/assistant messages in frontend/src/components/ChatWidget/ChatMessage.tsx
- [ ] T007 [P] [US1] Create ChatInput component with form validation in frontend/src/components/ChatWidget/ChatInput.tsx
- [ ] T008 [US1] Implement ChatWidget main component with collapse/expand state in frontend/src/components/ChatWidget/ChatWidget.tsx
- [ ] T009 [US1] Add basic CSS styling in frontend/src/components/ChatWidget/ChatWidget.module.css
- [ ] T010 [US1] Swizzle Docusaurus Root component and integrate ChatWidget globally in frontend/src/theme/Root.tsx
- [ ] T011 [US1] Configure backend URL in docusaurus.config.js customFields

**Completion Criteria**:
- ✅ Chat widget renders as floating button (collapsed state)
- ✅ Widget expands to show chat interface
- ✅ User can type question and submit via Enter or Send button
- ✅ Loading indicator appears during backend request
- ✅ Assistant response displays with formatted text
- ✅ Source citations display as clickable links (if present in response)
- ✅ Source links navigate to correct textbook sections
- ✅ Manual test: Submit "What is semantic search?" → receive response with sources

**Acceptance Verification**:
1. Open localhost:3000 in browser
2. Click chat widget button (bottom-right)
3. Type "What is semantic search?" and press Enter
4. Verify loading indicator appears
5. Verify response displays within 5 seconds
6. Verify source links are clickable and navigate correctly

---

## Phase 4: User Story 2 - Error Handling and Resilience (5 tasks)

**User Story**: A user submits a query but encounters a network issue, backend timeout, or invalid response. The system provides clear feedback about what went wrong and allows them to retry without losing their query or context.

**Why this priority**: Ensures feature works reliably in real-world conditions with unstable networks or temporary backend unavailability.

**Independent Test**: Simulate network failures, backend errors, and timeouts, then verify appropriate error messages appear and retry mechanisms work correctly.

**Tasks**:

- [ ] T012 [P] [US2] Create ErrorDisplay component for showing error messages with retry button in frontend/src/components/ChatWidget/ErrorDisplay.tsx
- [ ] T013 [US2] Implement timeout handling with AbortController in chatService.ts sendQuery() function
- [ ] T014 [US2] Add network error detection and categorization in chatService.ts categorizeError() function
- [ ] T015 [US2] Implement retry logic in useChat hook (retryLast function)
- [ ] T016 [US2] Update ChatWidget to display ErrorDisplay component when error state is set

**Completion Criteria**:
- ✅ Network errors show "Connection failed" message with retry button
- ✅ Timeout errors (>30s) show "Request timed out" message with retry button
- ✅ Backend errors (4xx/5xx) show user-friendly message (not stack traces)
- ✅ Validation errors (empty query) show "Question cannot be empty" (no retry)
- ✅ Retry button resubmits original query without re-typing
- ✅ Error can be dismissed (X button)

**Acceptance Verification**:
1. **Test Network Error**: Stop backend server, submit query → verify "Connection failed" error + Retry button
2. **Test Timeout**: Mock 35-second backend delay, submit query → verify "Request timed out" error
3. **Test Validation**: Submit empty query → verify "Question cannot be empty" error (no retry)
4. **Test Retry**: After network error, click Retry → verify query resubmits successfully

---

## Phase 5: User Story 3 - CORS and Multi-Environment Support (5 tasks)

**User Story**: The chat interface works seamlessly in both local development (localhost) and production deployed environments without CORS errors or connection issues.

**Why this priority**: Essential for deployment but doesn't add user-facing features. Can be configured after core query flow works.

**Independent Test**: Verify successful API calls from both localhost (development) and production domain with no browser console CORS errors.

**Tasks**:

- [ ] T017 [P] [US3] Create backend Pydantic models (ChatRequest, ChatResponse, SourceResponse) in backend/models/chat_models.py
- [ ] T018 [P] [US3] Implement FastAPI chat endpoint POST /api/chat/query in backend/routers/chat.py
- [ ] T019 [US3] Add CORSMiddleware to FastAPI app with environment-based origins in backend/main.py
- [ ] T020 [US3] Create .env file for backend with CORS_ORIGINS configuration
- [ ] T021 [US3] Test CORS configuration from localhost:3000 and verify no CORS errors in browser console

**Completion Criteria**:
- ✅ Backend accepts POST /api/chat/query with question payload
- ✅ Backend returns ChatResponse with answer and sources (or null)
- ✅ CORS headers present in response (Access-Control-Allow-Origin)
- ✅ OPTIONS preflight requests succeed
- ✅ Requests from localhost:3000 work without CORS errors
- ✅ Production domain can be configured via CORS_ORIGINS environment variable

**Acceptance Verification**:
1. **Test Localhost CORS**: Start backend with CORS_ORIGINS=http://localhost:3000, start frontend on localhost:3000, submit query → verify no CORS errors in browser console
2. **Test Production**: Update CORS_ORIGINS to production domain, deploy frontend, submit query → verify works without CORS errors
3. **Test Preflight**: Open Network tab in browser dev tools, submit query → verify OPTIONS request returns 200 with CORS headers

---

## Dependencies & Execution Order

### User Story Dependencies

```
Phase 1 (Setup) → Phase 2 (Types) → Phase 3 (US1 - MVP)
                                         ↓
                                    Phase 4 (US2 - Error Handling) [optional enhancement]
                                         ↓
                                    Phase 5 (US3 - CORS) [deployment requirement]
```

**Independent Stories**:
- User Story 1 (Phase 3): Can be implemented and tested independently (use mock backend for initial testing)
- User Story 2 (Phase 4): Depends on US1 (needs working query flow to test error scenarios)
- User Story 3 (Phase 5): Can run in parallel with US1/US2 frontend work (backend-focused)

### Suggested Implementation Order

**Sprint 1 - MVP** (Phase 1-3):
1. T001-T003: Setup and types (foundational)
2. T004-T007: Core components (can parallelize)
3. T008-T011: Integration and configuration

**Sprint 2 - Resilience** (Phase 4):
1. T012-T016: Error handling enhancements

**Sprint 3 - Production** (Phase 5):
1. T017-T021: Backend + CORS configuration

---

## Parallel Execution Examples

### Phase 3 (US1) - Parallel Opportunities

**Batch 1** (can run simultaneously after T003 complete):
- T004: chatService.ts
- T005: useChat hook
- T006: ChatMessage component
- T007: ChatInput component

**Batch 2** (after Batch 1 complete):
- T008: ChatWidget main component (depends on T004-T007)
- T009: CSS styling (can run with T008)

**Batch 3** (after T008 complete):
- T010: Swizzle Root
- T011: Configure Docusaurus

### Phase 5 (US3) - Parallel with Frontend Work

**Concurrent with Phase 3/4**:
- T017: Backend Pydantic models (independent)
- T018: FastAPI endpoint (depends on T017)
- T019-T020: CORS configuration (depends on T018)

---

## Implementation Strategy

### MVP-First Approach

**Minimum Viable Product**: Phase 3 (User Story 1) only
- Delivers core value: Query → Response with sources
- Can be tested and demonstrated independently
- 8 tasks, estimated 4-6 hours of implementation

**Incremental Delivery**:
1. **Release 1**: MVP (Phase 3) - Basic query/response flow
2. **Release 2**: +Error Handling (Phase 4) - Production-ready resilience
3. **Release 3**: +CORS (Phase 5) - Multi-environment deployment

### Testing Strategy

**Manual Testing** (no automated tests per spec):
- Phase 3: Browser-based interaction testing
- Phase 4: Simulate errors (stop backend, mock timeouts)
- Phase 5: Verify CORS via browser Network tab

**Success Metrics** (from spec.md):
- SC-001: 95% of queries receive response <5 seconds
- SC-002: Chat interface loads <1 second
- SC-003: Zero CORS errors (localhost + production)
- SC-004: 100% of failures show user-friendly errors
- SC-005: One-click retry works
- SC-006: Handles rapid successive queries
- SC-007: 100% of source citations are clickable
- SC-008: Graceful edge case handling (empty queries, etc.)

---

## File Checklist

**Frontend Files to Create** (11 files):
- [ ] frontend/src/types/chat.ts
- [ ] frontend/src/components/ChatWidget/ChatWidget.tsx
- [ ] frontend/src/components/ChatWidget/ChatMessage.tsx
- [ ] frontend/src/components/ChatWidget/ChatInput.tsx
- [ ] frontend/src/components/ChatWidget/ErrorDisplay.tsx
- [ ] frontend/src/components/ChatWidget/chatService.ts
- [ ] frontend/src/components/ChatWidget/ChatWidget.module.css
- [ ] frontend/src/hooks/useChat.ts
- [ ] frontend/src/theme/Root.tsx
- [ ] frontend/.env.development
- [ ] frontend/.env.production

**Frontend Files to Modify** (1 file):
- [ ] frontend/docusaurus.config.js (add customFields.backendURL)

**Backend Files to Create** (3 files):
- [ ] backend/models/chat_models.py
- [ ] backend/routers/chat.py
- [ ] backend/.env

**Backend Files to Modify** (1 file):
- [ ] backend/main.py (add CORSMiddleware)

**Total**: 15 files (12 create, 3 modify)

---

## Notes

- **No automated tests**: Spec explicitly states "no testing framework" - use manual browser testing
- **Bundle size**: Using native Fetch API (no axios) keeps bundle <50KB per plan.md
- **Performance**: Widget must load <1s, queries complete <5s (95th percentile)
- **CORS**: Critical for production - test thoroughly from both localhost and deployed domain
- **Retry mechanism**: Must preserve original query (no re-typing) per spec FR-011
- **Source citations**: Filter sources with relevanceScore <0.3 (low-relevance) per data-model.md

## Success Definition

**Feature is complete when**:
1. ✅ All 21 tasks checked off
2. ✅ Manual test of each user story passes acceptance verification
3. ✅ All 8 success criteria (SC-001 through SC-008) met
4. ✅ CORS works from localhost and production
5. ✅ Widget renders on all Docusaurus pages
6. ✅ No console errors during normal operation
7. ✅ Error messages are user-friendly (no stack traces)
8. ✅ Retry button works for network/timeout/backend errors

**Ready for `/sp.implement`**: Yes, after all tasks defined and validated!
