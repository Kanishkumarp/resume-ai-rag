---
name: add-tests-and-hardening
description: Add tests and hardening for the resume search API.
disable-model-invocation: true
---
Improve the reliability of the resume search backend by adding tests and production hardening.

Requirements:
- Add or update unit tests for services and route handlers.
- Add integration tests where practical for important endpoints.
- Use real behavior-focused tests rather than brittle mock-only assertions.
- Strengthen error handling, validation, and fallback behavior.
- Improve observability with meaningful logs and structured response details.
- Keep changes small, targeted, and aligned with the existing architecture.
- Verify the relevant tests or build checks before finishing.
