# AGENTS.md

## Project context

This repository contains an enterprise-grade resume search backend built with Node.js, Express, and TypeScript. The system uses a RAG-style pipeline with health checks, MongoDB connectivity, embeddings, BM25 search, vector search, hybrid search, reranking, summarization, and end-to-end orchestration.

## Working rules

- Follow the architecture described in the project documentation.
- Keep the code organized in layers: routes, services, repositories, config, middleware, and types.
- Prefer strict TypeScript, small modules, and production-ready implementations.
- Use environment variables for configuration and never hardcode secrets.
- Validate input, enforce size limits, and return clear error responses.
- Add tests for new features when practical.
- Verify the result with build or test commands before claiming completion.

## Preferred implementation approach

1. Start with the smallest reliable implementation.
2. Keep route handlers thin and services responsible for logic.
3. Add graceful fallbacks for search pipeline failures.
4. Ensure logs and errors are helpful for production debugging.
5. Improve quality and maintainability without over-engineering.
