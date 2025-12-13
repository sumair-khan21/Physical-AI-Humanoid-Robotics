# Data Model: Qdrant Retrieval Validation

**Feature**: Retrieval validation for Qdrant embeddings ingestion pipeline
**Date**: 2025-12-12

## Overview

This document defines the data entities used by the validation scripts. These are read-only data structures representing information retrieved from Qdrant and validation results. No data persistence is required - all entities are transient (created during validation execution and discarded after reporting).

---

## Entity 1: QueryResult

**Purpose**: Represents a single semantic search result returned from Qdrant for a given query.

**Attributes**:

| Field | Type | Description | Constraints | Source |
|-------|------|-------------|-------------|--------|
| `query_text` | `str` | The original query string | Non-empty | User input |
| `point_id` | `str` | UUID of the Qdrant point | UUID format | Qdrant |
| `score` | `float` | Cosine similarity score | 0.0 to 1.0 | Qdrant search |
| `text` | `str` | Retrieved chunk text content | Non-empty | Qdrant payload |
| `url` | `str` | Source URL of the chunk | Valid HTTP/HTTPS URL | Qdrant payload |
| `page_title` | `str` | Title of the source page | May be empty string | Qdrant payload |
| `chunk_index` | `int` | Position in chunked sequence | >= 0 | Qdrant payload |
| `token_count` | `int` | Number of tokens in chunk | 300-500 | Qdrant payload |
| `created_at` | `str` | ISO 8601 timestamp | Valid datetime string | Qdrant payload |
| `rank` | `int` | Position in result list (1-based) | >= 1 | Computed during query |

**Relationships**:
- Multiple `QueryResult` instances belong to one `ValidationReport`
- Each `QueryResult` corresponds to exactly one point in the Qdrant collection

**Validation Rules**:
- `score` must be between 0.0 and 1.0 (cosine similarity range)
- `token_count` should fall within configured chunk size range (300-500)
- `url` must be a valid HTTP/HTTPS URL matching the source sitemap
- `created_at` must be parseable as ISO 8601 datetime

**Example**:
```python
QueryResult(
    query_text="humanoid robotics kinematics",
    point_id="a3f2e1d4-8b6a-4c9e-b2d5-7f3a9e1c4b8d",
    score=0.4373,
    text="Kinematics is the study of motion without considering forces...",
    url="https://example.com/robotics/kinematics",
    page_title="Introduction to Robotics Kinematics",
    chunk_index=2,
    token_count=387,
    created_at="2025-12-11T14:23:45.123456",
    rank=1
)
```

**Usage in Validation**:
- Compare `score` against threshold (0.30 for relevance)
- Check `token_count` falls within expected range
- Verify metadata completeness (all fields non-null)
- Track which URLs appear in top-k results (diversity metric)

---

## Entity 2: ValidationReport

**Purpose**: Aggregated validation results including collection statistics, query performance metrics, metadata checks, and identified issues.

**Attributes**:

### Collection Statistics
| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| `collection_name` | `str` | Qdrant collection name | Always "rag_embedding" |
| `total_points` | `int` | Count of vectors in collection | >= 0 |
| `unique_urls` | `int` | Number of distinct source URLs | >= 0, <= total_points |
| `avg_chunk_size` | `float` | Mean token count | Typically 300-500 |
| `date_range_start` | `str` | Earliest created_at timestamp | ISO 8601 |
| `date_range_end` | `str` | Latest created_at timestamp | ISO 8601 |

### Query Performance Metrics
| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| `total_queries` | `int` | Number of test queries executed | Typically 15 |
| `avg_similarity_score` | `float` | Mean top-1 similarity across queries | 0.0 to 1.0 |
| `queries_above_threshold` | `int` | Count with top-1 score > 0.30 | 0 to total_queries |
| `success_rate` | `float` | queries_above_threshold / total_queries | 0.0 to 1.0 |
| `avg_query_latency_ms` | `float` | Mean latency (embedding + search) | Typically 200-500ms |
| `result_diversity_pct` | `float` | % unique URLs in top-10 results | 0.0 to 100.0 |

### Metadata Validation Results
| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| `points_sampled` | `int` | Number of points checked | Typically 20 |
| `schema_compliance_pct` | `float` | % with all required fields | 0.0 to 100.0 |
| `type_validation_pct` | `float` | % with correct field types | 0.0 to 100.0 |
| `overlap_validation_pass` | `bool` | Chunk overlap within tolerance | True/False |
| `overlap_avg_tokens` | `float` | Mean overlap between chunks | Typically ~30 |

### Success Criteria Status
| Field | Type | Description | Values |
|-------|------|-------------|--------|
| `sc001_pass` | `bool` | 80% queries >0.30 threshold | True/False |
| `sc002_pass` | `bool` | 100% metadata complete | True/False |
| `sc003_pass` | `bool` | Collection stats accurate | True/False |
| `sc005_pass` | `bool` | Latency <500ms | True/False |
| `sc007_pass` | `bool` | No crashes/exceptions | True/False |

### Issues and Warnings
| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| `issues` | `List[str]` | Critical problems found | Empty if all pass |
| `warnings` | `List[str]` | Non-critical anomalies | May include data limitations |

**Relationships**:
- Contains aggregated data from multiple `QueryResult` instances
- Contains aggregated data from multiple `MetadataValidation` results
- One `ValidationReport` generated per validation run

**Example**:
```python
ValidationReport(
    collection_name="rag_embedding",
    total_points=4,
    unique_urls=1,
    avg_chunk_size=387.5,
    date_range_start="2025-12-11T14:20:00",
    date_range_end="2025-12-12T10:15:00",
    total_queries=15,
    avg_similarity_score=0.42,
    queries_above_threshold=13,
    success_rate=0.867,
    avg_query_latency_ms=320.5,
    result_diversity_pct=25.0,  # Limited: only 1 URL in collection
    points_sampled=4,  # Limited: only 4 points total
    schema_compliance_pct=100.0,
    type_validation_pct=100.0,
    overlap_validation_pass=True,
    overlap_avg_tokens=30.2,
    sc001_pass=True,  # 87% > 80%
    sc002_pass=True,  # 100% = 100%
    sc003_pass=True,
    sc005_pass=True,  # 320ms < 500ms
    sc007_pass=True,
    issues=[],
    warnings=["Limited data: only 1 unique URL in collection"]
)
```

**Usage in Validation**:
- Generate human-readable summary report
- Assert pytest test pass/fail based on `sc*_pass` flags
- Track validation results over time (if persisted in future)
- Identify data quality issues early

---

## Entity 3: TestQuery

**Purpose**: Represents a predefined validation query with expected characteristics and metadata for test organization.

**Attributes**:

| Field | Type | Description | Constraints | Default |
|-------|------|-------------|-------------|---------|
| `query_text` | `str` | The query string to execute | Non-empty | - |
| `query_type` | `str` | Category of query | Enum: keyword, phrase, question, variation | - |
| `expected_min_score` | `float` | Minimum acceptable top-1 similarity | 0.0 to 1.0 | 0.30 |
| `expected_url_pattern` | `str` (optional) | Regex pattern for expected source URL | Valid regex | None |
| `description` | `str` | Human-readable purpose | Non-empty | - |

**Query Types**:
- `keyword`: Single-word query (e.g., "robotics", "sensors")
- `phrase`: Multi-word phrase (e.g., "inverse kinematics", "humanoid robotics")
- `question`: Natural language question (e.g., "what is inverse kinematics")
- `variation`: Spelling/typo variant for robustness testing (e.g., "robotic" vs "robotics")

**Relationships**:
- Multiple `TestQuery` instances used to generate `QueryResult` instances
- Each `TestQuery` produces one or more `QueryResult` objects (top-k results)

**Example**:
```python
TestQuery(
    query_text="humanoid robotics kinematics",
    query_type="phrase",
    expected_min_score=0.35,
    expected_url_pattern=r".*/kinematics.*",
    description="Multi-word phrase testing technical domain concepts"
)
```

**Test Query Set** (15 queries):
```python
TEST_QUERIES = [
    # Single-word keywords (3)
    TestQuery("robotics", "keyword", 0.30, None, "Broad domain keyword"),
    TestQuery("sensors", "keyword", 0.30, None, "Specific technical term"),
    TestQuery("kinematics", "keyword", 0.35, None, "Specialized subdomain"),

    # Multi-word phrases (4)
    TestQuery("humanoid robotics", "phrase", 0.35, None, "Core domain phrase"),
    TestQuery("inverse kinematics", "phrase", 0.40, r".*/kinematics.*", "Technical concept"),
    TestQuery("sensor fusion", "phrase", 0.35, None, "Integration concept"),
    TestQuery("control systems", "phrase", 0.30, None, "General systems concept"),

    # Questions (5)
    TestQuery("what is inverse kinematics", "question", 0.35, None, "Definition question"),
    TestQuery("how do humanoid robots work", "question", 0.30, None, "Explanation question"),
    TestQuery("what sensors are used in robotics", "question", 0.30, None, "Component question"),
    TestQuery("why is kinematics important", "question", 0.25, None, "Justification question"),
    TestQuery("where are humanoid robots used", "question", 0.25, None, "Application question"),

    # Variations (3)
    TestQuery("robotic", "variation", 0.30, None, "Singular vs plural test"),
    TestQuery("kinematic", "variation", 0.35, None, "Adjective form test"),
    TestQuery("humanoid robot", "variation", 0.35, None, "Singular form test"),
]
```

**Usage in Validation**:
- Iterate through TEST_QUERIES to execute validation suite
- Compare actual scores against `expected_min_score`
- Verify URL patterns for targeted content checks
- Calculate pass/fail statistics by `query_type`

---

## Entity 4: MetadataValidation

**Purpose**: Represents validation results for a single Qdrant point's metadata.

**Attributes**:

| Field | Type | Description | Values |
|-------|------|-------------|--------|
| `point_id` | `str` | UUID of the validated point | UUID format |
| `url` | `str` | Source URL from payload | HTTP/HTTPS URL |
| `schema_valid` | `bool` | All 6 required fields present | True/False |
| `types_valid` | `bool` | All fields have correct types | True/False |
| `text_valid` | `bool` | text is non-empty string | True/False |
| `url_valid` | `bool` | url starts with http | True/False |
| `page_title_valid` | `bool` | page_title is string | True/False |
| `chunk_index_valid` | `bool` | chunk_index is int >= 0 | True/False |
| `token_count_valid` | `bool` | token_count in range 300-500 | True/False |
| `created_at_valid` | `bool` | created_at is valid ISO 8601 | True/False |
| `issues` | `List[str]` | Specific validation failures | Empty if all valid |

**Validation Logic**:
```python
def validate_point_metadata(point) -> MetadataValidation:
    """Validate metadata for a single Qdrant point"""
    payload = point.payload
    required_fields = ['text', 'url', 'page_title', 'chunk_index', 'token_count', 'created_at']

    # Tier 1: Schema validation
    schema_valid = all(field in payload for field in required_fields)

    # Tier 2: Type validation
    issues = []
    text_valid = isinstance(payload.get('text'), str) and len(payload['text']) > 0
    url_valid = isinstance(payload.get('url'), str) and payload['url'].startswith('http')
    page_title_valid = isinstance(payload.get('page_title'), str)
    chunk_index_valid = isinstance(payload.get('chunk_index'), int) and payload['chunk_index'] >= 0
    token_count_valid = isinstance(payload.get('token_count'), int) and 300 <= payload['token_count'] <= 500
    created_at_valid = is_valid_iso8601(payload.get('created_at'))

    types_valid = all([text_valid, url_valid, page_title_valid, chunk_index_valid,
                       token_count_valid, created_at_valid])

    if not text_valid:
        issues.append("text is empty or not a string")
    if not url_valid:
        issues.append("url is invalid or not HTTP(S)")
    if not token_count_valid:
        issues.append(f"token_count {payload['token_count']} outside range 300-500")
    # ... etc

    return MetadataValidation(
        point_id=point.id,
        url=payload.get('url', 'MISSING'),
        schema_valid=schema_valid,
        types_valid=types_valid,
        text_valid=text_valid,
        url_valid=url_valid,
        page_title_valid=page_title_valid,
        chunk_index_valid=chunk_index_valid,
        token_count_valid=token_count_valid,
        created_at_valid=created_at_valid,
        issues=issues
    )
```

**Relationships**:
- Multiple `MetadataValidation` instances aggregated into `ValidationReport`
- Each `MetadataValidation` corresponds to one Qdrant point

**Usage in Validation**:
- Sample 20+ points and generate MetadataValidation for each
- Compute schema_compliance_pct = count(schema_valid) / total_sampled * 100
- Compute type_validation_pct = count(types_valid) / total_sampled * 100
- Collect issues for reporting

---

## Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    Validation Execution                      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ├── Phase 1: Collection Statistics
                            │   └──> Query Qdrant collection info
                            │       └──> Extract: total_points, unique_urls,
                            │           avg_chunk_size, date_range
                            │
                            ├── Phase 2: Metadata Validation
                            │   └──> Sample 20 points from Qdrant
                            │       └──> For each point:
                            │           └──> Create MetadataValidation
                            │               └──> Validate schema & types
                            │
                            ├── Phase 3: Query Quality Testing
                            │   └──> For each TestQuery in TEST_QUERIES:
                            │       ├──> Generate embedding (Cohere)
                            │       ├──> Search Qdrant (query_points)
                            │       └──> For each result:
                            │           └──> Create QueryResult
                            │               └──> Extract score, metadata
                            │
                            └── Phase 4: Report Generation
                                └──> Aggregate all results
                                    └──> Create ValidationReport
                                        ├──> Collection stats
                                        ├──> Query metrics (avg score, latency)
                                        ├──> Metadata validation %
                                        ├──> Success criteria pass/fail
                                        └──> Issues and warnings
```

---

## Implementation Notes

**Python Data Structures**:
- Use `@dataclass` for clean entity definitions
- Use `Optional[T]` for nullable fields
- Use `List[str]` for issues/warnings

**Example Implementation**:
```python
from dataclasses import dataclass
from typing import List, Optional

@dataclass
class QueryResult:
    query_text: str
    point_id: str
    score: float
    text: str
    url: str
    page_title: str
    chunk_index: int
    token_count: int
    created_at: str
    rank: int

@dataclass
class ValidationReport:
    # Collection statistics
    collection_name: str
    total_points: int
    unique_urls: int
    avg_chunk_size: float
    date_range_start: str
    date_range_end: str

    # Query metrics
    total_queries: int
    avg_similarity_score: float
    queries_above_threshold: int
    success_rate: float
    avg_query_latency_ms: float
    result_diversity_pct: float

    # Metadata validation
    points_sampled: int
    schema_compliance_pct: float
    type_validation_pct: float
    overlap_validation_pass: bool
    overlap_avg_tokens: float

    # Success criteria
    sc001_pass: bool
    sc002_pass: bool
    sc003_pass: bool
    sc005_pass: bool
    sc007_pass: bool

    # Issues
    issues: List[str]
    warnings: List[str]

@dataclass
class TestQuery:
    query_text: str
    query_type: str  # keyword | phrase | question | variation
    expected_min_score: float
    expected_url_pattern: Optional[str]
    description: str

@dataclass
class MetadataValidation:
    point_id: str
    url: str
    schema_valid: bool
    types_valid: bool
    text_valid: bool
    url_valid: bool
    page_title_valid: bool
    chunk_index_valid: bool
    token_count_valid: bool
    created_at_valid: bool
    issues: List[str]
```

**No Persistence Required**: All entities are transient. They exist only during validation script execution and are discarded after report generation (printed to stdout or used in pytest assertions).

---

## Summary

**4 Core Entities**:
1. **QueryResult** - Individual search result from Qdrant
2. **ValidationReport** - Aggregated validation metrics and pass/fail status
3. **TestQuery** - Predefined test query with expected characteristics
4. **MetadataValidation** - Metadata validation results for single point

**Key Relationships**:
- Multiple QueryResults → One ValidationReport
- Multiple TestQueries → Multiple QueryResults
- Multiple MetadataValidations → One ValidationReport

**All entities are read-only data structures** - no database schema, no API contracts, no state management. Pure validation data flow.
