# Technical Architecture for RAG-Based Resume Search

## Project Context

This project is a Node.js and Express backend for enterprise resume
search. It uses MongoDB for storage and Mistral for embeddings and
LLM-assisted ranking and summarization. The implementation is designed
as a layered monolith so it can evolve into a containerized service later.

### Environment Variables

The app reads the following values from the local environment:

- MongoDB connection: `MONGODB_URI`, `MONGODB_DB_NAME`,
  `MONGODB_COLLECTION_NAME`
- Protected API routes: `API_ACCESS_TOKEN`
- BM25 index: `MONGODB_BM25_INDEX`
- Vector index: `MONGODB_VECTOR_INDEX`
- Mistral embeddings: `MISTRAL_API_KEY`, `MISTRAL_EMBEDDING_MODEL`
- Groq LLM: `GROQ_API_KEY`, `GROQ_LLM_MODEL`

The current defaults are aligned to the project setup:

- `MONGODB_DB_NAME=ragresume`
- `MONGODB_COLLECTION_NAME=resume`
- `MONGODB_BM25_INDEX=BM25`
- `MONGODB_VECTOR_INDEX=vector_index`

## Architecture Summary

The backend is organized into clear layers:

- API layer: Express routes and request validation
- Service layer: search, embedding, reranking, and summarization logic
- Repository layer: MongoDB access and Atlas Search integration
- Middleware layer: logging, request IDs, size limits, and errors
- Shared types: DTOs and interfaces for the app

## Data Model

The primary collection is `resume`.
Each document can store the raw text, derived metadata, and an embedding.
A representative document looks like this:

```json
{
  "name": "Example Candidate",
  "email": "candidate@example.invalid",
  "company": "Example Company",
  "role": "QA Engineer",
  "skills": ["Java", "Selenium", "Playwright"],
  "rawText": "Resume content goes here",
  "embedding": []
}
```

## API Surface

The main routes are versioned under `/v1`:

1. `GET /v1/health`
2. `GET /v1/health/db`
3. `POST /v1/auth/session`
4. `POST /v1/embeddings`
5. `POST /v1/search/bm25`
6. `POST /v1/search/vector`
7. `POST /v1/search/hybrid`
8. `POST /v1/search/rerank`
9. `POST /v1/search/summarize`
10. `POST /v1/search`

## Search Pipeline

The end-to-end search flow is:

1. Generate a query embedding.
2. Run BM25 search.
3. Run vector search.
4. Merge and deduplicate candidates.
5. Re-rank the top candidates with the LLM.
6. Optionally summarize the best matches.

Resume ingestion stores normalized searchable text and only provider-generated
vectors. When Mistral is unavailable, ingestion remains usable for BM25 and
reports that semantic retrieval is unavailable for that resume. Embeddings are
versioned; `npm run reindex:embeddings` regenerates vectors created by earlier
versions. `npm run dedupe:resumes` backfills normalized content and profile
identity hashes without regenerating embeddings. Ingestion reuses matching
records, and retrieval collapses existing documents with the same identity
without deleting them.

## Authentication, Resilience, and Logging

Protected search, candidate-profile, resume-ingestion, and embedding APIs use a
server-issued session cookie. The browser exchanges API_ACCESS_TOKEN once
through POST /v1/auth/session; the backend stores hashes of the consumed token
and session identifier in MongoDB. This prevents replay after a backend restart.
The HttpOnly session cookie lasts 12 hours and is scoped to /v1. Health checks
remain available without a session. Configure a unique random token of at least
32 characters on the server, never in frontend build variables. Rotate any
value that was committed or otherwise exposed.

The system should degrade gracefully:

- If reranking fails, fall back to BM25 and vector ordering.
- If vector search fails, use BM25 only.
- If BM25 fails, use vector only.
- If summarization fails, return search results without summaries.

Each request should produce structured JSON logs with a request ID,
duration, status, and component timing.

## Implementation Order

The recommended order is:

1. Scaffold the app and health endpoints.
2. Add embedding support.
3. Add BM25 search.
4. Add vector search.
5. Add hybrid search.
6. Add reranking.
7. Add summarization.
8. Connect the full `/v1/search` pipeline.
9. Add tests for services and endpoints.
