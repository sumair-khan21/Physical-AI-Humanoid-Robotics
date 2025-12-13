# Quickstart Guide: Qdrant Embeddings Ingestion Pipeline

**Feature**: Qdrant Embeddings Ingestion
**Last Updated**: 2025-12-11

## Overview

This guide walks you through setting up and running the embeddings ingestion pipeline to crawl the Physical AI Humanoid Robotics textbook site, generate embeddings, and store them in Qdrant.

**Total Setup Time**: ~15 minutes
**First Run Time**: ~20-30 minutes (depending on site size)

---

## Prerequisites

### Required Installations

1. **Python 3.11 or higher**
   ```bash
   python --version  # Should show 3.11+
   ```

2. **UV Package Manager**
   ```bash
   # Install UV (if not already installed)
   curl -LsSf https://astral.sh/uv/install.sh | sh

   # Verify installation
   uv --version
   ```

### Required Accounts (Free Tier)

1. **Cohere API Account**
   - Sign up: https://cohere.com/
   - Navigate to Dashboard → API Keys
   - Create new API key
   - Copy key (starts with `co_...`)
   - Free tier: 100 API calls/minute

2. **Qdrant Cloud Account**
   - Sign up: https://cloud.qdrant.io/
   - Create new cluster (select Free tier, 1GB)
   - Copy cluster URL (format: `https://xyz-abc123.qdrant.io:6333`)
   - Copy API key from cluster details

---

## Step 1: Project Setup

### Initialize Backend Project

```bash
# Create backend directory
mkdir -p backend
cd backend

# Initialize UV project
uv init

# Verify UV created pyproject.toml
ls -la
# Should see: pyproject.toml, .python-version
```

---

## Step 2: Install Dependencies

```bash
# Add all required packages
uv add cohere qdrant-client requests beautifulsoup4 tiktoken python-dotenv tenacity

# Add development dependencies
uv add --dev pytest

# Verify installation
uv pip list
```

**Expected Packages**:
- cohere >= 4.37.0
- qdrant-client >= 1.7.0
- requests >= 2.31.0
- beautifulsoup4 >= 4.12.0
- tiktoken >= 0.5.0
- python-dotenv >= 1.0.0
- tenacity >= 8.2.0
- pytest >= 7.4.0 (dev)

---

## Step 3: Environment Configuration

### Create Environment Template

Create `.env.example` file:

```bash
cat > .env.example << 'EOF'
# Cohere API Configuration
COHERE_API_KEY=your_cohere_api_key_here

# Qdrant Configuration
QDRANT_URL=https://your-cluster-id.qdrant.io:6333
QDRANT_API_KEY=your_qdrant_api_key_here

# Sitemap and Collection Configuration
SITEMAP_URL=https://physical-ai-humanoid-robotics-blond-eta.vercel.app/sitemap.xml
COLLECTION_NAME=rag_embedding

# Chunking Parameters
CHUNK_SIZE_MIN=300
CHUNK_SIZE_MAX=500
CHUNK_OVERLAP=30
EOF
```

### Create Actual Environment File

```bash
# Copy template to .env
cp .env.example .env

# Edit .env with your actual API keys
nano .env  # or vim, code, etc.
```

**Fill in**:
1. `COHERE_API_KEY`: Paste your Cohere API key
2. `QDRANT_URL`: Paste your Qdrant cluster URL
3. `QDRANT_API_KEY`: Paste your Qdrant API key

**Important**: Never commit `.env` to version control!

### Add to .gitignore

```bash
# Create/update .gitignore
cat >> ../.gitignore << 'EOF'
# Environment variables
.env
backend/.env

# Python
__pycache__/
*.py[cod]
*$py.class
.pytest_cache/
.venv/

# UV
.python-version
uv.lock
EOF
```

---

## Step 4: Verify Setup

### Test API Connections

Create a test script `test_setup.py`:

```python
import os
from dotenv import load_dotenv
import cohere
from qdrant_client import QdrantClient

# Load environment variables
load_dotenv()

# Test Cohere
try:
    co = cohere.Client(api_key=os.getenv('COHERE_API_KEY'))
    response = co.embed(texts=["test"], model='embed-english-v3.0')
    print(f"✓ Cohere API connected (vector dim: {len(response.embeddings[0])})")
except Exception as e:
    print(f"✗ Cohere API failed: {e}")

# Test Qdrant
try:
    client = QdrantClient(
        url=os.getenv('QDRANT_URL'),
        api_key=os.getenv('QDRANT_API_KEY')
    )
    collections = client.get_collections()
    print(f"✓ Qdrant connected (collections: {len(collections.collections)})")
except Exception as e:
    print(f"✗ Qdrant failed: {e}")

print("\nSetup verification complete!")
```

Run test:
```bash
uv run python test_setup.py
```

**Expected Output**:
```
✓ Cohere API connected (vector dim: 1024)
✓ Qdrant connected (collections: 0)

Setup verification complete!
```

---

## Step 5: Run the Pipeline

### First Run (Full Ingestion)

```bash
# Run main.py
uv run main.py
```

**Expected Progress Output**:
```
[INFO] Starting ingestion pipeline...
[INFO] Sitemap URL: https://physical-ai-humanoid-robotics-blond-eta.vercel.app/sitemap.xml
[INFO] Collection: rag_embedding

[INFO] Parsing sitemap...
[INFO] Found 156 URLs

[INFO] Creating Qdrant collection 'rag_embedding'...
[INFO] Collection created successfully

[INFO] Processing URLs...
[INFO] [1/156] Processing: /docs/intro
[INFO]   - Extracted: 1245 tokens
[INFO]   - Created: 4 chunks
[INFO]   - Generated embeddings: 4 vectors
[INFO]   - Uploaded to Qdrant: 4 points
[INFO] [2/156] Processing: /docs/chapter1/overview
...

[INFO] Pipeline complete!
[INFO] Summary:
[INFO]   - URLs processed: 156/156
[INFO]   - Total chunks created: 2,847
[INFO]   - Total embeddings generated: 2,847
[INFO]   - Total points uploaded: 2,847
[INFO]   - Errors: 0
[INFO] Execution time: 24m 13s
```

### Subsequent Runs (Idempotent)

Re-running the pipeline will skip already-processed URLs:

```bash
uv run main.py
```

**Expected Output**:
```
[INFO] Starting ingestion pipeline...
[INFO] Found 156 URLs
[INFO] [1/156] Skipping (already processed): /docs/intro
[INFO] [2/156] Skipping (already processed): /docs/chapter1/overview
...
[INFO] Summary:
[INFO]   - URLs processed: 0/156 (all previously ingested)
```

---

## Step 6: Verify Results

### Check Qdrant Dashboard

1. Log in to https://cloud.qdrant.io/
2. Navigate to your cluster
3. View Collections → `rag_embedding`
4. Verify:
   - Point count matches expected (~2,000-5,000)
   - Vector size: 1024
   - Distance metric: Cosine

### Query Test (Python)

Create `test_query.py`:

```python
from dotenv import load_dotenv
import os
from qdrant_client import QdrantClient
import cohere

load_dotenv()

# Initialize clients
qdrant = QdrantClient(
    url=os.getenv('QDRANT_URL'),
    api_key=os.getenv('QDRANT_API_KEY')
)
co = cohere.Client(api_key=os.getenv('COHERE_API_KEY'))

# Generate query embedding
query = "What is humanoid robotics?"
query_embedding = co.embed(
    texts=[query],
    model='embed-english-v3.0',
    input_type='search_query'  # Note: different from 'search_document'
).embeddings[0]

# Search Qdrant
results = qdrant.search(
    collection_name='rag_embedding',
    query_vector=query_embedding,
    limit=3
)

# Print results
print(f"Query: {query}\n")
for i, result in enumerate(results, 1):
    print(f"Result {i} (score: {result.score:.4f})")
    print(f"URL: {result.payload['url']}")
    print(f"Title: {result.payload['page_title']}")
    print(f"Text: {result.payload['text'][:200]}...")
    print()
```

Run:
```bash
uv run python test_query.py
```

**Expected Output**: Top 3 most relevant chunks about humanoid robotics.

---

## Troubleshooting

### Issue: "ModuleNotFoundError: No module named 'cohere'"

**Solution**: Ensure you're using `uv run`:
```bash
uv run python main.py  # Correct
python main.py  # Wrong - doesn't use UV environment
```

### Issue: "Cohere API rate limit exceeded"

**Solution**: Free tier has 100 calls/min. Pipeline includes retry logic with exponential backoff. Wait and it will resume automatically.

### Issue: "Qdrant storage quota exceeded"

**Solution**: Free tier is 1GB. Check dashboard for actual usage. Delete collection to reset:
```python
qdrant.delete_collection(collection_name='rag_embedding')
```

### Issue: "SITEMAP_URL unreachable"

**Solution**: Verify URL is correct and site is accessible:
```bash
curl https://physical-ai-humanoid-robotics-blond-eta.vercel.app/sitemap.xml
```

### Issue: "SSL certificate verification failed"

**Solution**: Add SSL verification bypass (development only):
```python
import requests
requests.get(url, verify=False)  # Not recommended for production
```

---

## Running Tests

### Unit Tests

```bash
# Run all tests
uv run pytest tests/

# Run specific test file
uv run pytest tests/test_chunking.py

# Run with verbose output
uv run pytest -v tests/
```

### Integration Test (Mini-Ingestion)

```bash
# Run integration test (processes 2 URLs)
uv run pytest tests/test_integration.py -v

# Expected: PASSED, ~30 seconds
```

---

## Monitoring Progress

### Real-time Logs

Pipeline logs to stdout. Redirect to file for analysis:
```bash
uv run main.py | tee ingestion.log
```

### Progress Tracking

Current implementation logs every URL. For quieter output, modify logging level:
```python
import logging
logging.basicConfig(level=logging.WARNING)  # Only show warnings/errors
```

---

## Cleanup

### Delete Collection

```python
from qdrant_client import QdrantClient
from dotenv import load_dotenv
import os

load_dotenv()
client = QdrantClient(
    url=os.getenv('QDRANT_URL'),
    api_key=os.getenv('QDRANT_API_KEY')
)

# Delete collection
client.delete_collection(collection_name='rag_embedding')
print("Collection deleted")
```

### Re-ingest from Scratch

```bash
# Delete collection first (see above), then:
uv run main.py
```

---

## Performance Optimization Tips

### Batch Size Tuning

Edit `.env`:
```bash
# Larger batches = faster, but higher risk of partial failures
COHERE_BATCH_SIZE=96  # Max allowed
QDRANT_BATCH_SIZE=100  # Recommended
```

### Parallel Processing (Future)

Current implementation is sequential. For faster ingestion:
1. Use `asyncio` for concurrent URL fetching
2. Maintain batch processing for APIs
3. Add semaphore to limit concurrency (avoid rate limits)

---

## Next Steps

After successful ingestion:

1. **Build Retrieval System** (separate feature)
   - Query embedding generation
   - Top-k similarity search
   - Re-ranking for relevance

2. **Deploy as Service**
   - Containerize with Docker
   - Schedule periodic updates (cron/Airflow)
   - Add monitoring/alerting

3. **Integrate with Application**
   - FastAPI backend for queries
   - Frontend search interface
   - RAG pipeline with LLM

---

## Support

**Documentation**: See `specs/001-qdrant-embeddings-ingestion/`
- `plan.md`: Architecture and design decisions
- `research.md`: Technology choices and best practices
- `data-model.md`: Entity definitions and relationships

**Issues**: Check logs for error messages and consult troubleshooting section above.

**API Documentation**:
- Cohere: https://docs.cohere.com/reference/embed
- Qdrant: https://qdrant.tech/documentation/
- UV: https://docs.astral.sh/uv/
