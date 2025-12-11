# Implementation Tasks: Qdrant Retrieval Validation

**Branch**: `001-002-retrieval-validation`
**Date**: 2025-12-12
**Spec**: [spec.md](spec.md)
**Plan**: [plan.md](plan.md)

## Overview

This document breaks down the implementation of Qdrant retrieval validation into specific, executable tasks organized by user story. Each user story phase is independently testable and can be completed in isolation.

**Deliverables**:
- `backend/validate_retrieval.py` - Standalone CLI validation script
- `backend/test_validation.py` - pytest test suite for automated validation

**Total Tasks**: 23 tasks across 5 phases

---

## Phase 1: Setup & Environment (2 tasks)

**Goal**: Prepare development environment with pytest dependency

**Tasks**:

- [ ] T001 Install pytest as dev dependency using UV in backend/ directory
- [ ] T002 [P] Verify backend/.env has all required credentials (COHERE_API_KEY, QDRANT_URL, QDRANT_API_KEY, COLLECTION_NAME)

**Completion Criteria**:
- ✅ `uv run pytest --version` succeeds and shows pytest 8.x
- ✅ `.env` file exists with all 4 required variables

---

## Phase 2: Foundational - Data Models & Shared Utilities (4 tasks)

**Goal**: Create reusable data structures and utility functions for all validation scripts

**Tasks**:

- [ ] T003 Create QueryResult dataclass in backend/validate_retrieval.py with all 10 attributes (query_text, point_id, score, text, url, page_title, chunk_index, token_count, created_at, rank)
- [ ] T004 [P] Create ValidationReport dataclass in backend/validate_retrieval.py with collection stats, query metrics, metadata validation results, and success criteria flags
- [ ] T005 [P] Create TestQuery dataclass in backend/validate_retrieval.py with query_text, query_type, expected_min_score, expected_url_pattern, description
- [ ] T006 [P] Create MetadataValidation dataclass in backend/validate_retrieval.py with point_id, url, validation flags, and issues list

**Completion Criteria**:
- ✅ All 4 dataclasses defined using @dataclass decorator
- ✅ Type hints on all fields
- ✅ Can import and instantiate each dataclass without errors

**File**: `backend/validate_retrieval.py`

---

## Phase 3: User Story 1 - Basic Retrieval Verification (P1) (7 tasks)

**User Story**: As a developer, I need to verify that semantic search queries return relevant results from the ingested Qdrant collection, so I can confirm the embeddings and retrieval pipeline are working correctly.

**Independent Test**: Run semantic search query and verify results have similarity scores >0.3

**Tasks**:

### Core Query Functions

- [ ] T007 [US1] Define TEST_QUERIES list with 15 predefined TestQuery objects (3 keywords, 4 phrases, 5 questions, 3 variations) in backend/validate_retrieval.py
- [ ] T008 [US1] Implement query_collection() function in backend/validate_retrieval.py that takes query text, generates Cohere embedding, searches Qdrant, returns list of QueryResult objects
- [ ] T009 [US1] Implement measure_query_latency() function in backend/validate_retrieval.py that times embedding generation + Qdrant search and returns latency in milliseconds

### Collection Statistics

- [ ] T010 [P] [US1] Implement get_collection_stats() function in backend/validate_retrieval.py that returns total_points, unique_urls, avg_chunk_size, date_range_start, date_range_end
- [ ] T011 [P] [US1] Implement calculate_query_metrics() function in backend/validate_retrieval.py that takes list of QueryResults and returns avg_similarity_score, queries_above_threshold, success_rate

### CLI Reporting

- [ ] T012 [US1] Implement generate_text_report() function in backend/validate_retrieval.py that formats ValidationReport as human-readable text output
- [ ] T013 [US1] Implement generate_json_report() function in backend/validate_retrieval.py that formats ValidationReport as JSON

**Completion Criteria**:
- ✅ Can query Qdrant collection and get results with similarity scores
- ✅ Can measure query latency (should be <500ms)
- ✅ Can calculate query metrics (success rate, avg score)
- ✅ Can generate human-readable validation reports
- ✅ SC-001: At least 80% of test queries return results with top-1 similarity >0.30
- ✅ SC-005: Average query latency <500ms

**File**: `backend/validate_retrieval.py`

---

## Phase 4: User Story 2 - Metadata Completeness Validation (P2) (5 tasks)

**User Story**: As a developer, I need to verify that all ingested points contain complete and accurate metadata, so I can trust the metadata for citation generation in downstream applications.

**Independent Test**: Sample points from Qdrant and verify all required metadata fields exist with valid types

**Tasks**:

### Metadata Validation Functions

- [ ] T014 [US2] Implement sample_random_points() function in backend/validate_retrieval.py that retrieves N random points from Qdrant collection using scroll API
- [ ] T015 [US2] Implement validate_point_metadata() function in backend/validate_retrieval.py that checks schema compliance (6 required fields), type validation, and returns MetadataValidation object
- [ ] T016 [P] [US2] Implement validate_chunk_sequence() function in backend/validate_retrieval.py that fetches all chunks for a URL and verifies sequential chunk_index values (0, 1, 2, 3...)

### Chunk Overlap Validation

- [ ] T017 [US2] Implement validate_chunk_overlap() function in backend/validate_retrieval.py that compares adjacent chunks from same URL and calculates token-level overlap using tiktoken
- [ ] T018 [US2] Implement calculate_metadata_metrics() function in backend/validate_retrieval.py that aggregates MetadataValidation results and returns schema_compliance_pct, type_validation_pct, overlap_validation_pass

**Completion Criteria**:
- ✅ Can sample random points from collection
- ✅ Can validate metadata schema and types for sampled points
- ✅ Can verify chunk sequences are sequential with no gaps
- ✅ Can validate chunk overlap is ~30 tokens (±5 tolerance)
- ✅ SC-002: 100% of sampled points have all 6 required metadata fields
- ✅ SC-004: Sequential chunks demonstrate expected 30-token overlap

**File**: `backend/validate_retrieval.py`

---

## Phase 5: User Story 3 - Query Quality Assessment (P3) (2 tasks)

**User Story**: As a developer, I need to test retrieval quality across diverse query types, so I can understand the system's strengths and limitations for different user inputs.

**Independent Test**: Run predefined test suite and measure average similarity scores and result diversity

**Tasks**:

### Quality Assessment Functions

- [ ] T019 [US3] Implement calculate_result_diversity() function in backend/validate_retrieval.py that counts unique URLs in top-k results and returns diversity percentage
- [ ] T020 [US3] Implement run_full_validation() function in backend/validate_retrieval.py that orchestrates all validation phases (collection stats, metadata checks, query quality) and returns complete ValidationReport

**Completion Criteria**:
- ✅ Can calculate result diversity for broad queries
- ✅ Can run complete validation workflow end-to-end
- ✅ SC-006: Broad queries span ≥50% of unique URLs (when 3+ URLs exist)
- ✅ SC-007: Zero crashes during full validation suite

**File**: `backend/validate_retrieval.py`

---

## Phase 6: CLI Interface & pytest Test Suite (3 tasks)

**Goal**: Create user-facing CLI and automated test suite

**Tasks**:

### CLI Implementation

- [ ] T021 Implement main() function with argparse CLI in backend/validate_retrieval.py supporting options: --collection-name, --sample-size, --k, --threshold, --report-format, --verbose, --check-overlap

### pytest Test Suite

- [ ] T022 Create backend/test_validation.py with pytest fixtures (qdrant_client, cohere_client, collection_name, test_queries) and 13 test functions organized into 3 classes (TestBasicRetrieval, TestMetadataCompleteness, TestQueryQuality)
- [ ] T023 Run pytest test suite and verify all tests pass or skip appropriately based on collection data availability

**Completion Criteria**:
- ✅ Can run `uv run python validate_retrieval.py` and get text report
- ✅ Can run `uv run python validate_retrieval.py --report-format json` and get JSON output
- ✅ Can run `uv run pytest test_validation.py` and all tests pass or skip
- ✅ SC-003: Collection statistics report accurately reflects Spec 1 ingestion results
- ✅ SC-007: Zero crashes or unhandled exceptions
- ✅ SC-008: Validation report identifies any data quality issues

**Files**: `backend/validate_retrieval.py`, `backend/test_validation.py`

---

## Task Dependencies & Execution Order

### Critical Path (Must Complete in Order)

```
Phase 1 (Setup) → Phase 2 (Data Models) → Phase 3/4/5 (User Stories) → Phase 6 (Integration)
```

### User Story Independence

All three user stories (US1, US2, US3) can be implemented **in parallel** after Phase 2 completes:

- **US1 (Basic Retrieval)**: Independent - can be developed and tested separately
- **US2 (Metadata Validation)**: Independent - can be developed and tested separately
- **US3 (Query Quality)**: Depends on US1 (uses query_collection function) - start after T008

### Parallel Execution Opportunities

**Within Phase 2** (can run in parallel after T003):
- T004, T005, T006 can be implemented concurrently (different dataclasses)

**Within Phase 3** (can run in parallel after T008):
- T010, T011 (statistics functions) independent of query implementation
- T012, T013 (reporting) independent of each other

**Within Phase 4** (can run in parallel after T014):
- T016 (chunk sequence) independent of T015 (metadata validation)
- T017, T018 (overlap validation) can run together

**Example Parallel Workflow**:
1. Complete Phase 1 sequentially (setup)
2. Complete T003, then launch T004-T006 in parallel
3. Complete Phase 3 tasks, with parallel execution of T010-T013
4. Complete Phase 4 tasks with parallel execution where possible
5. Implement Phase 5 and Phase 6 sequentially

---

## Implementation Strategy

### MVP Scope (Minimum Viable Product)

**MVP = User Story 1 (Phase 3) + CLI (T021)**

This delivers:
- ✅ Query validation with similarity scores
- ✅ Collection statistics
- ✅ Human-readable reports
- ✅ Core validation functionality proven

**Test Command**: `uv run python backend/validate_retrieval.py`

**Expected Output**: Text report showing query results and collection stats

### Incremental Delivery

1. **Sprint 1** (MVP): Phase 1 → Phase 2 → Phase 3 → T021 (CLI)
   - Deliverable: Standalone validation script with basic query testing
   - Test: Can validate query quality against current collection

2. **Sprint 2** (Metadata): Phase 4 → Update CLI to include metadata checks
   - Deliverable: Full metadata validation capability
   - Test: Can verify all metadata fields are complete and valid

3. **Sprint 3** (Quality + Testing): Phase 5 → Phase 6 (pytest suite)
   - Deliverable: Diversity metrics + automated test suite
   - Test: `uv run pytest test_validation.py` passes

### Success Validation

After implementation, verify:
- ✅ All 8 success criteria (SC-001 through SC-008) pass
- ✅ All 3 user story acceptance scenarios verified
- ✅ CLI produces correct text and JSON reports
- ✅ pytest test suite has 13 tests with appropriate pass/skip behavior
- ✅ Validation scripts follow PEP 8 and constitution principles
- ✅ Quickstart guide commands work as documented

---

## Task Checklist Format Reference

**Format**: `- [ ] [TaskID] [P?] [Story?] Description with file path`

- **[P]**: Parallelizable (can run concurrently with other [P] tasks in same phase)
- **[US1/US2/US3]**: User Story mapping (required for story-specific tasks)
- **TaskID**: Sequential T001-T023

---

## Notes

**Tests are validation scripts**: This spec produces validation/testing code rather than application code. The deliverables (validate_retrieval.py, test_validation.py) are themselves the tests for the ingestion pipeline.

**No separate test phase**: Unlike typical features, we don't write tests for the validation scripts - the validation scripts test the ingestion pipeline and validate themselves through execution.

**Flexible completion**: If collection has limited data (only 1 URL), some tests will skip. This is expected behavior - validation adapts to available data.

**Reusable functions**: validate_retrieval.py functions can be imported by test_validation.py, avoiding code duplication.
