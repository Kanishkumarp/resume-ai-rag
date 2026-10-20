---
name: debug-resume-search-api
description: Diagnose and fix issues in the resume search API.
disable-model-invocation: true
---
Investigate and fix the reported issue in this resume search project.

Approach:
1. Reproduce the problem first and identify the failing layer.
2. Inspect the relevant route, service, repository, and middleware code.
3. Check environment variables, MongoDB connectivity, and external API configuration.
4. Apply the smallest root-cause fix rather than a broad rewrite.
5. Preserve existing behavior unless the issue requires a change.
6. If the bug is caused by an external service, add defensive fallback behavior and clear error reporting.

When editing code:
- keep the fix minimal and focused
- maintain the existing architecture and naming conventions
- add or update logging if it helps diagnose the issue
- explain the root cause and the change made in a short summary
