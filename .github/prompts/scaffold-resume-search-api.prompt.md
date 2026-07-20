---
mode: agent
description: Scaffold an enterprise-grade TypeScript Express backend for the resume search API.
---

Create the initial project scaffold for this resume search API based on the architecture document.

Requirements:
- Use Node.js, Express, and TypeScript with a modern project structure.
- Add a package.json with scripts for dev, build, start, lint, and test.
- Create a TypeScript configuration file and an environment example file.
- Set up the folder structure for routes, services, repositories, config, middleware, and types.
- Implement Express app wiring in src/app.ts and src/server.ts.
- Add health endpoints:
  - GET /v1/health
  - GET /v1/health/db
- Include basic MongoDB connection handling, request ID middleware, and graceful error responses.
- Add request size limits and a consistent JSON response pattern.
- Keep the implementation ready for later BM25, vector search, embedding, and LLM integration.
- Prefer enterprise-grade, production-friendly code over over-engineering.
