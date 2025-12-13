"""
Quick script to verify Qdrant collection and query test.
"""
import os
from dotenv import load_dotenv
from qdrant_client import QdrantClient
import cohere

load_dotenv()

# Initialize clients
qdrant = QdrantClient(
    url=os.getenv('QDRANT_URL'),
    api_key=os.getenv('QDRANT_API_KEY')
)
co = cohere.Client(api_key=os.getenv('COHERE_API_KEY'))

# Get collection info
collection_info = qdrant.get_collection('rag_embedding')
print(f"\n✓ Collection: {collection_info.config.params.vectors.size}d vectors, {collection_info.config.params.vectors.distance} distance")
print(f"✓ Points stored: {collection_info.points_count}")
print(f"✓ Status: {collection_info.status}")

# Sample a few points
points = qdrant.scroll(
    collection_name='rag_embedding',
    limit=3,
    with_payload=True,
    with_vectors=False
)

print(f"\n✓ Sample points:")
for idx, point in enumerate(points[0], 1):
    print(f"\n  Point {idx}:")
    print(f"    URL: {point.payload.get('url')}")
    print(f"    Title: {point.payload.get('page_title')}")
    print(f"    Chunk index: {point.payload.get('chunk_index')}")
    print(f"    Token count: {point.payload.get('token_count')}")
    print(f"    Text preview: {point.payload.get('text')[:100]}...")

# Test query
query = "humanoid robotics"
query_embedding = co.embed(
    texts=[query],
    model='embed-english-v3.0',
    input_type='search_query'
).embeddings[0]

results = qdrant.query_points(
    collection_name='rag_embedding',
    query=query_embedding,
    limit=2
).points

print(f"\n✓ Query test: '{query}'")
for idx, result in enumerate(results, 1):
    print(f"\n  Result {idx} (score: {result.score:.4f}):")
    print(f"    URL: {result.payload['url']}")
    print(f"    Text: {result.payload['text'][:150]}...")

print("\n✓ Verification complete!")
