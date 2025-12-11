# pytest Interface Contract: test_validation.py

**Feature**: Qdrant Retrieval Validation
**Date**: 2025-12-12
**Contract Type**: pytest Test Suite Specification

## Overview

This document defines the pytest test suite contract for `test_validation.py`, which validates Qdrant collection quality through automated tests aligned with acceptance criteria and success criteria from the specification.

---

## Test Execution

### Basic Usage

```bash
# Run all validation tests
pytest backend/test_validation.py

# Run with verbose output
pytest backend/test_validation.py -v

# Run specific test class
pytest backend/test_validation.py::TestBasicRetrieval

# Run specific test
pytest backend/test_validation.py::TestMetadataCompleteness::test_all_points_have_required_fields

# Run with output capture disabled (show print statements)
pytest backend/test_validation.py -s

# Generate JUnit XML report (for CI/CD)
pytest backend/test_validation.py --junit-xml=test-results.xml
```

---

## Test Organization

### Test Classes

Tests are organized into **3 classes** matching specification user stories:

```python
class TestBasicRetrieval:
    """User Story 1 - Basic Retrieval Verification (Priority P1)"""
    # 4 tests covering query quality and performance

class TestMetadataCompleteness:
    """User Story 2 - Metadata Completeness Validation (Priority P2)"""
    # 5 tests covering metadata fields, types, and consistency

class TestQueryQuality:
    """User Story 3 - Query Quality Assessment (Priority P3)"""
    # 4 tests covering diverse query types and semantic robustness
```

**Total**: 13 test functions covering all acceptance scenarios from spec.md

---

## Fixtures

### Session-Scoped Fixtures (Shared Across All Tests)

```python
@pytest.fixture(scope="session")
def qdrant_client() -> QdrantClient:
    """
    Initialized Qdrant client for all tests.
    Reads QDRANT_URL and QDRANT_API_KEY from .env.
    """
    # Returns: QdrantClient instance
    # Scope: session (created once, reused for all tests)

@pytest.fixture(scope="session")
def cohere_client() -> cohere.Client:
    """
    Initialized Cohere client for all tests.
    Reads COHERE_API_KEY from .env.
    """
    # Returns: cohere.Client instance
    # Scope: session (created once, reused for all tests)

@pytest.fixture(scope="session")
def collection_name() -> str:
    """
    Qdrant collection name from .env.
    """
    # Returns: str (default: "rag_embedding")
    # Scope: session

@pytest.fixture(scope="session")
def test_queries() -> List[TestQuery]:
    """
    Predefined test query set (15 queries).
    """
    # Returns: List[TestQuery] from validate_retrieval.TEST_QUERIES
    # Scope: session
```

### Function-Scoped Fixtures (Per-Test)

```python
@pytest.fixture
def sample_points(qdrant_client, collection_name) -> List[ScoredPoint]:
    """
    Random sample of 20 points from collection for metadata validation.
    """
    # Returns: List of Qdrant ScoredPoint objects
    # Scope: function (fresh sample for each test)
    # Note: Skips if collection has <20 points

@pytest.fixture
def collection_stats(qdrant_client, collection_name) -> dict:
    """
    Collection statistics for validation.
    """
    # Returns: dict with keys: total_points, unique_urls, avg_chunk_size
    # Scope: function
```

---

## Test Class 1: TestBasicRetrieval

**User Story 1 - Basic Retrieval Verification (P1)**

### test_query_returns_results_above_threshold

**Acceptance Criteria**: SC-001 - At least 80% of queries return top-1 similarity score >0.30

```python
def test_query_returns_results_above_threshold(
    self, qdrant_client, cohere_client, collection_name, test_queries
):
    """
    SC-001: At least 80% of test queries return results with top-1 similarity >0.30
    """
    # Execute: Run all 15 test queries
    # Assert: (passed_queries / total_queries) >= 0.80
    # Pass condition: 12+ queries have top-1 score >0.30
```

**Exit Behavior**:
- **PASS** if ≥12 queries score >0.30
- **FAIL** if <12 queries score >0.30 (prints failing query details)

---

### test_query_latency_under_500ms

**Acceptance Criteria**: SC-005 - Average query latency <500ms

```python
def test_query_latency_under_500ms(
    self, qdrant_client, cohere_client, collection_name, test_queries
):
    """
    SC-005: Average query latency (embedding + search) < 500ms
    """
    # Execute: Measure latency for 15 queries
    # Assert: mean(latencies) < 500
    # Pass condition: Average latency <500ms
```

**Exit Behavior**:
- **PASS** if avg latency <500ms
- **FAIL** if avg latency ≥500ms (prints actual average)

---

### test_top_result_url_matches_intent

**Acceptance Scenario 1.2**: Top result comes from most relevant page

```python
def test_top_result_url_matches_intent(
    self, qdrant_client, cohere_client, collection_name
):
    """
    Acceptance 1.2: Specific technical term returns result from relevant page
    """
    # Execute: Query "inverse kinematics" (if expected_url_pattern defined)
    # Assert: Top result URL matches pattern r".*/kinematics.*"
    # Pass condition: URL pattern match or skip if pattern not defined
```

**Exit Behavior**:
- **PASS** if top result URL matches expected pattern
- **SKIP** if query has no expected_url_pattern defined
- **FAIL** if URL doesn't match pattern

---

### test_similar_queries_return_overlapping_results

**Acceptance Scenario 1.3**: Similar semantics produce overlapping results

```python
def test_similar_queries_return_overlapping_results(
    self, qdrant_client, cohere_client, collection_name
):
    """
    Acceptance 1.3: Queries with similar semantics have 2/3 overlapping top-3 results
    """
    # Execute: Query pairs: ("robotics", "robotic"), ("humanoid robotics", "humanoid robot")
    # Assert: Overlap ≥2 out of top-3 results for each pair
    # Pass condition: At least 2 shared point IDs in top-3
```

**Exit Behavior**:
- **PASS** if ≥2 results overlap for all query pairs
- **FAIL** if any pair has <2 overlapping results

---

## Test Class 2: TestMetadataCompleteness

**User Story 2 - Metadata Completeness Validation (P2)**

### test_all_points_have_required_fields

**Acceptance Criteria**: SC-002 - 100% of sampled points have all 6 required metadata fields

```python
def test_all_points_have_required_fields(
    self, qdrant_client, collection_name, sample_points
):
    """
    SC-002: 100% of sampled points contain all required metadata fields
    """
    # Execute: Validate 20 sampled points
    # Assert: All points have: text, url, page_title, chunk_index, token_count, created_at
    # Pass condition: 20/20 points have all fields
```

**Exit Behavior**:
- **PASS** if all sampled points have 6 required fields
- **FAIL** if any point missing fields (prints point IDs and missing fields)

---

### test_metadata_fields_have_correct_types

**Acceptance Scenario 2.1**: Metadata fields have expected data types

```python
def test_metadata_fields_have_correct_types(
    self, qdrant_client, collection_name, sample_points
):
    """
    Acceptance 2.1: All metadata fields have correct types and non-empty values
    """
    # Execute: Type-check each field for 20 sampled points
    # Assert: text is str, url is str (starts with http), chunk_index is int, etc.
    # Pass condition: All type checks pass for all points
```

**Exit Behavior**:
- **PASS** if all type validations pass
- **FAIL** if any type check fails (prints point ID and field type error)

---

### test_chunk_indices_are_sequential

**Acceptance Scenario 2.2**: Sequential chunks from same URL have sequential indices

```python
def test_chunk_indices_are_sequential(
    self, qdrant_client, collection_name
):
    """
    Acceptance 2.2: Chunks from same URL have sequential indices (0, 1, 2, ...)
    """
    # Execute: Fetch all chunks for each unique URL
    # Assert: chunk_index values form sequence with no gaps
    # Pass condition: All URLs have gapless sequences
```

**Exit Behavior**:
- **PASS** if all URLs have sequential chunk indices
- **SKIP** if collection has <2 chunks for any URL (insufficient data)
- **FAIL** if any URL has gaps (e.g., 0, 1, 3 missing 2)

---

### test_created_at_timestamps_valid

**Acceptance Scenario 2.3**: created_at is valid ISO 8601 datetime

```python
def test_created_at_timestamps_valid(
    self, qdrant_client, collection_name, sample_points
):
    """
    Acceptance 2.3: created_at timestamps are valid ISO 8601 format
    """
    # Execute: Parse created_at for 20 sampled points
    # Assert: datetime.fromisoformat(created_at) succeeds
    # Pass condition: All timestamps parse successfully
```

**Exit Behavior**:
- **PASS** if all timestamps are valid ISO 8601
- **FAIL** if any timestamp fails parsing (prints invalid timestamp)

---

### test_token_counts_within_range

**Acceptance Scenario 2.4**: token_count falls within configured range (300-500)

```python
def test_token_counts_within_range(
    self, qdrant_client, collection_name, sample_points
):
    """
    Acceptance 2.4: All chunks have token_count between 300-500
    """
    # Execute: Check token_count for 20 sampled points
    # Assert: 300 <= token_count <= 500
    # Pass condition: All points within range
```

**Exit Behavior**:
- **PASS** if all token counts in range
- **FAIL** if any point outside range (prints point ID and actual token count)

---

## Test Class 3: TestQueryQuality

**User Story 3 - Query Quality Assessment (P3)**

### test_average_similarity_above_threshold

**Acceptance Scenario 3.1**: Average top-1 similarity score >0.35 for test queries

```python
def test_average_similarity_above_threshold(
    self, qdrant_client, cohere_client, collection_name, test_queries
):
    """
    Acceptance 3.1: Average top-1 similarity score across 15 queries >0.35
    """
    # Execute: Query all 15 test queries
    # Assert: mean(top_1_scores) > 0.35
    # Pass condition: Average score >0.35
```

**Exit Behavior**:
- **PASS** if average >0.35
- **FAIL** if average ≤0.35 (prints actual average)

---

### test_technical_questions_return_relevant_content

**Acceptance Scenario 3.2**: Technical questions return relevant results

```python
def test_technical_questions_return_relevant_content(
    self, qdrant_client, cohere_client, collection_name
):
    """
    Acceptance 3.2: "how does inverse kinematics work" returns 3/5 results about kinematics
    """
    # Execute: Query "how does inverse kinematics work", get top-5
    # Assert: At least 3/5 results contain "kinematics" in text or URL
    # Pass condition: 3+ results are relevant
```

**Exit Behavior**:
- **PASS** if ≥3 results match relevance criteria
- **FAIL** if <3 results are relevant (prints actual count)
- **SKIP** if collection lacks sufficient content about kinematics

---

### test_broad_queries_show_diversity

**Acceptance Scenario 3.3**: Broad queries return results from multiple URLs

```python
def test_broad_queries_show_diversity(
    self, qdrant_client, cohere_client, collection_name, collection_stats
):
    """
    Acceptance 3.3: Broad query "sensors" returns results from 3+ different URLs
    """
    # Execute: Query "sensors", get top-10
    # Assert: len(unique_urls_in_results) >= 3
    # Pass condition: At least 3 unique URLs
```

**Exit Behavior**:
- **PASS** if ≥3 unique URLs in top-10
- **SKIP** if collection has <3 unique URLs total (insufficient diversity)
- **FAIL** if <3 unique URLs in results despite having 3+ in collection

---

### test_typo_variations_maintain_semantic_similarity

**Acceptance Scenario 3.4**: Typo/spelling variants maintain semantic similarity

```python
def test_typo_variations_maintain_semantic_similarity(
    self, qdrant_client, cohere_client, collection_name
):
    """
    Acceptance 3.4: "robotic" vs "robotics" return semantically similar results
    """
    # Execute: Query pairs with variations:
    #   - ("robotics", "robotic")
    #   - ("kinematics", "kinematic")
    # Assert: Top-3 results have ≥2 overlapping point IDs for each pair
    # Pass condition: Semantic similarity maintained despite lexical difference
```

**Exit Behavior**:
- **PASS** if all variation pairs have ≥2 overlapping results
- **FAIL** if any pair has <2 overlapping results

---

## Test Markers and Categorization

### Markers

```python
# Mark slow tests (>5s execution time)
@pytest.mark.slow
def test_query_latency_under_500ms(...):
    # Takes ~5-10s to run all queries

# Mark tests requiring minimum data
@pytest.mark.requires_data
def test_broad_queries_show_diversity(...):
    # Requires collection with 3+ unique URLs

# Mark integration tests (external APIs)
@pytest.mark.integration
class TestBasicRetrieval:
    # All tests use Qdrant + Cohere APIs
```

### Running Specific Markers

```bash
# Skip slow tests
pytest backend/test_validation.py -m "not slow"

# Run only integration tests
pytest backend/test_validation.py -m integration

# Run fast, non-integration tests
pytest backend/test_validation.py -m "not slow and not integration"
```

---

## Skip Conditions

Tests automatically skip when preconditions aren't met:

```python
# Skip if collection is empty
if collection_stats['total_points'] == 0:
    pytest.skip("Collection empty. Run ingestion pipeline first.")

# Skip if insufficient URLs for diversity test
if collection_stats['unique_urls'] < 3:
    pytest.skip("Insufficient unique URLs for diversity test (need 3+)")

# Skip if query has no expected URL pattern
if test_query.expected_url_pattern is None:
    pytest.skip("No expected URL pattern defined for this query")
```

**Skip Reasons Displayed in pytest Output**:
```
SKIPPED [1] test_validation.py:42: Collection empty. Run ingestion pipeline first.
SKIPPED [1] test_validation.py:87: Insufficient unique URLs for diversity test (need 3+)
```

---

## Failure Output Format

### Detailed Failure Messages

```python
# Example failure for SC-001
def test_query_returns_results_above_threshold(...):
    assert passed >= threshold, (
        f"Query success rate {success_rate:.1%} below threshold {0.80:.0%}\n"
        f"Passed: {passed}/{total} queries\n"
        f"Failing queries:\n" +
        "\n".join(f"  - '{q.query_text}': {score:.3f}" for q, score in failing_queries)
    )

# Output on failure:
"""
AssertionError: Query success rate 73.3% below threshold 80%
Passed: 11/15 queries
Failing queries:
  - 'where are humanoid robots used': 0.182
  - 'why is kinematics important': 0.224
  - 'what sensors are used': 0.278
  - 'sensor fusion': 0.295
"""
```

---

## Performance Characteristics

| Test Class | Tests | Avg Duration | Notes |
|------------|-------|--------------|-------|
| TestBasicRetrieval | 4 | 8-12s | Runs 15+ queries (slow) |
| TestMetadataCompleteness | 5 | 1-2s | Fast metadata checks |
| TestQueryQuality | 4 | 6-10s | Multiple query executions |
| **Total Suite** | **13** | **15-25s** | For current 4-point collection |

**Parallelization**:
- pytest-xdist can parallelize test classes: `pytest -n 3` (run 3 classes in parallel)
- Not recommended for this suite (may hit API rate limits)

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Validate Qdrant Collection

on:
  schedule:
    - cron: '0 */6 * * *'  # Every 6 hours
  workflow_dispatch:  # Manual trigger

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: '3.12'

      - name: Install dependencies
        run: |
          pip install uv
          cd backend && uv sync

      - name: Run validation tests
        env:
          COHERE_API_KEY: ${{ secrets.COHERE_API_KEY }}
          QDRANT_URL: ${{ secrets.QDRANT_URL }}
          QDRANT_API_KEY: ${{ secrets.QDRANT_API_KEY }}
          COLLECTION_NAME: rag_embedding
        run: |
          cd backend
          pytest test_validation.py -v --junit-xml=test-results.xml

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: test-results
          path: backend/test-results.xml
```

### Success/Failure Notifications

```bash
# Exit code 0 = all tests passed (CI passes)
# Exit code 1 = one or more tests failed (CI fails)
# Exit code 2 = pytest errors (collection issues, config errors)
```

---

## Environment Configuration

### Required Environment Variables

```bash
# .env file (same as Spec 1)
COHERE_API_KEY=<key>
QDRANT_URL=<url>
QDRANT_API_KEY=<key>
COLLECTION_NAME=rag_embedding
```

### Optional Override via pytest

```bash
# Override collection name
COLLECTION_NAME=test_collection pytest backend/test_validation.py

# Use different .env file
ENV_FILE=.env.test pytest backend/test_validation.py
```

---

## Dependencies

**Required** (from Spec 1):
- qdrant-client
- cohere
- python-dotenv
- tiktoken

**New**:
- pytest>=8.0.0 (dev dependency)

**Standard Library**:
- datetime, statistics, time, re

---

## Contract Compliance

This pytest suite satisfies all acceptance scenarios from spec.md:
- **User Story 1**: 4 tests covering basic retrieval (Acceptance 1.1, 1.2, 1.3)
- **User Story 2**: 5 tests covering metadata (Acceptance 2.1, 2.2, 2.3, 2.4)
- **User Story 3**: 4 tests covering quality (Acceptance 3.1, 3.2, 3.3, 3.4)
- **Success Criteria**: Direct assertions for SC-001, SC-002, SC-005, SC-007

All functional requirements addressable via pytest test execution.
