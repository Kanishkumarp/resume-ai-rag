# Active frontend

This is the Vite + React application built by the root `npm run frontend:build`
and `npm run dev:frontend` scripts. UI components are grouped by feature under
`src/features/`, with shared components, hooks, API clients, and pages in their
own folders.

The older frontend has been retained under `legacy/frontend/` for reference
and is not part of the active build.

The active search workspace keeps its settings sidebar visible on wide screens
and opens those controls in an accessible, scrollable drawer on smaller screens.
The resume ingestion screen is available at `/ingestion` and supports the same
mobile-first layout.
