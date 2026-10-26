# Backend

This folder contains the server-side application for ingestion and retrieval.

In development, protected endpoints are available without an access token when
`API_ACCESS_TOKEN` is unset. For production, configure a unique, high-entropy
`API_ACCESS_TOKEN` (at least 32 characters) in the backend environment before
using search, candidate profiles, embeddings, or resume ingestion. The browser
submits this token once to `/v1/auth/session`;
the backend records only its hash in MongoDB and issues an HttpOnly session
cookie. Protected requests use that cookie instead of resending the access
token. The session lasts 12 hours and remains valid across backend restarts.
After a token has been used, it cannot be reused; configure a new token to
establish another session, then restart the backend to load it.

## Structure

- ingestion/: resume ingestion pipeline and related services
- retrieval/: search and ranking services

## Search and environment

Copy the root `.env.example` to `.env` and set `MONGODB_URI`,
`MONGODB_DB_NAME`, and `MONGODB_COLLECTION_NAME`. Set a private
`API_ACCESS_TOKEN` for production deployments.
MongoDB must be available for one-time-token tracking and session validation.
Keep all credentials on the server; do not use `VITE_` variables for secrets.
If an earlier token was committed or otherwise exposed, rotate it; clearing the
example file does not remove credentials from Git history.

`MISTRAL_API_KEY` enables real Mistral embeddings. If embedding generation is
unavailable during ingestion, the resume is stored for keyword search and the
API returns a warning; no synthetic vector is stored. Semantic search requires
compatible, versioned embeddings. After upgrading from an earlier build, run
`npm run reindex:embeddings` once to regenerate existing resume vectors. This
operation makes one Mistral embedding request per non-empty resume and may incur
provider charges.
Run `npm run dedupe:resumes` to backfill normalized content and profile identity
hashes for existing records without regenerating embeddings. New uploads reuse
a matching record instead of embedding or storing the same resume again; BM25
and vector retrieval also collapse matching profiles. Email and phone are used
when available; name, role, and company are the fallback when contact details
are missing. This preserves stored documents and does not delete historical
duplicates.

`GROQ_API_KEY` enables LLM reranking after hybrid retrieval; if it is absent or
the request fails, the API retains the original hybrid ordering and returns a
warning. Groq usage is subject to the configured account's pricing and rate
limits. Reranking uses a bounded candidate excerpt and output budget to reduce
TPM usage. When Groq rate limits a request, the original hybrid ordering is
returned without an automatic retry. Neither reranking scores nor retrieval
scores are probabilities or candidate suitability percentages.

The active vector retrieval currently calculates cosine similarity over
retrieved resume documents in the application; it does not issue an Atlas
`$vectorSearch` query. `MONGODB_VECTOR_INDEX` is used for index configuration,
not evidence that Atlas vector retrieval is active.

The hybrid endpoint accepts optional `filters` for `skills` (any match),
`minYearsExperience`, `maxYearsExperience`, `location`, `title`, and
`education`. Filters are validated server-side and only fields present in the
resume data can match.
