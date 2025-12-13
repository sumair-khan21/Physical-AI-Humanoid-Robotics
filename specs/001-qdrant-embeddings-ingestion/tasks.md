# Tasks: Qdrant Embeddings Ingestion Pipeline

**Input**: Design documents from `/specs/001-qdrant-embeddings-ingestion/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `- [ ] [ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

This project uses single-file implementation:
- **Backend**: `backend/main.py` (all pipeline logic)
- **Tests**: `tests/` at repository root
- **Docs**: `backend/README.md`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and environment setup

- [ ] T001 Create backend directory structure: `mkdir -p backend tests`
- [ ] T002 Initialize UV project in backend/: `cd backend && uv init`
- [ ] T003 [P] Add Python dependencies via UV: `uv add cohere qdrant-client requests beautifulsoup4 tiktoken python-dotenv tenacity`
- [ ] T004 [P] Add development dependencies: `uv add --dev pytest`
- [ ] T005 [P] Create .env.example template in backend/.env.example with all required variables (COHERE_API_KEY, QDRANT_URL, QDRANT_API_KEY, SITEMAP_URL, COLLECTION_NAME, CHUNK_SIZE_MIN, CHUNK_SIZE_MAX, CHUNK_OVERLAP)
- [ ] T006 [P] Create .gitignore in repository root to exclude .env, __pycache__, .pytest_cache, .venv, uv.lock
- [ ] T007 Create backend/README.md with setup instructions from quickstart.md

**Checkpoint**: Project structure initialized, dependencies resolved, environment template ready

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core utilities and configuration that MUST be complete before user story implementation

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T008 Create backend/.env from .env.example and add actual API keys (COHERE_API_KEY, QDRANT_URL, QDRANT_API_KEY)
- [ ] T009 Add environment variable loading boilerplate to backend/main.py (import dotenv, load_dotenv, os.getenv for all config variables)
- [ ] T010 [P] Add import statements to backend/main.py for all dependencies (requests, BeautifulSoup, tiktoken, cohere, qdrant_client, uuid, datetime, logging, xml.etree.ElementTree, tenacity)
- [ ] T011 [P] Configure logging in backend/main.py (basicConfig with INFO level, format with timestamp and message)
- [ ] T012 Add type hints imports to backend/main.py (from typing import List, Dict, Tuple, Optional)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Content Extraction and Ingestion (Priority: P1) 🎯 MVP

**Goal**: Extract all content from deployed Docusaurus site, chunk it, generate embeddings, and store in Qdrant with metadata

**Independent Test**: Run pipeline against deployed site → Verify all pages crawled → Verify chunks created (300-500 tokens, 20-40 overlap) → Verify embeddings generated → Verify Qdrant collection created with correct schema → Verify metadata complete → Re-run pipeline → Verify idempotency (no duplicates)

### Implementation for User Story 1

- [ ] T013 [P] [US1] Implement get_all_urls(sitemap_url: str) -> List[str] in backend/main.py to parse sitemap.xml using xml.etree.ElementTree and extract all <loc> URLs
- [ ] T014 [P] [US1] Implement extract_text_from_url(url: str) -> Tuple[str, str] in backend/main.py to fetch HTML via requests, parse with BeautifulSoup, extract title and main content from <article> or <main> tag, clean text
- [ ] T015 [P] [US1] Implement chunk_text(text: str, min_tokens: int, max_tokens: int, overlap: int) -> List[Dict] in backend/main.py using tiktoken encoding (cl100k_base), sliding window with target 400 tokens and 30 token overlap, return list of dicts with {text, token_count, start_token, end_token}
- [ ] T016 [US1] Implement embed(texts: List[str], cohere_client) -> List[List[float]] in backend/main.py with tenacity retry decorator (max 3 attempts, exponential backoff), call cohere_client.embed with model='embed-english-v3.0' and input_type='search_document', batch up to 96 texts per call
- [ ] T017 [US1] Implement create_collection(qdrant_client, collection_name: str, vector_size: int) -> None in backend/main.py to check if collection exists, if not create with VectorParams(size=1024, distance=Distance.COSINE)
- [ ] T018 [US1] Implement save_chunk_to_qdrant(qdrant_client, collection_name: str, chunk_id: str, vector: List[float], payload: Dict) -> None in backend/main.py with tenacity retry, create PointStruct with id, vector, and payload, call qdrant_client.upsert with batch of points
- [ ] T019 [US1] Implement is_url_processed(qdrant_client, collection_name: str, url: str) -> bool in backend/main.py to query Qdrant for existing points with matching URL in payload metadata (use scroll with Filter and FieldCondition)
- [ ] T020 [US1] Implement main() function in backend/main.py to orchestrate pipeline: load env vars, initialize Cohere and Qdrant clients, get URLs from sitemap, create collection, loop through URLs (check if processed via is_url_processed, skip if exists, extract text, chunk text, generate chunk_ids with uuid, batch embed chunks, upload to Qdrant with metadata), log summary statistics
- [ ] T021 [US1] Add if __name__ == "__main__": main() guard at end of backend/main.py
- [ ] T022 [US1] Add comprehensive docstrings (Google style) to all functions in backend/main.py explaining purpose, parameters, return values, and exceptions
- [ ] T023 [US1] Add type hints to all function signatures in backend/main.py
- [ ] T024 [US1] Add error handling with try-except blocks around HTTP requests, HTML parsing, API calls in backend/main.py (log errors with URL/context, continue to next URL on failure)
- [ ] T025 [US1] Add progress logging in main() loop in backend/main.py (log URL being processed, chunks created, embeddings generated, points uploaded)
- [ ] T026 [US1] Run manual validation: execute `cd backend && uv run main.py` against full sitemap, verify Qdrant collection exists with expected point count, check sample points have all metadata fields

**Checkpoint**: At this point, User Story 1 (core ingestion) should be fully functional and testable independently. Pipeline can crawl site, chunk text, generate embeddings, and store in Qdrant with idempotency.

---

## Phase 4: User Story 2 - Error Handling and Recovery (Priority: P2)

**Goal**: Gracefully handle failures (network issues, API rate limits, malformed content) with logging and retry logic

**Independent Test**: Simulate failure scenarios (network error, rate limit, malformed HTML) → Verify errors logged → Verify retries with exponential backoff → Verify pipeline continues with remaining URLs → Interrupt pipeline mid-execution → Restart → Verify resumes from last checkpoint (skips already-processed URLs)

### Implementation for User Story 2

- [ ] T027 [US2] Update extract_text_from_url in backend/main.py to add requests.Session() for connection pooling and timeout parameter (30 seconds)
- [ ] T028 [US2] Update extract_text_from_url in backend/main.py to handle HTTP errors (404, 500) with try-except, log error with URL, return empty tuple to signal skip
- [ ] T029 [US2] Update extract_text_from_url in backend/main.py to handle malformed HTML (BeautifulSoup parsing errors) with try-except, log error, return empty tuple
- [ ] T030 [US2] Update chunk_text in backend/main.py to validate token count (skip if <50 or >100,000), log warning for edge cases
- [ ] T031 [US2] Update embed function in backend/main.py to enhance retry decorator with better logging (log each retry attempt with attempt number, delay, and error)
- [ ] T032 [US2] Update embed function in backend/main.py to handle rate limit specifically (catch CohereAPIError, check for 429 status, log clear message about rate limit)
- [ ] T033 [US2] Update save_chunk_to_qdrant in backend/main.py to add retry logic with tenacity (max 3 attempts, exponential backoff), log each retry
- [ ] T034 [US2] Update main() in backend/main.py to add comprehensive error handling around entire URL processing loop (try-except per URL, log error with full context, increment error counter, continue)
- [ ] T035 [US2] Update main() in backend/main.py to add summary statistics at end: total URLs, successfully processed, skipped (already in Qdrant), failed (with errors), total chunks, total embeddings, execution time
- [ ] T036 [US2] Create test script tests/test_error_handling.py to simulate network errors (mock requests to raise exceptions), verify error logged and pipeline continues
- [ ] T037 [US2] Update tests/test_error_handling.py to simulate rate limit (mock cohere client to raise rate limit error), verify retry logic triggers with exponential backoff
- [ ] T038 [US2] Update tests/test_error_handling.py to simulate malformed HTML (provide invalid HTML), verify error logged and URL skipped without crashing pipeline

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently. Pipeline handles errors gracefully, retries on transient failures, and resumes from checkpoints.

---

## Phase 5: User Story 3 - Metadata Enrichment (Priority: P3)

**Goal**: Include rich metadata (source URL, chunk position, page title, token count, timestamp) in each stored chunk for traceability

**Independent Test**: Query Qdrant collection → Verify each point has all metadata fields (text, url, chunk_index, page_title, token_count, created_at) → Verify metadata values are accurate → Verify can filter by URL → Verify can sort by chunk_index

### Implementation for User Story 3

- [ ] T039 [US3] Update extract_text_from_url in backend/main.py to extract page title from <title> tag or first <h1>, include in return tuple: (title, content)
- [ ] T040 [US3] Update chunk_text in backend/main.py to accept page_title and url parameters, include in returned chunk dicts as {text, token_count, start_token, end_token, page_title, url}
- [ ] T041 [US3] Update main() in backend/main.py to pass page_title and url to chunk_text function
- [ ] T042 [US3] Update main() in backend/main.py to enrich payload when creating points for Qdrant: add chunk_index (0, 1, 2...), created_at (ISO 8601 timestamp with datetime.now().isoformat()), ensure text, url, page_title, token_count all present
- [ ] T043 [US3] Validate metadata schema matches contracts/qdrant-schema.json: verify all required fields (text, url, chunk_index, page_title, token_count, created_at) are present in payload
- [ ] T044 [US3] Create validation script tests/test_metadata.py to query Qdrant after ingestion, sample 10 random points, verify all have required metadata fields, verify token_count matches actual count, verify chunk_index is sequential per URL
- [ ] T045 [US3] Update validation script to test filtering by URL (query Qdrant for points where payload.url matches specific page), verify all returned points are from that page only
- [ ] T046 [US3] Update validation script to test range query on chunk_index (get all chunks with index 0), verify results are first chunks from each page

**Checkpoint**: All user stories should now be independently functional. Each chunk stored in Qdrant has complete, accurate metadata enabling traceability and filtering.

---

## Phase 6: Testing & Validation

**Purpose**: Comprehensive testing of all pipeline functionality

- [ ] T047 [P] Create tests/test_chunking.py with unit tests: test_chunk_size_constraints (verify 300 ≤ tokens ≤ 500), test_chunk_overlap (verify consecutive chunks share 20-40 tokens), test_edge_cases (empty text, single sentence, very long paragraph), test_token_count_accuracy (compare tiktoken count with returned count)
- [ ] T048 [P] Create tests/test_extraction.py with unit tests: test_html_parsing (mock HTML, verify main content extracted), test_title_extraction (verify <title> or <h1> captured), test_code_blocks (verify code content preserved), test_malformed_html (verify graceful handling)
- [ ] T049 Create tests/test_integration.py with integration test: mock sitemap with 2 test URLs, mock Cohere responses (return fake embeddings), use real Qdrant (or mock), verify full pipeline: sitemap→crawl→chunk→embed→upload, verify point count matches expected, verify metadata complete, re-run pipeline, verify idempotency
- [ ] T050 Run all unit tests: `cd backend && uv run pytest tests/test_chunking.py tests/test_extraction.py -v`
- [ ] T051 Run integration test: `cd backend && uv run pytest tests/test_integration.py -v`
- [ ] T052 Run full pipeline against actual sitemap (https://physical-ai-humanoid-robotics-blond-eta.vercel.app/sitemap.xml): `cd backend && uv run main.py`, monitor logs for errors, verify completion
- [ ] T053 Verify Qdrant collection in dashboard: log in to https://cloud.qdrant.io/, check collection 'rag_embedding' exists, verify point count ~1000-5000, verify vector size 1024, verify distance metric Cosine
- [ ] T054 Create query validation script tests/test_query.py: generate query embedding for "humanoid robotics", search Qdrant, verify top 3 results are relevant, print results with scores and metadata
- [ ] T055 Run query validation: `cd backend && uv run python tests/test_query.py`, manually review results for relevance

**Checkpoint**: All tests passing, full pipeline validated end-to-end, Qdrant collection populated correctly

---

## Phase 7: Documentation & Polish

**Purpose**: Finalize documentation and code quality

- [ ] T056 [P] Update backend/README.md with complete setup instructions: prerequisites (Python 3.11+, UV, Cohere account, Qdrant account), installation steps, environment configuration, usage (run pipeline, run tests), troubleshooting (5 common issues from quickstart.md)
- [ ] T057 [P] Add code comments to backend/main.py explaining WHY for design decisions: why sitemap-first, why 400 token chunks with 30 overlap, why batch size 96, why idempotency via Qdrant metadata
- [ ] T058 [P] Run code formatter on backend/main.py: `uv run black backend/main.py` (or equivalent PEP 8 formatter)
- [ ] T059 [P] Run linter on backend/main.py: `uv run pylint backend/main.py` or `uv run flake8 backend/main.py`, fix any warnings
- [ ] T060 [P] Add module-level docstring to backend/main.py describing pipeline purpose, architecture (6 stages), and usage
- [ ] T061 Verify all functions in backend/main.py have docstrings, type hints, and follow PEP 8 style guide
- [ ] T062 Create example .env with dummy values in backend/.env.example (ensure actual .env is in .gitignore)
- [ ] T063 Add execution time logging to main() in backend/main.py: record start time, end time, calculate duration, log in summary
- [ ] T064 Run quickstart.md validation: follow quickstart.md steps from scratch (new directory, uv init, install deps, create .env, run pipeline), verify all steps work correctly, update quickstart.md if any issues found

**Checkpoint**: Code is clean, well-documented, and follows Python best practices. Documentation is complete and accurate.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion (T001-T007) - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion (T008-T012)
  - User Story 1 (T013-T026): Core ingestion - can start after Foundational
  - User Story 2 (T027-T038): Error handling - can start after Foundational, enhances US1
  - User Story 3 (T039-T046): Metadata enrichment - can start after Foundational, enhances US1
- **Testing (Phase 6)**: Depends on User Story 1 completion minimum (T013-T026), full testing requires all stories
- **Documentation (Phase 7)**: Depends on all implementation complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories. This is the MVP.
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Enhances US1 functions but independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Enhances US1 payload but independently testable

**Note**: While US2 and US3 enhance US1, they modify the same file (main.py). To avoid conflicts:
- Implement sequentially: US1 → US2 → US3
- OR implement US2 and US3 in separate branches, merge sequentially

### Within Each User Story

**User Story 1 (Core Ingestion)**:
1. Functions can be implemented in parallel: get_all_urls (T013), extract_text_from_url (T014), chunk_text (T015) all [P]
2. API integrations sequential: embed (T016) after chunking ready, create_collection (T017) independent, save_chunk_to_qdrant (T018) after collection ready
3. Orchestration: is_url_processed (T019) and main (T020) after all functions ready
4. Quality: docstrings (T022), type hints (T023), error handling (T024) can be done in parallel [P]
5. Validation: manual test (T026) after main() complete

**User Story 2 (Error Handling)**:
- All tasks update existing functions, so must be done sequentially within US2
- Can run in parallel with US3 if done in separate branches

**User Story 3 (Metadata Enrichment)**:
- All tasks update existing functions and payload structure
- Must be done sequentially within US3
- Validation tests (T044-T046) can be done in parallel [P]

### Parallel Opportunities

- **Setup phase**: All marked [P] (T003, T004, T005, T006) can run in parallel
- **Foundational phase**: T010, T011 can run in parallel [P]
- **User Story 1**: T013, T014, T015 can run in parallel [P], then T022, T023, T024 in parallel [P]
- **Testing phase**: T047, T048 can run in parallel [P], T056-T062 in documentation phase all [P]

---

## Parallel Example: User Story 1 Core Functions

```bash
# Launch all core functions together (no dependencies):
Task: "Implement get_all_urls in backend/main.py" (sitemap parsing)
Task: "Implement extract_text_from_url in backend/main.py" (HTML extraction)
Task: "Implement chunk_text in backend/main.py" (tokenization and chunking)

# After core functions ready, launch quality tasks:
Task: "Add docstrings to all functions" (documentation)
Task: "Add type hints to all functions" (type safety)
Task: "Add error handling to functions" (robustness)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

**Goal**: Get core ingestion working end-to-end as quickly as possible

1. ✅ Complete Phase 1: Setup (T001-T007) - ~30 minutes
2. ✅ Complete Phase 2: Foundational (T008-T012) - ~15 minutes
3. ✅ Complete Phase 3: User Story 1 (T013-T026) - ~4-6 hours
   - Focus: Get pipeline running with basic functionality
   - Defer: Perfect error handling, comprehensive tests
4. **STOP and VALIDATE**: Run pipeline, check Qdrant, verify MVP works
5. **Demo-ready**: Can show working ingestion pipeline

**Estimated Time to MVP**: 5-7 hours of focused work

### Incremental Delivery

After MVP (User Story 1) is validated:

1. ✅ **MVP Complete**: Core ingestion working (Phase 1-3)
2. Add User Story 2: Error handling → Test independently → More robust pipeline
3. Add User Story 3: Metadata enrichment → Test independently → Better metadata
4. Add Testing & Validation (Phase 6) → Comprehensive test coverage
5. Add Documentation & Polish (Phase 7) → Production-ready

**Estimated Total Time**: 10-15 hours across all phases

### Sequential Execution (Single Developer)

Recommended order for one person:

1. Phase 1: Setup → ~30 min
2. Phase 2: Foundational → ~15 min
3. Phase 3: User Story 1 (MVP) → ~4-6 hours
4. **Checkpoint**: Validate MVP works
5. Phase 4: User Story 2 (Error handling) → ~2-3 hours
6. Phase 5: User Story 3 (Metadata) → ~1-2 hours
7. Phase 6: Testing → ~2-3 hours
8. Phase 7: Documentation → ~1-2 hours

**Total**: ~12-18 hours

### Parallel Team Strategy

With 2-3 developers (after Foundational complete):

**Developer A**: User Story 1 (Core ingestion)
- T013-T026

**Developer B**: User Story 2 (Error handling) - in separate branch
- T027-T038
- Merge after Developer A completes US1

**Developer C**: User Story 3 (Metadata) - in separate branch
- T039-T046
- Merge after Developer B completes US2

**All Developers**: Testing & Documentation together
- Phase 6 and 7 after all user stories merged

---

## Notes

- **[P] tasks**: Different functions/files, no dependencies - can run in parallel
- **[Story] label**: Maps task to specific user story for traceability (US1, US2, US3)
- **Single-file constraint**: All implementation in backend/main.py means sequential is safer than parallel for code tasks (to avoid merge conflicts)
- **Idempotency is key**: is_url_processed (T019) enables re-running pipeline without duplication
- **Batch processing**: 96 texts per Cohere call, 100 points per Qdrant upsert for efficiency
- **Error handling philosophy**: Fail-safe - errors on individual URLs don't stop pipeline
- **Testing strategy**: Unit tests for pure functions (chunking, extraction), integration test for full pipeline
- **Manual validation**: Essential to verify Qdrant collection and metadata correctness

**Commit Strategy**: Commit after each task or logical group (e.g., after T013-T015 core functions, after T022-T024 quality tasks)

**Stop Points**: Can stop and demo after any phase completion:
- After Phase 3 (US1): MVP working
- After Phase 4 (US2): Production-ready with error handling
- After Phase 5 (US3): Complete with rich metadata
- After Phase 6 (Testing): Fully tested
- After Phase 7 (Documentation): Release-ready
