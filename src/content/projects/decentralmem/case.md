## problem

AI assistants forget a project between chats. Start a new session, or move to a different model, and the decisions you made last week are gone: you paste them in again or the assistant guesses.

DecentralMem keeps that context outside the chat. Decisions, constraints and architecture notes go into a store that belongs to the project, and any session can ask for them back.

## arrangement

The assistant sees two MCP tools: one writes to the project's memory, one searches it. Both check an API key before touching storage. (In the code the system is called MAML, and the tools are `maml_write_context` and `maml_search_context`.)

A write is stored in PostgreSQL, then embedded by a small self-hosted FastAPI service (sentence-transformers, all-mpnet-base-v2) and indexed in Qdrant. No text is sent to an outside embedding API. A search embeds the question, finds the nearest items in Qdrant, loads the full records from PostgreSQL and trims the list to fit the model's context budget. That return trip to the assistant is the loop in the diagram.

Every vector search is filtered by project, so one project's memory can't show up in another's. Memory is typed, nine kinds from "constraint" to "conversation". Short types such as decisions are stored whole; long chat logs and documents are split into chunks, and code is split at function and class boundaries with tree-sitter.

## detail-a

PostgreSQL is the record; Qdrant is an index built from it. A write has to land in PostgreSQL or it fails. Embedding and indexing come after, and if either step fails the write still succeeds: the row is flagged as pending instead of being lost.

A function that re-embeds pending rows is written. The scheduled job that would call it is still a stub, so for now flagged rows wait until it's built.

## detail-b

Memory shares the context window with the conversation, so each model gets a budget: 40% of Claude's 200K tokens, smaller shares for GPT-4o and local models. When results don't fit, the manager tries three passes in order. It swaps long chat logs and documents for their summaries, then drops the lowest-priority type, then keeps only the newer half of what's left.

Constraints, architecture notes and decisions survive every pass. The search result says which pass was needed, from "full" to "recency_filtered", so the caller knows when memory was cut.

There is also a weighted score: half similarity, plus recency, memory type and how often an item is used. Today it ranks the memory the Claude adapter loads at the start of a session. The search tool itself still ranks by similarity alone.

## test-record

- **The test that proves the promise.** Session A writes a constraint ("Authentication must use JWT tokens") and ends. A fresh session B asks "What authentication approach have we decided on?", and the test checks that the constraint is the top result and came from session A.
- **Projects stay apart.** An item written to project B must not appear when project A is searched.
- **Qdrant down.** With the vector store made to fail, the write still succeeds and the row is flagged as pending.
- **Bad keys bounce.** Writes and searches with an invalid API key are rejected, and so is an unknown memory type.
- The repo has 50 tests across seven files. They run against a Docker test stack: PostgreSQL, Qdrant, Redis and the embedding service.

## try-it

The promise in one replay. On Monday, a chat saves two decisions and ends. On Thursday, a new chat that knows nothing asks a question and gets the constraint back, with every store on the way lighting up as it's used.

## around

API keys are stored only as SHA-256 hashes and shown once. A small dashboard on port 8080 shows what's in PostgreSQL, Qdrant and Redis side by side. There are setup guides for macOS and Windows, and one for connecting Claude Desktop or Claude Code.
