---
id: 0002
title: Design Qdrant Ingestion Plan
stage: plan
date: 2025-12-11
surface: agent
model: claude-sonnet-4-5-20250929
feature: 001-qdrant-embeddings-ingestion
branch: 001-qdrant-embeddings-ingestion
user: sumair
command: /sp.plan
labels: ["architecture", "design", "planning", "embeddings", "qdrant", "cohere", "pipeline"]
links:
  spec: specs/001-qdrant-embeddings-ingestion/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/001-qdrant-embeddings-ingestion/plan.md
  - specs/001-qdrant-embeddings-ingestion/research.md
  - specs/001-qdrant-embeddings-ingestion/data-model.md
  - specs/001-qdrant-embeddings-ingestion/quickstart.md
  - specs/001-qdrant-embeddings-ingestion/contracts/qdrant-schema.json
tests:
  - Constitution check passed (code quality principles)
  - Architecture flow validated (6-stage pipeline)
  - Technology decisions documented (9 research areas)
---

## Prompt

### /sp.plan — Spec 1 (Short)

- backend folder and initialize project using **UV** package manager.
- Sketch architecture: crawler → cleaner → chunker → Cohere embedder → Qdrant uploader.
- Document decisions: chunk size, overlap, Cohere model, Qdrant distance metric, idempotency.
- Add testing plan: chunking unit tests, mini-ingestion on 1–2 URLs, validate vector count + metadata in Qdrant.
- setup **Cohere** and **Qdrant** clients
- only in one file name main.py system design ( get_all_urls, extract_text_from_url, chunk_text, embed, create_collection name rag_embedding, save_chunk_to_qdrant, and execute in last main function )
- here is deploy link: https://physical-ai-humanoid-robotics-blond-eta.vercel.app/
- here is SiteMap Url: https://physical-ai-humanoid-robotics-blond-eta.vercel.app/sitemap.xml

## Response snapshot

Created comprehensive implementation plan for Qdrant embeddings ingestion pipeline with:

**Plan Document (plan.md)**: 528 lines covering:
- Technical context (Python 3.11+, UV, dependencies)
- Project structure (backend/main.py, tests, docs)
- Constitution compliance check (PEP 8, docstrings, type hints)
- Architecture: Sitemap Parser → URL Crawler → HTML Extractor → Text Chunker → Cohere Embedder → Qdrant Uploader
- 5 key design decisions documented (single-file, UV, sitemap-first, URL deduplication, fail-safe errors)
- Performance estimates (15-30 min for 200 pages)
- Success criteria validation mapped to spec

**Research Document (research.md)**: 9 critical technology decisions:
1. Sitemap parsing (xml.etree.ElementTree)
2. HTML extraction (BeautifulSoup4 with Docusaurus selectors)
3. Tokenization (tiktoken with cl100k_base)
4. Chunking (sliding window, 400 tokens target, 30 overlap)
5. Cohere model (embed-english-v3.0, 1024d)
6. Qdrant config (cosine distance, 1024 vector size)
7. Idempotency (URL-based metadata queries)
8. Error handling (exponential backoff with tenacity)
9. Batch processing (96 Cohere, 100 Qdrant)

**Data Model (data-model.md)**: 5 entities defined:
- URL → Page → Chunk → Embedding → QdrantPoint
- Relationships: 1 sitemap → 50-200 URLs → 1000-5000 points
- Complete data flow (6 stages)
- Validation rules for each entity
- Storage schema with payload indexes

**Contracts (qdrant-schema.json)**: Complete JSON schema:
- Collection config (1024d, cosine, HNSW)
- Payload schema (text, url, chunk_index, page_title, token_count, created_at)
- Index recommendations (5 indexed fields)
- Query examples (similarity, filtered, metadata)

**Quickstart Guide (quickstart.md)**: Step-by-step setup:
- Prerequisites (Python 3.11+, UV, API accounts)
- 6-step setup (project init, dependencies, env config, verification, execution, validation)
- Troubleshooting guide (5 common issues)
- Test query example

## Outcome

- ✅ Impact: Complete technical design ready for implementation. All unknowns resolved. Architecture validated against spec requirements.
- 🧪 Tests: Testing strategy defined - unit tests (chunking, extraction), integration test (2-URL mini-ingestion), manual validation (full pipeline)
- 📁 Files: 5 planning artifacts created (plan.md, research.md, data-model.md, quickstart.md, qdrant-schema.json)
- 🔁 Next prompts: `/sp.tasks` to generate actionable implementation tasks, then begin coding with Phase 0 (project setup)
- 🧠 Reflection: Single-file design satisfies user requirement while maintaining modularity through function separation. UV package manager simplifies dependency management. Sitemap-first approach leverages Docusaurus structure for simple, predictable crawling. Idempotency via Qdrant metadata queries eliminates need for external state.

## Evaluation notes (flywheel)

- Failure modes observed: None - all research questions resolved, no constitution violations, architecture flow validated
- Graders run and results (PASS/FAIL): Constitution check PASS (PEP 8, docstrings, type hints, env vars, error handling)
- Prompt variant (if applicable): Standard /sp.plan workflow with user-specified constraints (UV, single-file main.py, specific URLs)
- Next experiment (smallest change to try): Proceed to /sp.tasks for task breakdown, then implement functions in order: get_all_urls → extract_text_from_url → chunk_text → embed → create_collection → save_chunk_to_qdrant → main
