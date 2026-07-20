# Copilot Instructions for Resume AI RAG Project

## Project Purpose
This repository is an enterprise-grade Node.js + Express + TypeScript backend for a resume search system using a RAG-style pipeline. The implementation should support:
- health endpoints
- MongoDB connectivity checks
- Mistral-based embedding generation
- BM25 search
- vector search
- hybrid search
- LLM-based re-ranking and summarization
- full end-to-end orchestration

## Architecture Expectations
Follow the layered monolith structure described in the architecture document:
- src/app.ts and src/server.ts
- src/routes/ for Express endpoints
- src/services/ for business logic
- src/repositories/ for MongoDB access
- src/config/ for configuration and environment handling
- src/middleware/ for logging, request IDs, size limits, and errors
- src/types/ for shared TypeScript interfaces

## Engineering Standards
- Prefer strict TypeScript with explicit interfaces and small, focused modules.
- Keep route handlers thin; delegate business logic to services.
- Use async/await and robust error handling throughout.
- Wrap external API calls in service classes so they are easy to replace or mock.
- Use environment variables for secrets, model names, and feature flags.
- Avoid hardcoding API keys, model names, or sensitive values in source files.
- Return consistent JSON responses with useful error messages and status codes.
- Use request IDs and structured JSON logging for observability.
- Respect versioned API paths under /v1/.

## Search and RAG Behavior
- Implement the endpoints in the documented order: health, embeddings, BM25, vector, hybrid, rerank, summarize, and end-to-end search.
- Prefer pragmatic fallbacks:
  - if reranking fails, fall back to BM25/vector ordering
  - if vector search fails, use BM25 only
  - if BM25 fails, use vector only
- Keep the first implementation reliable and straightforward before optimizing for performance.

## Security and Reliability
- Validate all request bodies and query parameters.
- Enforce request size limits and return 413 for oversized payloads.
- Sanitize user input and avoid unsafe string interpolation.
- Do not log secrets or sensitive tokens.
- Handle external service failures gracefully and provide clear warnings in responses.

## Testing and Quality
- Add unit and integration tests for new services and endpoints.
- Prefer testing real behavior over mock-heavy tests.
- Keep code easy to reason about and debug.
- Before finishing a change, verify build, lint, and tests where available.

## Debugging Guidance
When asked to debug or fix code:
1. Reproduce the issue clearly.
2. Inspect the relevant route, service, repository, and middleware layer.
3. Check environment variables and external service connectivity.
4. Apply the smallest root-cause fix.
5. Preserve existing behavior unless the issue requires a change.

## Output Style
When generating or editing code:
- write concise, production-ready TypeScript
- include comments only where they add clarity
- keep the project structure consistent with the architecture document
- favor readability and maintainability over clever abstractions
