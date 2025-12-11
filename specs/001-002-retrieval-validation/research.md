# Research: Qdrant Retrieval Validation

**Date**: 2025-12-12
**Feature**: Retrieval validation for Qdrant embeddings ingestion pipeline

## Overview

This document captures research decisions for implementing validation scripts to test the quality and correctness of the Qdrant embeddings ingestion pipeline from Spec 1. Focus areas: query validation patterns, metadata verification strategies, test organization, and quality metrics.

---

## Decision 1: Validation Script Architecture

**Decision**: Create two complementary validation tools:
1. **validate_retrieval.py** - Standalone CLI script for ad-hoc validation and reporting
2. **test_validation.py** - pytest test suite for automated CI/CD integration

**Rationale**:
- **Standalone script** allows developers to quickly check collection health and run queries interactively
- **pytest suite** enables reproducible testing and can be integrated into CI/CD pipelines
- Separation of concerns: CLI for human-readable reports, pytest for pass/fail assertions
- Both tools can share common validation logic (functions extracted to validate_retrieval.py, imported by tests)

**Alternatives Considered**:
- **Single pytest-only approach**: Rejected because pytest output is less user-friendly for exploratory validation
- **Jupyter notebook**: Rejected because less reproducible and harder to version control
- **Separate validation library**: Rejected as over-engineering for 2-3 validation scripts

**Implementation**:
```python
# validate_retrieval.py structure:
# - Collection statistics functions
# - Query execution with metrics
# - Metadata validation functions
# - Report generation (human-readable)
# - CLI interface using argparse

# test_validation.py structure:
# - Import functions from validate_retrieval.py
# - pytest fixtures for Qdrant/Cohere clients
# - Test cases matching acceptance criteria from spec
# - Assertions based on success criteria thresholds
```

---

## Decision 2: Test Query Design

**Decision**: Use a predefined test query set with 15 queries covering 4 categories:
1. **Single-word keywords** (3 queries): "robotics", "sensors", "kinematics"
2. **Multi-word phrases** (4 queries): "humanoid robotics", "inverse kinematics", "sensor fusion", "control systems"
3. **Questions** (5 queries): "what is inverse kinematics", "how do humanoid robots work", "what sensors are used in robotics"
4. **Technical variations** (3 queries): Test typos/spelling variants like "robotic" vs "robotics", "kinematic" vs "kinematics"

**Rationale**:
- Covers diverse query types users will likely submit
- Enables reproducible quality measurement (track scores over time)
- Small enough to run quickly (<1 minute for all queries)
- Large enough to get statistical signal on quality (15 queries)
- Technical variations test semantic robustness of embeddings

**Alternatives Considered**:
- **Dynamic query generation**: Rejected because non-reproducible, hard to track regressions
- **Larger query set (50+)**: Rejected because slower, diminishing returns for validation
- **Domain-specific evaluation datasets**: Rejected because no standard benchmark exists for humanoid robotics content

**Success Criteria Alignment**:
- SC-001 requires 80% of queries achieve >0.30 similarity → 12 out of 15 queries must pass
- Predefined queries enable automated tracking of this metric

---

## Decision 3: Metadata Validation Strategy

**Decision**: Three-tier metadata validation approach:

**Tier 1 - Schema Validation** (Required fields present):
```python
REQUIRED_FIELDS = ['text', 'url', 'page_title', 'chunk_index', 'token_count', 'created_at']

def validate_metadata_schema(point) -> dict:
    """Check all required fields exist and are non-empty"""
    return {
        field: field in point.payload and point.payload[field] not in [None, '', []]
        for field in REQUIRED_FIELDS
    }
```

**Tier 2 - Type Validation** (Correct data types):
```python
def validate_metadata_types(point) -> dict:
    """Verify field types match expectations"""
    checks = {
        'text': isinstance(point.payload['text'], str) and len(point.payload['text']) > 0,
        'url': isinstance(point.payload['url'], str) and point.payload['url'].startswith('http'),
        'page_title': isinstance(point.payload['page_title'], str),
        'chunk_index': isinstance(point.payload['chunk_index'], int) and point.payload['chunk_index'] >= 0,
        'token_count': isinstance(point.payload['token_count'], int) and 300 <= point.payload['token_count'] <= 500,
        'created_at': is_valid_iso8601(point.payload['created_at'])
    }
    return checks
```

**Tier 3 - Consistency Validation** (Cross-chunk relationships):
```python
def validate_chunk_sequence(qdrant_client, url) -> dict:
    """Verify chunks from same URL have sequential indices"""
    # Fetch all chunks for URL
    # Check chunk_index values form sequence: 0, 1, 2, 3...
    # Check for gaps or duplicates
    return {'sequential': bool, 'gaps': list, 'duplicates': list}
```

**Rationale**:
- **Tier 1** is fast and catches obvious issues (missing fields)
- **Tier 2** ensures data quality beyond mere presence
- **Tier 3** validates ingestion pipeline logic (chunking worked correctly)
- Progressive validation: can stop early if Tier 1 fails

**Alternatives Considered**:
- **Pydantic schema validation**: Rejected because adds dependency for simple checks
- **JSON Schema validation**: Rejected because Qdrant payloads are dicts, not JSON
- **Manual ad-hoc checks**: Rejected because not systematic or reusable

---

## Decision 4: Quality Metrics and Reporting

**Decision**: Track 8 key metrics aligned with success criteria:

**Collection Metrics**:
1. `total_points`: Count of vectors in collection
2. `unique_urls`: Number of distinct source pages
3. `avg_chunk_size`: Mean token count across all chunks
4. `date_range`: Min and max created_at timestamps

**Query Quality Metrics**:
5. `avg_similarity_score`: Mean top-1 similarity across test queries
6. `queries_above_threshold`: Count of queries with top-1 score >0.30
7. `avg_query_latency_ms`: Mean time for embedding + search
8. `result_diversity`: For broad queries, % of unique URLs in top-10

**Report Format** (validate_retrieval.py output):
```
==================================================
QDRANT COLLECTION VALIDATION REPORT
==================================================
Collection: rag_embedding
Generated: 2025-12-12 15:30:00

COLLECTION STATISTICS
---------------------
Total Points: 4
Unique URLs: 1
Avg Chunk Size: 387 tokens
Date Range: 2025-12-11 to 2025-12-12

METADATA VALIDATION (20 samples)
--------------------------------
Schema Compliance: 20/20 (100%)
Type Validation: 20/20 (100%)
Sequence Validation: 1 URL checked, 0 gaps found

QUERY QUALITY (15 test queries)
-------------------------------
Avg Top-1 Similarity: 0.42
Queries >0.30 threshold: 13/15 (87%) ✓ PASS
Avg Query Latency: 320ms ✓ PASS
Result Diversity: 60%

SUCCESS CRITERIA
----------------
✓ SC-001: 87% queries >0.30 (target: 80%)
✓ SC-002: 100% metadata complete (target: 100%)
✓ SC-005: 320ms latency (target: <500ms)
✗ SC-006: 60% diversity (target: 50%) - LIMITED DATA

ISSUES FOUND: None
==================================================
```

**Rationale**:
- Metrics directly map to success criteria from spec.md
- Human-readable format for manual review
- Clear pass/fail indicators
- Flags data limitations (e.g., only 1 URL currently ingested)

**Alternatives Considered**:
- **JSON output only**: Rejected because less readable for developers
- **More granular metrics (percentiles, histograms)**: Deferred to future (overkill for validation)
- **Grafana/dashboard**: Rejected because no monitoring infrastructure in place

---

## Decision 5: Chunk Overlap Validation

**Decision**: Validate token-level overlap between sequential chunks from the same URL:

```python
def validate_chunk_overlap(qdrant_client, url, expected_overlap=30):
    """Verify adjacent chunks have expected token overlap"""
    import tiktoken

    # Fetch all chunks for URL, sorted by chunk_index
    chunks = get_chunks_by_url(qdrant_client, url, sort_by='chunk_index')

    encoding = tiktoken.get_encoding('cl100k_base')
    overlap_counts = []

    for i in range(len(chunks) - 1):
        curr_text = chunks[i].payload['text']
        next_text = chunks[i+1].payload['text']

        curr_tokens = encoding.encode(curr_text)
        next_tokens = encoding.encode(next_text)

        # Find longest common suffix of curr_tokens and prefix of next_tokens
        max_overlap = min(len(curr_tokens), len(next_tokens))
        actual_overlap = 0

        for j in range(1, max_overlap + 1):
            if curr_tokens[-j:] == next_tokens[:j]:
                actual_overlap = j

        overlap_counts.append(actual_overlap)

    return {
        'expected': expected_overlap,
        'actual_overlaps': overlap_counts,
        'avg_overlap': sum(overlap_counts) / len(overlap_counts) if overlap_counts else 0,
        'within_tolerance': all(25 <= o <= 35 for o in overlap_counts)  # ±5 token tolerance
    }
```

**Rationale**:
- Validates that chunking overlap setting (CHUNK_OVERLAP=30 from Spec 1) actually worked
- Token-level comparison is precise (matches how chunks were created)
- Tolerance of ±5 tokens accounts for boundary effects and decoding variations
- Only validates when multiple chunks exist for same URL

**Alternatives Considered**:
- **String-based overlap**: Rejected because tokenization is the ground truth
- **Exact overlap requirement**: Rejected because boundary effects may cause slight variations
- **Skip validation**: Rejected because overlap is critical for retrieval quality

**Implementation Note**: This validation will show "insufficient data" warning if only single-chunk URLs exist (current state with only homepage ingested).

---

## Decision 6: pytest Test Organization

**Decision**: Organize tests into 3 test classes matching user stories:

```python
# test_validation.py

import pytest
from validate_retrieval import (
    get_collection_stats,
    query_collection,
    validate_point_metadata,
    TEST_QUERIES
)

@pytest.fixture(scope="session")
def qdrant_client():
    """Shared Qdrant client for all tests"""
    # Initialize from .env
    return QdrantClient(...)

@pytest.fixture(scope="session")
def cohere_client():
    """Shared Cohere client for all tests"""
    return cohere.Client(...)

class TestBasicRetrieval:
    """User Story 1 - Basic Retrieval Verification (P1)"""

    def test_query_returns_results_above_threshold(self, qdrant_client, cohere_client):
        """SC-001: 80% of queries return top-1 similarity >0.30"""
        results = run_query_suite(TEST_QUERIES, qdrant_client, cohere_client)
        passed = sum(1 for r in results if r['top_score'] > 0.30)
        assert passed / len(results) >= 0.80

    def test_query_latency_under_500ms(self, qdrant_client, cohere_client):
        """SC-005: Average query latency <500ms"""
        latencies = measure_query_latencies(TEST_QUERIES, qdrant_client, cohere_client)
        assert sum(latencies) / len(latencies) < 500

class TestMetadataCompleteness:
    """User Story 2 - Metadata Completeness Validation (P2)"""

    def test_all_points_have_required_fields(self, qdrant_client):
        """SC-002: 100% of points have all 6 required metadata fields"""
        sample = sample_points(qdrant_client, min_count=20)
        for point in sample:
            assert validate_point_metadata(point)['all_present']

    def test_token_counts_within_range(self, qdrant_client):
        """Acceptance: token_count between 300-500"""
        sample = sample_points(qdrant_client, min_count=20)
        for point in sample:
            assert 300 <= point.payload['token_count'] <= 500

class TestQueryQuality:
    """User Story 3 - Query Quality Assessment (P3)"""

    def test_semantic_similarity_maintained(self, qdrant_client, cohere_client):
        """Acceptance: Typo variations maintain semantic similarity"""
        pairs = [("robotics", "robotic"), ("kinematics", "kinematic")]
        for original, variant in pairs:
            results_orig = query_collection(original, qdrant_client, cohere_client, k=3)
            results_var = query_collection(variant, qdrant_client, cohere_client, k=3)
            overlap = compute_overlap(results_orig, results_var)
            assert overlap >= 2  # At least 2/3 results overlap
```

**Rationale**:
- Class organization matches spec user stories (clear traceability)
- Fixtures enable efficient client reuse (don't recreate connections per test)
- Tests directly assert success criteria and acceptance scenarios
- Readable test names explain what's being validated

**Alternatives Considered**:
- **Flat test functions**: Rejected because harder to organize and navigate
- **Separate test files per user story**: Rejected because overkill for 15-20 tests
- **Parameterized tests for all queries**: Considered but deferred (would create 15+ test cases)

---

## Decision 7: Error Handling and Edge Cases

**Decision**: Validation scripts must gracefully handle edge cases from spec.md:

**Edge Case Handling**:
```python
# 1. Empty collection
def get_collection_stats(qdrant_client):
    info = qdrant_client.get_collection('rag_embedding')
    if info.points_count == 0:
        return {'status': 'empty', 'warning': 'Collection has no points. Run ingestion pipeline first.'}
    # ... normal stats

# 2. No semantically similar content
def query_collection(query, qdrant_client, cohere_client, k=5):
    results = qdrant.query_points(...)
    if not results.points or all(r.score < 0.1 for r in results.points):
        return {'query': query, 'warning': 'No semantically similar content found', 'scores': []}
    # ... normal results

# 3. Extremely long query (>512 tokens)
def query_collection(query, qdrant_client, cohere_client, k=5):
    encoding = tiktoken.get_encoding('cl100k_base')
    token_count = len(encoding.encode(query))
    if token_count > 512:
        # Cohere embed-english-v3.0 max is 512 tokens
        query = encoding.decode(encoding.encode(query)[:512])
        warnings.warn(f"Query truncated from {token_count} to 512 tokens")
    # ... proceed with embedding

# 4. API failures
@retry(stop=stop_after_attempt(3), wait=wait_exponential(min=2, max=10))
def query_with_retry(query, qdrant_client, cohere_client, k=5):
    """Wrapper with exponential backoff for transient failures"""
    # Same pattern as Spec 1 embed() function
```

**Rationale**:
- Validation should never crash on edge cases - it's for debugging
- Warnings provide actionable feedback (e.g., "run ingestion first")
- Truncation for long queries matches Cohere API limits
- Retry logic handles transient network issues

**Alternatives Considered**:
- **Fail fast on errors**: Rejected because validation should be resilient
- **Skip edge case handling**: Rejected because spec explicitly lists these cases
- **Separate edge case test suite**: Considered but integrated into main validation instead

---

## Decision 8: Dependency Versions

**Decision**: Add pytest to dev dependencies with specific version:

```bash
# Installation command
uv add --dev pytest>=8.0.0

# Justification for version:
# - pytest 8.x is latest stable (as of Dec 2024)
# - >=8.0.0 allows patch updates but locks major version
# - All other dependencies already installed from Spec 1
```

**Existing Dependencies** (from Spec 1):
- qdrant-client (installed, version TBD - check actual version)
- cohere (installed, version TBD)
- python-dotenv (installed)
- tiktoken (installed)
- requests (installed)
- beautifulsoup4 (installed)
- tenacity (installed)

**New Dependencies**:
- pytest>=8.0.0 (dev dependency only)

**Rationale**:
- Minimal new dependencies (only pytest)
- Reuse all Spec 1 packages (validation reads same collection)
- pytest 8.x is mature and well-documented
- Dev-only installation keeps production dependencies clean

**Alternatives Considered**:
- **unittest (stdlib)**: Rejected because pytest has better fixtures and reporting
- **pytest-cov for coverage**: Deferred (validation scripts are themselves tests)
- **pytest-asyncio**: Not needed (all operations are synchronous)

---

## Decision 9: Report Storage and History Tracking

**Decision**: Validation reports are ephemeral (printed to stdout), not persisted:

**Rationale**:
- Validation is ad-hoc exploratory tool, not production monitoring
- Users can redirect output if needed: `python validate_retrieval.py > report.txt`
- Avoids complexity of report storage, versioning, cleanup
- pytest generates its own test reports (JUnit XML if needed for CI)

**Alternatives Considered**:
- **Save reports to specs/001-002-retrieval-validation/reports/**: Rejected because adds state management
- **Append to log file**: Rejected because no requirement for historical tracking
- **Database storage**: Rejected as massive over-engineering

**Future Enhancement**: If continuous monitoring is needed (Spec 4+), reports could be stored in a time-series database. For now, stdout is sufficient.

---

## Summary

**Key Decisions**:
1. Dual validation tools: standalone CLI script + pytest suite
2. 15 predefined test queries across 4 categories
3. Three-tier metadata validation (schema, types, consistency)
4. 8 quality metrics aligned with success criteria
5. Token-level chunk overlap validation
6. pytest organized into 3 classes matching user stories
7. Comprehensive edge case handling with warnings
8. Single new dependency: pytest>=8.0.0 (dev)
9. Ephemeral reports (stdout only, no persistence)

**Research Complete**: All technical unknowns from Technical Context resolved. Ready for Phase 1 design (data-model.md, contracts, quickstart.md).
