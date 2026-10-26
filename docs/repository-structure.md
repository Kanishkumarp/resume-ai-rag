# Repository structure

The repository is a layered monolith. Production entry points and shared
tooling stay at the root where Node.js, TypeScript, and Vite expect them.

| Area | Location | Responsibility |
| --- | --- | --- |
| Active web application | `frontend/app/src/` | React entry points, reusable components, feature modules, hooks, API client, and pages |
| Shared backend layers | `src/config/`, `src/ingestion/`, `src/middleware/`, `src/repositories/`, `src/routes/`, `src/services/`, `src/types/`, `src/utils/` | API configuration, request handling, data access, business logic, and shared contracts |
| Backend application | `backend/src/` | Express server, ingestion workflow, and backend-specific services |
| Backend bootstrap utility | `scripts/backend/` | Explicit operator-run backend tasks |
| Automated tests | Beside the modules they cover as `*.test.ts` or `*.test.tsx` | Unit and integration coverage |
| Developer diagnostics | `tools/debug/` | Manual database, search, DNS, and parser diagnostics; not production entry points |
| Diagnostic output | `tools/diagnostics/` | Previously captured local check output |
| Architecture documentation | `docs/architecture/` | Backend and ingestion architecture |
| Implementation guides | `docs/guides/` | Frontend development guidance |
| Documentation assets | `docs/assets/` | Screenshots and diagrams used by project documentation |
| Legacy frontend | `legacy/frontend/` | Preserved, inactive frontend implementation; excluded from the active build |

Root-level package, Vite, TypeScript, PostCSS, Tailwind, environment-example,
and repository instruction files remain at the root because build tools and
contributors expect those conventional entry points there. The active Vite
root is `frontend/app/`; its generated build output remains in the root
`dist/` directory.
