# Seller onboarding agent

New sellers waited days to go live. I built a LangGraph agent that checks their KYC, tax and legal documents, and activation now takes minutes.

## How it works

- It's a stateful graph. Each step is a node that calls a tool: read the document, validate a field.
- The graph routes on what each node finds. A document that passes moves on.
- A failed check gets retried, not guessed at.

## Keeping the model honest

- Model output is checked against a schema before anything uses it.
- Malformed output gets a retry, then a fallback path.
- Prompt changes are regression-tested against a curated eval set.

This is work for my day job, so the code stays private. The Review Simulator runs on made-up documents.
