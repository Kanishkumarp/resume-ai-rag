---
name: implement-search-endpoint
description: Implement a production-ready search endpoint for the resume search API.
disable-model-invocation: true
---
Implement the requested endpoint for the resume search backend while following the project architecture.

Requirements:
- Add the route in the appropriate Express router file under src/routes/.
- Keep route handlers thin and delegate logic to services.
- Add or update the necessary service and repository classes.
- Validate request bodies and return clear 400 or 422 responses for invalid input.
- Support versioned API paths under /v1/.
- Keep the implementation consistent with the layered structure and coding standards.
- Wrap external service calls in services and include graceful fallback behavior where appropriate.
- If the feature touches search flow, ensure it can work cleanly with BM25, vector, and LLM steps later.
- Prefer strict TypeScript, maintainable code, and observable behavior.
