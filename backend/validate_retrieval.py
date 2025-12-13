"""
Qdrant Retrieval Validation Script

Validates semantic search quality, metadata completeness, and retrieval performance
for the Qdrant embeddings ingestion pipeline (Spec 1).

Usage:
    uv run python validate_retrieval.py [options]

For detailed usage, run:
    uv run python validate_retrieval.py --help
"""

import os
from dataclasses import dataclass, field
from datetime import datetime
from typing import List, Optional, Dict, Any

# ============================================================================
# Data Models (Phase 2: T003-T006)
# ============================================================================


@dataclass
class QueryResult:
    """
    Represents a single query result from Qdrant semantic search.

    Attributes:
        query_text: Original query string
        point_id: Qdrant point ID (UUID)
        score: Similarity score (0.0-1.0, cosine distance)
        text: Retrieved chunk text content
        url: Source URL from metadata
        page_title: Page title from metadata
        chunk_index: Sequential chunk index for this URL
        token_count: Number of tokens in chunk
        created_at: Timestamp when point was ingested
        rank: Result rank (1-indexed) for this query
    """
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
    """
    Comprehensive validation report with collection statistics and quality metrics.

    Attributes:
        collection_name: Qdrant collection name
        generated_at: Report generation timestamp
        total_points: Total points in collection
        unique_urls: Number of unique source URLs
        avg_chunk_size: Average chunk size in tokens
        date_range_start: Earliest ingestion timestamp
        date_range_end: Latest ingestion timestamp
        queries_tested: Number of test queries executed
        avg_similarity_score: Average top-1 similarity score
        queries_above_threshold: Count of queries with score >threshold
        query_success_rate: Percentage of queries above threshold
        avg_query_latency_ms: Average query latency (embedding + search)
        metadata_sample_size: Number of points sampled for metadata validation
        schema_compliance_pct: Percentage with all required fields
        type_validation_pct: Percentage with correct field types
        chunk_overlap_validated: Whether overlap validation was performed
        chunk_overlap_pass: Whether overlap meets 30-token target (±5)
        result_diversity_pct: Percentage of unique URLs in broad query results
        validation_passed: Overall validation pass/fail
        success_criteria: Dict mapping SC-001 through SC-008 to pass/fail
        issues: List of warning/error messages
    """
    collection_name: str
    generated_at: datetime
    total_points: int
    unique_urls: int
    avg_chunk_size: float
    date_range_start: Optional[str]
    date_range_end: Optional[str]
    queries_tested: int
    avg_similarity_score: float
    queries_above_threshold: int
    query_success_rate: float
    avg_query_latency_ms: float
    metadata_sample_size: int
    schema_compliance_pct: float
    type_validation_pct: float
    chunk_overlap_validated: bool
    chunk_overlap_pass: Optional[bool]
    result_diversity_pct: Optional[float]
    validation_passed: bool
    success_criteria: Dict[str, bool] = field(default_factory=dict)
    issues: List[str] = field(default_factory=list)


@dataclass
class TestQuery:
    """
    Predefined test query with expected behavior characteristics.

    Attributes:
        query_text: Query string to test
        query_type: Category (keyword, phrase, question, variation)
        expected_min_score: Minimum acceptable similarity score
        expected_url_pattern: Expected URL substring in top results (optional)
        description: Human-readable description of query intent
    """
    query_text: str
    query_type: str  # keyword | phrase | question | variation
    expected_min_score: float
    expected_url_pattern: Optional[str]
    description: str


@dataclass
class MetadataValidation:
    """
    Metadata validation results for a single Qdrant point.

    Attributes:
        point_id: Qdrant point ID
        url: Source URL from metadata
        schema_valid: All 6 required fields present
        types_valid: All fields have correct types
        url_valid: URL is well-formed http/https
        chunk_index_valid: chunk_index is non-negative integer
        token_count_valid: token_count is positive integer
        created_at_valid: created_at is ISO 8601 timestamp
        issues: List of specific validation failures
    """
    point_id: str
    url: str
    schema_valid: bool
    types_valid: bool
    url_valid: bool
    chunk_index_valid: bool
    token_count_valid: bool
    created_at_valid: bool
    issues: List[str] = field(default_factory=list)


# ============================================================================
# Predefined Test Queries (Phase 3: T007)
# ============================================================================

TEST_QUERIES: List[TestQuery] = [
    # Keyword queries (3)
    TestQuery(
        query_text="embeddings",
        query_type="keyword",
        expected_min_score=0.30,
        expected_url_pattern=None,
        description="Single keyword about core ML concept"
    ),
    TestQuery(
        query_text="vector database",
        query_type="keyword",
        expected_min_score=0.30,
        expected_url_pattern=None,
        description="Two-word technical term"
    ),
    TestQuery(
        query_text="Qdrant Python client",
        query_type="keyword",
        expected_min_score=0.30,
        expected_url_pattern=None,
        description="Multi-word specific technology"
    ),

    # Phrase queries (4)
    TestQuery(
        query_text="how to store embeddings",
        query_type="phrase",
        expected_min_score=0.30,
        expected_url_pattern=None,
        description="How-to phrase query"
    ),
    TestQuery(
        query_text="semantic search with vectors",
        query_type="phrase",
        expected_min_score=0.30,
        expected_url_pattern=None,
        description="Descriptive phrase with technical terms"
    ),
    TestQuery(
        query_text="best practices for vector similarity",
        query_type="phrase",
        expected_min_score=0.28,
        expected_url_pattern=None,
        description="Best practices phrase (slightly lower threshold)"
    ),
    TestQuery(
        query_text="chunk overlap in text processing",
        query_type="phrase",
        expected_min_score=0.30,
        expected_url_pattern=None,
        description="Domain-specific phrase"
    ),

    # Question queries (5)
    TestQuery(
        query_text="What is a vector database?",
        query_type="question",
        expected_min_score=0.30,
        expected_url_pattern=None,
        description="Definitional question"
    ),
    TestQuery(
        query_text="How does semantic search work?",
        query_type="question",
        expected_min_score=0.30,
        expected_url_pattern=None,
        description="Process explanation question"
    ),
    TestQuery(
        query_text="Why use embeddings for search?",
        query_type="question",
        expected_min_score=0.28,
        expected_url_pattern=None,
        description="Reasoning question"
    ),
    TestQuery(
        query_text="When should I use cosine similarity?",
        query_type="question",
        expected_min_score=0.28,
        expected_url_pattern=None,
        description="Conditional question"
    ),
    TestQuery(
        query_text="Can Qdrant handle large collections?",
        query_type="question",
        expected_min_score=0.30,
        expected_url_pattern=None,
        description="Capability question"
    ),

    # Variation/typo queries (3)
    TestQuery(
        query_text="sematic search",  # typo: semantic
        query_type="variation",
        expected_min_score=0.25,
        expected_url_pattern=None,
        description="Common typo - semantic misspelled"
    ),
    TestQuery(
        query_text="vector db",  # abbreviation
        query_type="variation",
        expected_min_score=0.28,
        expected_url_pattern=None,
        description="Abbreviation for vector database"
    ),
    TestQuery(
        query_text="embedings storage",  # typo: embeddings
        query_type="variation",
        expected_min_score=0.25,
        expected_url_pattern=None,
        description="Typo in embeddings"
    ),
]


# ============================================================================
# Core Query Functions (Phase 3: T008-T009)
# ============================================================================

def query_collection(
    query_text: str,
    cohere_client,
    qdrant_client,
    collection_name: str,
    k: int = 5
) -> List[QueryResult]:
    """
    Query Qdrant collection with semantic search.

    Args:
        query_text: Query string to search
        cohere_client: Cohere client instance
        qdrant_client: Qdrant client instance
        collection_name: Name of Qdrant collection
        k: Number of results to return (default 5)

    Returns:
        List of QueryResult objects sorted by score (descending)
    """
    # Generate embedding for query
    response = cohere_client.embed(
        texts=[query_text],
        model="embed-english-v3.0",
        input_type="search_query",
        embedding_types=["float"]
    )
    query_vector = response.embeddings.float[0]

    # Search Qdrant
    search_results = qdrant_client.search(
        collection_name=collection_name,
        query_vector=query_vector,
        limit=k,
        with_payload=True
    )

    # Convert to QueryResult objects
    results = []
    for rank, hit in enumerate(search_results, start=1):
        results.append(QueryResult(
            query_text=query_text,
            point_id=str(hit.id),
            score=hit.score,
            text=hit.payload.get("text", ""),
            url=hit.payload.get("url", ""),
            page_title=hit.payload.get("page_title", ""),
            chunk_index=hit.payload.get("chunk_index", -1),
            token_count=hit.payload.get("token_count", 0),
            created_at=hit.payload.get("created_at", ""),
            rank=rank
        ))

    return results


def measure_query_latency(
    query_text: str,
    cohere_client,
    qdrant_client,
    collection_name: str,
    k: int = 5
) -> float:
    """
    Measure query latency (embedding generation + Qdrant search).

    Args:
        query_text: Query string to search
        cohere_client: Cohere client instance
        qdrant_client: Qdrant client instance
        collection_name: Name of Qdrant collection
        k: Number of results to return

    Returns:
        Latency in milliseconds
    """
    import time

    start_time = time.time()
    query_collection(query_text, cohere_client, qdrant_client, collection_name, k)
    end_time = time.time()

    latency_ms = (end_time - start_time) * 1000
    return latency_ms


# ============================================================================
# Collection Statistics Functions (Phase 3: T010-T011)
# ============================================================================

def get_collection_stats(qdrant_client, collection_name: str) -> Dict[str, Any]:
    """
    Get collection statistics from Qdrant.

    Args:
        qdrant_client: Qdrant client instance
        collection_name: Name of Qdrant collection

    Returns:
        Dictionary with:
            - total_points: Total points in collection
            - unique_urls: Number of unique source URLs
            - avg_chunk_size: Average chunk size in tokens
            - date_range_start: Earliest created_at timestamp
            - date_range_end: Latest created_at timestamp
    """
    # Get collection info
    collection_info = qdrant_client.get_collection(collection_name)
    total_points = collection_info.points_count

    # Scroll all points to calculate statistics
    all_points = []
    offset = None
    while True:
        result = qdrant_client.scroll(
            collection_name=collection_name,
            limit=100,
            offset=offset,
            with_payload=True,
            with_vectors=False
        )
        points, next_offset = result

        if not points:
            break

        all_points.extend(points)
        offset = next_offset

        if next_offset is None:
            break

    # Calculate statistics
    unique_urls = len(set(point.payload.get("url", "") for point in all_points))

    token_counts = [point.payload.get("token_count", 0) for point in all_points if point.payload.get("token_count", 0) > 0]
    avg_chunk_size = sum(token_counts) / len(token_counts) if token_counts else 0

    timestamps = [point.payload.get("created_at", "") for point in all_points if point.payload.get("created_at")]
    timestamps_sorted = sorted(timestamps)
    date_range_start = timestamps_sorted[0] if timestamps_sorted else None
    date_range_end = timestamps_sorted[-1] if timestamps_sorted else None

    return {
        "total_points": total_points,
        "unique_urls": unique_urls,
        "avg_chunk_size": avg_chunk_size,
        "date_range_start": date_range_start,
        "date_range_end": date_range_end
    }


def calculate_query_metrics(
    query_results: List[List[QueryResult]],
    threshold: float = 0.30
) -> Dict[str, Any]:
    """
    Calculate query quality metrics from query results.

    Args:
        query_results: List of query result lists (one per query)
        threshold: Similarity score threshold for success

    Returns:
        Dictionary with:
            - avg_similarity_score: Average top-1 similarity score
            - queries_above_threshold: Count of queries with top-1 score >threshold
            - success_rate: Percentage of queries above threshold
    """
    top_scores = [results[0].score for results in query_results if results]

    avg_similarity_score = sum(top_scores) / len(top_scores) if top_scores else 0.0
    queries_above_threshold = sum(1 for score in top_scores if score > threshold)
    success_rate = (queries_above_threshold / len(top_scores) * 100) if top_scores else 0.0

    return {
        "avg_similarity_score": avg_similarity_score,
        "queries_above_threshold": queries_above_threshold,
        "success_rate": success_rate
    }


# ============================================================================
# CLI Reporting Functions (Phase 3: T012-T013)
# ============================================================================

def generate_text_report(report: ValidationReport) -> str:
    """
    Generate human-readable text report from ValidationReport.

    Args:
        report: ValidationReport object

    Returns:
        Formatted text report string
    """
    lines = []
    lines.append("=" * 70)
    lines.append("QDRANT COLLECTION VALIDATION REPORT")
    lines.append("=" * 70)
    lines.append(f"Collection: {report.collection_name}")
    lines.append(f"Generated: {report.generated_at.strftime('%Y-%m-%d %H:%M:%S')}")
    lines.append("")

    lines.append("COLLECTION STATISTICS")
    lines.append("-" * 70)
    lines.append(f"Total Points: {report.total_points}")
    lines.append(f"Unique URLs: {report.unique_urls}")
    lines.append(f"Avg Chunk Size: {report.avg_chunk_size:.1f} tokens")
    if report.date_range_start and report.date_range_end:
        lines.append(f"Date Range: {report.date_range_start} to {report.date_range_end}")
    lines.append("")

    lines.append("QUERY QUALITY METRICS")
    lines.append("-" * 70)
    lines.append(f"Queries Tested: {report.queries_tested}")
    lines.append(f"Avg Similarity Score: {report.avg_similarity_score:.3f}")
    lines.append(f"Queries Above Threshold: {report.queries_above_threshold}/{report.queries_tested} ({report.query_success_rate:.1f}%)")
    lines.append(f"Avg Query Latency: {report.avg_query_latency_ms:.1f}ms")
    lines.append("")

    lines.append("METADATA VALIDATION")
    lines.append("-" * 70)
    lines.append(f"Sample Size: {report.metadata_sample_size} points")
    lines.append(f"Schema Compliance: {report.schema_compliance_pct:.1f}%")
    lines.append(f"Type Validation: {report.type_validation_pct:.1f}%")
    if report.chunk_overlap_validated:
        overlap_status = "✓ PASS" if report.chunk_overlap_pass else "✗ FAIL"
        lines.append(f"Chunk Overlap (30-token target): {overlap_status}")
    lines.append("")

    if report.result_diversity_pct is not None:
        lines.append("QUERY QUALITY ASSESSMENT")
        lines.append("-" * 70)
        lines.append(f"Result Diversity: {report.result_diversity_pct:.1f}%")
        lines.append("")

    lines.append("SUCCESS CRITERIA")
    lines.append("-" * 70)
    for criterion, passed in sorted(report.success_criteria.items()):
        status = "✓" if passed else "✗"
        lines.append(f"{status} {criterion}")
    lines.append("")

    if report.issues:
        lines.append("ISSUES")
        lines.append("-" * 70)
        for issue in report.issues:
            lines.append(f"⚠ {issue}")
        lines.append("")

    overall_status = "VALIDATION PASSED ✓" if report.validation_passed else "VALIDATION FAILED ✗"
    lines.append(overall_status)
    lines.append("=" * 70)

    return "\n".join(lines)


def generate_json_report(report: ValidationReport) -> str:
    """
    Generate JSON report from ValidationReport.

    Args:
        report: ValidationReport object

    Returns:
        JSON string
    """
    import json

    report_dict = {
        "collection_name": report.collection_name,
        "generated_at": report.generated_at.isoformat(),
        "collection_statistics": {
            "total_points": report.total_points,
            "unique_urls": report.unique_urls,
            "avg_chunk_size": round(report.avg_chunk_size, 2),
            "date_range_start": report.date_range_start,
            "date_range_end": report.date_range_end
        },
        "query_metrics": {
            "queries_tested": report.queries_tested,
            "avg_similarity_score": round(report.avg_similarity_score, 4),
            "queries_above_threshold": report.queries_above_threshold,
            "query_success_rate": round(report.query_success_rate, 2),
            "avg_query_latency_ms": round(report.avg_query_latency_ms, 2)
        },
        "metadata_validation": {
            "sample_size": report.metadata_sample_size,
            "schema_compliance_pct": round(report.schema_compliance_pct, 2),
            "type_validation_pct": round(report.type_validation_pct, 2),
            "chunk_overlap_validated": report.chunk_overlap_validated,
            "chunk_overlap_pass": report.chunk_overlap_pass
        },
        "result_diversity_pct": round(report.result_diversity_pct, 2) if report.result_diversity_pct is not None else None,
        "success_criteria": report.success_criteria,
        "issues": report.issues,
        "validation_passed": report.validation_passed
    }

    return json.dumps(report_dict, indent=2)


# ============================================================================
# Main Entry Point
# ============================================================================

if __name__ == "__main__":
    print("Qdrant Retrieval Validation Script")
    print("Data models loaded successfully.")
    print("\nPhase 2 (T003-T006): ✓ Complete")
    print("- QueryResult dataclass: 10 attributes")
    print("- ValidationReport dataclass: 23 attributes")
    print("- TestQuery dataclass: 5 attributes")
    print("- MetadataValidation dataclass: 9 attributes")
    print("\nNext: Phase 3 implementation (query functions)")
