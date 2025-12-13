# Qdrant Embeddings Ingestion Pipeline

Python backend for ingesting Docusaurus content into Qdrant vector database with Cohere embeddings.

## Overview

This pipeline crawls the Physical AI Humanoid Robotics textbook site, chunks the text, generates embeddings using Cohere, and stores them in Qdrant for semantic search and RAG applications.

**Features**:
- Sitemap-based URL discovery
- HTML text extraction optimized for Docusaurus
- Smart chunking (300-500 tokens, 30 token overlap)
- Cohere embeddings (1024-dimensional vectors)
- Idempotent processing (skips already-processed URLs)
- Batch processing for API efficiency

---

## Quick Start

### Prerequisites

- **Python 3.11+**
- **UV Package Manager** - Install with:
  ```bash
  curl -LsSf https://astral.sh/uv/install.sh | sh
  ```
- **Cohere API Key** - Sign up at [cohere.com](https://cohere.com/)
- **Qdrant Cloud Account** - Free tier at [cloud.qdrant.io](https://cloud.qdrant.io/)

### Installation

```bash
# Install dependencies
uv add cohere qdrant-client requests beautifulsoup4 tiktoken python-dotenv tenacity

# Install dev dependencies
uv add --dev pytest
```

### Configuration

1. Copy the environment template:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` with your API credentials:
   ```bash
   COHERE_API_KEY=your_cohere_api_key_here
   QDRANT_URL=https://your-cluster-id.qdrant.io:6333
   QDRANT_API_KEY=your_qdrant_api_key_here
   SITEMAP_URL=https://physical-ai-humanoid-robotics-blond-eta.vercel.app/sitemap.xml
   COLLECTION_NAME=rag_embedding
   CHUNK_SIZE_MIN=300
   CHUNK_SIZE_MAX=500
   CHUNK_OVERLAP=30
   ```

3. **Important**: Never commit `.env` to version control!

### Verify Setup

Test your API connections:

```python
# test_setup.py
import os
from dotenv import load_dotenv
import cohere
from qdrant_client import QdrantClient

load_dotenv()

# Test Cohere
try:
    co = cohere.Client(api_key=os.getenv('COHERE_API_KEY'))
    response = co.embed(texts=["test"], model='embed-english-v3.0')
    print(f" Cohere API connected (vector dim: {len(response.embeddings[0])})")
except Exception as e:
    print(f" Cohere API failed: {e}")

# Test Qdrant
try:
    client = QdrantClient(
        url=os.getenv('QDRANT_URL'),
        api_key=os.getenv('QDRANT_API_KEY')
    )
    collections = client.get_collections()
    print(f" Qdrant connected (collections: {len(collections.collections)})")
except Exception as e:
    print(f" Qdrant failed: {e}")
```

Run:
```bash
uv run python test_setup.py
```

---

## Usage

### Run the Pipeline

```bash
uv run main.py
```

**Expected output**:
```
[INFO] Starting ingestion pipeline...
[INFO] Found 156 URLs
[INFO] Creating Qdrant collection 'rag_embedding'...
[INFO] Processing URLs...
[INFO] [1/156] Processing: /docs/intro
[INFO]   - Extracted: 1245 tokens
[INFO]   - Created: 4 chunks
[INFO]   - Uploaded to Qdrant: 4 points
...
[INFO] Pipeline complete!
[INFO] Summary:
[INFO]   - URLs processed: 156/156
[INFO]   - Total chunks created: 2,847
[INFO]   - Total embeddings generated: 2,847
[INFO] Execution time: 24m 13s
```

### Subsequent Runs (Idempotent)

Re-running skips already-processed URLs:

```bash
uv run main.py
# [INFO] [1/156] Skipping (already processed): /docs/intro
```

---

## Architecture

The pipeline consists of 8 main functions in `main.py`:

1. **`get_all_urls(sitemap_url)`** - Parse sitemap XML and extract URLs
2. **`extract_text_from_url(url)`** - Fetch HTML and extract text content
3. **`chunk_text(text, min_size, max_size, overlap)`** - Split text into token-based chunks
4. **`embed(texts, cohere_client)`** - Generate Cohere embeddings in batches
5. **`create_collection(qdrant_client, collection_name)`** - Initialize Qdrant collection
6. **`save_chunk_to_qdrant(client, collection, chunks)`** - Upload embeddings to Qdrant
7. **`is_url_processed(client, collection, url)`** - Check if URL already processed
8. **`main()`** - Orchestrate the full pipeline

**Data Flow**:
```
Sitemap ’ URLs ’ HTML ’ Text ’ Chunks ’ Embeddings ’ Qdrant Points
```

---

## Testing

### Run Unit Tests

```bash
# All tests
uv run pytest tests/

# Specific test file
uv run pytest tests/test_chunking.py -v

# With coverage
uv run pytest --cov=. tests/
```

### Run Integration Test

```bash
# Mini-ingestion test (2 URLs)
uv run pytest tests/test_integration.py -v
```

---

## Troubleshooting

### ModuleNotFoundError

**Solution**: Always use `uv run`:
```bash
uv run python main.py  #  Correct
python main.py         #  Wrong
```

### Cohere API Rate Limit

**Solution**: Free tier allows 100 calls/min. Pipeline includes exponential backoff retry logic - it will automatically resume.

### Qdrant Storage Quota

**Solution**: Free tier is 1GB. Delete collection to reset:
```python
from qdrant_client import QdrantClient
import os
from dotenv import load_dotenv

load_dotenv()
client = QdrantClient(url=os.getenv('QDRANT_URL'), api_key=os.getenv('QDRANT_API_KEY'))
client.delete_collection(collection_name='rag_embedding')
```

### SSL Certificate Errors

**Solution**: Check network connectivity:
```bash
curl https://physical-ai-humanoid-robotics-blond-eta.vercel.app/sitemap.xml
```

---

## Verify Results

### Check Qdrant Dashboard

1. Log in to [cloud.qdrant.io](https://cloud.qdrant.io/)
2. Navigate to your cluster ’ Collections ’ `rag_embedding`
3. Verify:
   - Point count: ~2,000-5,000
   - Vector size: 1024
   - Distance metric: Cosine

### Query Test

```python
# test_query.py
from dotenv import load_dotenv
import os
from qdrant_client import QdrantClient
import cohere

load_dotenv()

qdrant = QdrantClient(url=os.getenv('QDRANT_URL'), api_key=os.getenv('QDRANT_API_KEY'))
co = cohere.Client(api_key=os.getenv('COHERE_API_KEY'))

query = "What is humanoid robotics?"
query_embedding = co.embed(
    texts=[query],
    model='embed-english-v3.0',
    input_type='search_query'
).embeddings[0]

results = qdrant.search(
    collection_name='rag_embedding',
    query_vector=query_embedding,
    limit=3
)

for i, result in enumerate(results, 1):
    print(f"Result {i} (score: {result.score:.4f})")
    print(f"URL: {result.payload['url']}")
    print(f"Text: {result.payload['text'][:200]}...\n")
```

---

## Documentation

For detailed architecture and design decisions, see:
- [`specs/001-qdrant-embeddings-ingestion/plan.md`](../specs/001-qdrant-embeddings-ingestion/plan.md) - Implementation plan
- [`specs/001-qdrant-embeddings-ingestion/research.md`](../specs/001-qdrant-embeddings-ingestion/research.md) - Technology choices
- [`specs/001-qdrant-embeddings-ingestion/data-model.md`](../specs/001-qdrant-embeddings-ingestion/data-model.md) - Entity definitions
- [`specs/001-qdrant-embeddings-ingestion/quickstart.md`](../specs/001-qdrant-embeddings-ingestion/quickstart.md) - Detailed setup guide

---

## API References

- [Cohere Embed API](https://docs.cohere.com/reference/embed)
- [Qdrant Documentation](https://qdrant.tech/documentation/)
- [UV Package Manager](https://docs.astral.sh/uv/)

---

## License

Part of the Physical AI Humanoid Robotics RAG system.
