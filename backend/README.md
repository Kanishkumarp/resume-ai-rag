# Backend

This folder contains the server-side application for ingestion and retrieval.

Configure `API_ACCESS_TOKEN` in the backend environment before using search,
candidate profiles, or resume ingestion. These routes require an
`Authorization: Bearer <API_ACCESS_TOKEN>` header. Keep the token on the
server and out of frontend build variables.

## Structure
- ingestion/: resume ingestion pipeline and related services
- retrieval/: search and ranking services
