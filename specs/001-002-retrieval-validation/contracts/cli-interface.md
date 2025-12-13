# CLI Interface Contract: validate_retrieval.py

**Feature**: Qdrant Retrieval Validation
**Date**: 2025-12-12
**Contract Type**: Command-Line Interface Specification

## Overview

This document defines the command-line interface contract for `validate_retrieval.py`, a standalone validation script that tests Qdrant collection quality, runs semantic search queries, and generates validation reports.

---

## Command Signature

```bash
python backend/validate_retrieval.py [OPTIONS]
```

---

## Options

### `--collection-name TEXT`
- **Description**: Name of the Qdrant collection to validate
- **Default**: `rag_embedding` (from .env COLLECTION_NAME)
- **Required**: No
- **Example**: `--collection-name my_custom_collection`

### `--queries-file PATH`
- **Description**: Path to JSON file with custom test queries (overrides default TEST_QUERIES)
- **Default**: None (uses built-in TEST_QUERIES)
- **Required**: No
- **Format**: JSON array of objects with keys: query_text, query_type, expected_min_score, description
- **Example**: `--queries-file custom_queries.json`

### `--sample-size INT`
- **Description**: Number of points to sample for metadata validation
- **Default**: 20
- **Range**: 1 to 100
- **Required**: No
- **Example**: `--sample-size 50`

### `--k INT`
- **Description**: Number of top results to retrieve per query
- **Default**: 5
- **Range**: 1 to 20
- **Required**: No
- **Example**: `--k 10`

### `--threshold FLOAT`
- **Description**: Minimum similarity score for relevance (used in success criteria)
- **Default**: 0.30
- **Range**: 0.0 to 1.0
- **Required**: No
- **Example**: `--threshold 0.25`

### `--report-format {text|json}`
- **Description**: Output format for validation report
- **Default**: `text` (human-readable)
- **Choices**: `text`, `json`
- **Required**: No
- **Example**: `--report-format json`

### `--check-overlap`
- **Description**: Enable chunk overlap validation (requires sequential chunks from same URL)
- **Default**: Enabled
- **Required**: No
- **Flag**: Use `--no-check-overlap` to disable
- **Example**: `--no-check-overlap`

### `--verbose`
- **Description**: Enable verbose logging (show individual query results)
- **Default**: Disabled (summary only)
- **Required**: No
- **Flag**: Boolean flag
- **Example**: `--verbose`

### `--help`
- **Description**: Show help message and exit
- **Example**: `--help`

---

## Exit Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 0 | Success | All validation checks passed, no issues found |
| 1 | Validation Failed | One or more success criteria not met (e.g., <80% queries above threshold) |
| 2 | Configuration Error | Missing .env file, invalid credentials, or connection failure |
| 3 | Data Error | Collection empty, missing required metadata, or data corruption |
| 4 | Runtime Error | Unexpected exception (API failure, network error) |

---

## Output Format

### Text Format (Default)

```
==================================================
QDRANT COLLECTION VALIDATION REPORT
==================================================
Collection: rag_embedding
Generated: 2025-12-12 15:30:00
Runtime: 45.2s

COLLECTION STATISTICS
---------------------
Total Points: 4
Unique URLs: 1
Avg Chunk Size: 387 tokens
Date Range: 2025-12-11 14:20:00 to 2025-12-12 10:15:00

METADATA VALIDATION (20 samples)
--------------------------------
Schema Compliance: 20/20 (100%) ✓
Type Validation: 20/20 (100%) ✓
Token Count Range: All within 300-500 ✓
Chunk Overlap: Avg 30.2 tokens (±5 tolerance) ✓

QUERY QUALITY (15 test queries)
-------------------------------
Avg Top-1 Similarity: 0.42
Queries >0.30 threshold: 13/15 (87%) ✓ PASS
Avg Query Latency: 320ms ✓ PASS
Result Diversity: 25% (limited: only 1 URL)

TOP PERFORMING QUERIES:
  1. "inverse kinematics" → 0.62 (URL: .../kinematics)
  2. "humanoid robotics" → 0.54 (URL: .../)
  3. "sensor fusion" → 0.48 (URL: .../)

LOW SCORING QUERIES:
  1. "where are humanoid robots used" → 0.18 ✗
  2. "why is kinematics important" → 0.22 ✗

SUCCESS CRITERIA
----------------
✓ SC-001: 87% queries >0.30 (target: 80%)
✓ SC-002: 100% metadata complete (target: 100%)
✓ SC-003: Collection stats accurate
✓ SC-005: 320ms latency (target: <500ms)
✓ SC-007: No crashes/exceptions

WARNINGS
--------
⚠ Limited data: only 1 unique URL in collection
⚠ Result diversity cannot be fully validated (need 3+ URLs)

ISSUES FOUND: None
==================================================
VALIDATION PASSED ✓
==================================================
```

### JSON Format

```json
{
  "collection_name": "rag_embedding",
  "generated_at": "2025-12-12T15:30:00.123456",
  "runtime_seconds": 45.2,
  "collection_stats": {
    "total_points": 4,
    "unique_urls": 1,
    "avg_chunk_size": 387.5,
    "date_range_start": "2025-12-11T14:20:00",
    "date_range_end": "2025-12-12T10:15:00"
  },
  "metadata_validation": {
    "points_sampled": 20,
    "schema_compliance_pct": 100.0,
    "type_validation_pct": 100.0,
    "overlap_validation_pass": true,
    "overlap_avg_tokens": 30.2
  },
  "query_quality": {
    "total_queries": 15,
    "avg_similarity_score": 0.42,
    "queries_above_threshold": 13,
    "success_rate": 0.867,
    "avg_query_latency_ms": 320.5,
    "result_diversity_pct": 25.0,
    "top_queries": [
      {"query": "inverse kinematics", "score": 0.62},
      {"query": "humanoid robotics", "score": 0.54}
    ],
    "low_queries": [
      {"query": "where are humanoid robots used", "score": 0.18},
      {"query": "why is kinematics important", "score": 0.22}
    ]
  },
  "success_criteria": {
    "sc001_pass": true,
    "sc002_pass": true,
    "sc003_pass": true,
    "sc005_pass": true,
    "sc007_pass": true
  },
  "warnings": [
    "Limited data: only 1 unique URL in collection",
    "Result diversity cannot be fully validated (need 3+ URLs)"
  ],
  "issues": [],
  "validation_passed": true
}
```

---

## Environment Variables

The script reads configuration from `.env` file (same as Spec 1):

```bash
# Required
COHERE_API_KEY=<your-cohere-api-key>
QDRANT_URL=<qdrant-cloud-url>
QDRANT_API_KEY=<qdrant-api-key>
COLLECTION_NAME=rag_embedding

# Optional (used for context)
CHUNK_SIZE_MIN=300
CHUNK_SIZE_MAX=500
CHUNK_OVERLAP=30
```

**Error Handling**: If required variables are missing, exit with code 2 (Configuration Error) and display:
```
Error: Missing required environment variables.
Please ensure COHERE_API_KEY, QDRANT_URL, and QDRANT_API_KEY are set in .env file.
```

---

## Usage Examples

### Basic Validation
```bash
# Run validation with default settings
python backend/validate_retrieval.py

# Expected output: Text report to stdout, exit code 0 if passing
```

### Custom Query Set
```bash
# Use custom test queries
python backend/validate_retrieval.py --queries-file my_queries.json --verbose

# my_queries.json format:
[
  {
    "query_text": "custom query here",
    "query_type": "phrase",
    "expected_min_score": 0.35,
    "description": "Test custom domain concepts"
  }
]
```

### JSON Output for CI/CD
```bash
# Generate JSON report for parsing
python backend/validate_retrieval.py --report-format json > validation_report.json

# Parse with jq to check pass/fail
cat validation_report.json | jq '.validation_passed'
# Output: true or false
```

### Large Sample Validation
```bash
# Sample 50 points for metadata validation (when collection is large)
python backend/validate_retrieval.py --sample-size 50 --k 10

# Useful when collection has 100+ points
```

### Quick Check (Skip Overlap Validation)
```bash
# Fast validation without chunk overlap checks
python backend/validate_retrieval.py --no-check-overlap

# Saves ~5-10 seconds on large collections
```

### Redirect Output
```bash
# Save report to file
python backend/validate_retrieval.py > reports/validation_$(date +%Y%m%d).txt

# Append to log
python backend/validate_retrieval.py --verbose >> validation_history.log 2>&1
```

---

## Error Messages

### Configuration Errors (Exit Code 2)

```
Error: Failed to connect to Qdrant at <QDRANT_URL>
Cause: Invalid API key or network unreachable
Action: Verify QDRANT_API_KEY and QDRANT_URL in .env
```

```
Error: Cohere API authentication failed
Cause: Invalid COHERE_API_KEY
Action: Check your API key at https://dashboard.cohere.com
```

### Data Errors (Exit Code 3)

```
Error: Collection 'rag_embedding' is empty
Cause: No points found in collection
Action: Run ingestion pipeline first (python backend/main.py)
```

```
Error: Missing required metadata fields in sampled points
Cause: 15/20 points missing 'page_title' field
Action: Re-run ingestion with updated metadata schema
```

### Runtime Errors (Exit Code 4)

```
Error: Cohere API rate limit exceeded
Cause: Too many requests in short time
Action: Wait 60 seconds and retry, or reduce --sample-size
```

```
Error: Unexpected exception during validation
Cause: <exception details>
Action: Report issue with full error trace
```

---

## Performance Characteristics

| Operation | Typical Duration | Notes |
|-----------|------------------|-------|
| Collection stats | 100-200ms | Single Qdrant API call |
| Metadata sampling (20 points) | 200-500ms | Depends on collection size |
| Chunk overlap validation | 500-1000ms | Requires fetching + token comparison |
| Query suite (15 queries) | 4-8s | 15 × (Cohere embed + Qdrant search) |
| **Total validation** | **10-15s** | For current 4-point collection |
| **Total validation (large)** | **30-60s** | For 100+ point collection |

**Optimization Notes**:
- Queries are executed sequentially (no parallelization to avoid API rate limits)
- Metadata sampling uses random sampling (not full scan)
- Overlap validation can be disabled with `--no-check-overlap` for faster runs

---

## Dependencies

**Runtime Dependencies** (from Spec 1):
- `qdrant-client` (Qdrant API)
- `cohere` (Cohere embeddings API)
- `python-dotenv` (env var loading)
- `tiktoken` (token counting for overlap validation)

**Standard Library**:
- `argparse` (CLI parsing)
- `json` (JSON report format)
- `datetime` (timestamps)
- `statistics` (mean, median calculations)
- `time` (latency measurement)

**No Additional Dependencies** beyond Spec 1 requirements.

---

## Future Extensions

**Possible CLI additions** (not in current spec):
- `--continuous`: Run validation in loop, report changes
- `--compare PATH`: Compare current validation to historical report
- `--export-queries`: Save queries that failed to file for review
- `--slack-webhook URL`: Send report summary to Slack
- `--ci-mode`: Minimal output for CI/CD (only pass/fail)

These are **not implemented** in initial version but documented for future consideration.

---

## Contract Compliance

This CLI interface satisfies:
- **FR-002**: Configurable top-k results via `--k` option
- **FR-005**: Predefined query sets via default TEST_QUERIES or `--queries-file`
- **FR-007**: Summary report with collection statistics
- **FR-010**: Works with cloud-hosted Qdrant (uses QDRANT_URL from .env)

All functional requirements from spec.md are addressable via CLI options.
