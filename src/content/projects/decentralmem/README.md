# DecentralMem

Every new chat, and every new model, starts from zero. You re-explain the project again.

DecentralMem is a memory layer for a project: decisions, constraints and architecture notes are written once through an MCP server and come back for whichever model you use next, scoped to that project.

## Under the hood

- **PostgreSQL** is the source of truth.
- **Qdrant** handles vector search; **Redis** caches.
- Embeddings come from a small self-hosted FastAPI service.
- If the vector store fails, the write is kept and marked for retry rather than lost.

**Status:** in progress. The Claude adapter works today; GPT-4o, Gemini and local models are next.
