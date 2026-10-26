# DecentralMem

Every new chat with an AI assistant starts from zero. You explain the project again.

DecentralMem is memory for a project. Decisions, constraints and architecture notes are written once through an MCP server and come back in the next session, scoped to that project.

## Under the hood

- Two MCP tools: **write** and **search**. Both check an API key first.
- **PostgreSQL** is the record. **Qdrant** is a vector index built from it.
- Embeddings come from a small self-hosted FastAPI service, so no text goes to an outside API.
- If indexing fails, the write still lands, flagged as pending rather than lost.
- Results are trimmed to a token budget. Constraints, decisions and architecture notes are never dropped.

**Status:** in progress. The first version runs locally and is set up for Claude Desktop and Claude Code. Adapters for other models are stubs for now.
