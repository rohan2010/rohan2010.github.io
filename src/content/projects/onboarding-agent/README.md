# Seller onboarding agent

New sellers used to wait days to go live while their KYC, tax and legal documents got checked. I built a stateful agent workflow in LangGraph that checks them instead, and seller activation went from days to minutes.

## How it works

- Each step is a node that calls a tool: read the document, validate a field, look something up.
- Conditional routing decides where each document goes next, so a clean one goes straight through and a messy one takes a detour.
- When a check fails, it retries rather than guessing.

## Keeping it honest

- Model output is checked against a schema before anything uses it.
- Malformed output gets a retry, then a fallback path.
- Prompt changes are regression-tested against a curated eval set.

This is work for an employer, so the code stays private. The demo is a toy version you can play with.
