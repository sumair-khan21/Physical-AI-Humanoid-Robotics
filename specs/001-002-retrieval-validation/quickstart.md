# Quickstart: Qdrant Retrieval Validation

**Feature**: Retrieval validation for Qdrant embeddings ingestion pipeline
**Date**: 2025-12-12
**Estimated Time**: 10 minutes

## Overview

This guide walks you through validating your Qdrant collection after running the ingestion pipeline (Spec 1). You'll run validation scripts to check semantic search quality, metadata completeness, and retrieval performance.

**Prerequisites**:
- Spec 1 (Qdrant Embeddings Ingestion) completed
- At least 1 URL ingested into Qdrant collection
- Valid credentials in `backend/.env`

---

## Step 1: Verify Prerequisites

### Check Environment Setup

```bash
# Navigate to project root
cd /path/to/textbook_to_rag

# Verify .env file exists
ls backend/.env

# Expected output: backend/.env
```

### Check Collection Has Data

```bash
# Run the existing verify script from Spec 1
cd backend
uv run python verify_qdrant.py

# Expected output (example):
# ✓ Collection: 1024d vectors, cosine distance
# ✓ Points stored: 4
# ✓ Status: green
```

**If collection is empty**:
```bash
# Run ingestion pipeline first
uv run python main.py
```

---

## Step 2: Install pytest (Dev Dependency)

```bash
# From backend/ directory
uv add --dev pytest

# Verify installation
uv run pytest --version

# Expected output:
# pytest 8.x.x
```

**Note**: All other dependencies were already installed in Spec 1 (qdrant-client, cohere, etc.)

---

## Step 3: Run Standalone Validation Script

### Basic Validation

```bash
# Run validation with default settings
uv run python validate_retrieval.py

# Expected output (example):
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
...

SUCCESS CRITERIA
----------------
✓ SC-001: 87% queries >0.30 (target: 80%)
✓ SC-002: 100% metadata complete (target: 100%)
...

VALIDATION PASSED ✓
==================================================
```

### Verbose Validation (See All Query Results)

```bash
# Run with verbose output
uv run python validate_retrieval.py --verbose

# Shows individual query scores and latencies
```

### JSON Output (For Parsing/CI)

```bash
# Generate JSON report
uv run python validate_retrieval.py --report-format json > validation_report.json

# View JSON
cat validation_report.json | python -m json.tool

# Check pass/fail status
cat validation_report.json | python -c "import sys, json; print(json.load(sys.stdin)['validation_passed'])"
# Output: True or False
```

---

## Step 4: Run pytest Test Suite

### Run All Tests

```bash
# Run full test suite
uv run pytest test_validation.py

# Expected output (example):
========================= test session starts ==========================
collected 13 items

test_validation.py::TestBasicRetrieval::test_query_returns_results_above_threshold PASSED [ 7%]
test_validation.py::TestBasicRetrieval::test_query_latency_under_500ms PASSED [15%]
...
test_validation.py::TestQueryQuality::test_typo_variations_maintain_semantic_similarity PASSED [100%]

========================= 13 passed in 18.2s ===========================
```

### Run Verbose (Show Test Names)

```bash
# Verbose pytest output
uv run pytest test_validation.py -v

# Shows full test names and descriptions
```

### Run Specific Test Class

```bash
# Run only metadata validation tests
uv run pytest test_validation.py::TestMetadataCompleteness -v

# Output:
# test_all_points_have_required_fields PASSED
# test_metadata_fields_have_correct_types PASSED
# ...
```

### Run Specific Test

```bash
# Run single test
uv run pytest test_validation.py::TestBasicRetrieval::test_query_returns_results_above_threshold -v
```

---

## Step 5: Interpret Results

### Understanding Validation Reports

**Standalone Script** (`validate_retrieval.py`):
- **Exit Code 0**: All validation passed, collection is healthy
- **Exit Code 1**: Some success criteria not met (e.g., query scores too low)
- **Exit Code 2**: Configuration error (missing .env, bad credentials)
- **Exit Code 3**: Data error (empty collection, missing metadata)
- **Exit Code 4**: Runtime error (API failure, network issue)

**pytest** (`test_validation.py`):
- **All tests PASSED**: Collection meets all acceptance criteria ✓
- **Some tests FAILED**: Review failure messages for specific issues
- **Some tests SKIPPED**: Insufficient data (e.g., need 3+ URLs for diversity tests)

### Common Warnings

**"Limited data: only 1 unique URL in collection"**
- **Meaning**: Collection has content from only the homepage
- **Action**: Ingest more pages from the sitemap (re-run main.py or fix 404 errors)
- **Impact**: Can't fully test result diversity (SC-006)

**"Result diversity cannot be fully validated (need 3+ URLs)"**
- **Meaning**: Diversity metrics require at least 3 different source pages
- **Action**: Ensure sitemap has valid, accessible URLs
- **Impact**: Diversity test will be skipped (not a failure)

**"Chunk overlap validation skipped: insufficient sequential chunks"**
- **Meaning**: No single URL has 2+ chunks to compare
- **Action**: Ingest longer pages (that produce multiple chunks)
- **Impact**: Can't verify overlap setting from Spec 1

---

## Step 6: Troubleshooting

### Issue: Collection Empty

**Error**:
```
Error: Collection 'rag_embedding' is empty
Action: Run ingestion pipeline first (python backend/main.py)
```

**Solution**:
```bash
# Run ingestion pipeline
cd backend
uv run python main.py

# Verify data ingested
uv run python verify_qdrant.py
```

---

### Issue: Low Query Scores

**Error**:
```
FAILED test_query_returns_results_above_threshold
AssertionError: Query success rate 60% below threshold 80%
```

**Possible Causes**:
1. **Insufficient content**: Only homepage ingested, limited semantic diversity
2. **Content mismatch**: Ingested content doesn't match test queries (not about robotics)
3. **Embedding quality**: Cohere model mismatch or incorrect input_type

**Solution**:
```bash
# Check what content was actually ingested
uv run python verify_qdrant.py | grep "URL:"

# If only homepage:
# 1. Fix sitemap URLs (ensure they're accessible, not 404)
# 2. Re-run ingestion
# 3. Re-run validation
```

---

### Issue: API Rate Limits

**Error**:
```
Error: Cohere API rate limit exceeded
Action: Wait 60 seconds and retry, or reduce --sample-size
```

**Solution**:
```bash
# Option 1: Wait and retry
sleep 60
uv run python validate_retrieval.py

# Option 2: Reduce sample size (faster, fewer API calls)
uv run python validate_retrieval.py --sample-size 10
```

---

### Issue: Qdrant Connection Failed

**Error**:
```
Error: Failed to connect to Qdrant at <QDRANT_URL>
```

**Solution**:
```bash
# Verify .env credentials
cat backend/.env | grep QDRANT

# Test connection manually
uv run python -c "
from qdrant_client import QdrantClient
from dotenv import load_dotenv
import os
load_dotenv()
client = QdrantClient(url=os.getenv('QDRANT_URL'), api_key=os.getenv('QDRANT_API_KEY'))
print('Connection successful:', client.get_collections())
"
```

---

## Step 7: Next Steps

### After Validation Passes

1. **Document Results**: Save validation report for reference
   ```bash
   uv run python validate_retrieval.py > reports/validation_$(date +%Y%m%d).txt
   ```

2. **Proceed to Spec 3**: Build FastAPI + Agent backend with confidence in retrieval quality

3. **Set Up CI/CD** (Optional): Automate validation runs
   ```bash
   # Add to GitHub Actions workflow
   # See contracts/pytest-interface.md for example
   ```

### If Validation Fails

1. **Review Failures**: Check pytest output for specific test failures
   ```bash
   uv run pytest test_validation.py -v --tb=short
   ```

2. **Fix Issues**:
   - Low query scores → Ingest more relevant content
   - Missing metadata → Re-run ingestion with updated schema
   - Latency issues → Check network/API performance

3. **Re-validate**: Run tests again after fixes
   ```bash
   uv run pytest test_validation.py -v
   ```

---

## Quick Reference

### Common Commands

```bash
# Basic validation
uv run python validate_retrieval.py

# Verbose validation
uv run python validate_retrieval.py --verbose

# JSON output
uv run python validate_retrieval.py --report-format json

# Run all tests
uv run pytest test_validation.py

# Run tests verbose
uv run pytest test_validation.py -v

# Run specific test class
uv run pytest test_validation.py::TestBasicRetrieval -v

# Save report
uv run python validate_retrieval.py > report.txt
```

### File Locations

```
backend/
├── validate_retrieval.py      # Standalone validation script (NEW)
├── test_validation.py          # pytest test suite (NEW)
├── main.py                     # Ingestion pipeline (Spec 1)
├── verify_qdrant.py            # Basic verification (Spec 1)
└── .env                        # Credentials (Spec 1)
```

### Expected Success Criteria

| Criterion | Threshold | Description |
|-----------|-----------|-------------|
| SC-001 | ≥80% | Queries with top-1 score >0.30 |
| SC-002 | 100% | Points with complete metadata |
| SC-003 | ✓ | Collection stats accurate |
| SC-005 | <500ms | Average query latency |
| SC-007 | ✓ | No crashes/exceptions |

---

## Validation Complete

You've successfully validated your Qdrant collection!

**Summary**:
- ✅ Collection statistics verified
- ✅ Metadata completeness confirmed
- ✅ Query quality meets thresholds
- ✅ Retrieval performance acceptable

**Ready for**: Spec 3 (FastAPI + Agent Backend with RAG integration)
