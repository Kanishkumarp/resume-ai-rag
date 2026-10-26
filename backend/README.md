# Backend

This folder contains the server-side application for ingestion and retrieval.

Configure `API_ACCESS_TOKEN` in the backend environment before using search,
candidate profiles, or resume ingestion. These routes require an
`Authorization: Bearer <API_ACCESS_TOKEN>` header. Keep the token on the
server and out of frontend build variables.

## Structure

- ingestion/: resume ingestion pipeline and related services
- retrieval/: search and ranking services

## Search and environment

Copy the root `.env.example` to `.env` and set `MONGODB_URI`,
`MONGODB_DB_NAME`, and a private `API_ACCESS_TOKEN`. Keep all credentials on
the server; do not use `VITE_` variables for secrets.

`MISTRAL_API_KEY` enables Mistral embedding generation. `GROQ_API_KEY` enables
LLM reranking after hybrid retrieval; if it is absent or the request fails,
the API retains the original hybrid ordering and returns a warning. Groq usage
is subject to the configured account's pricing and rate limits. Neither
reranking scores nor retrieval scores are probabilities or candidate suitability
percentages.

The active vector retrieval currently calculates cosine similarity over
retrieved resume documents in the application; it does not issue an Atlas
`$vectorSearch` query. `MONGODB_VECTOR_INDEX` is used for index configuration,
not evidence that Atlas vector retrieval is active.

The hybrid endpoint accepts optional `filters` for `skills` (any match),
`minYearsExperience`, `maxYearsExperience`, `location`, `title`, and
`education`. Filters are validated server-side and only fields present in the
resume data can match.
