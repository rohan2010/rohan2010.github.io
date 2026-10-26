## problem

A seller can't sell until their KYC, tax and legal documents are checked. Getting a new seller live took days, and the checks were the part worth automating.

## arrangement

It's a stateful agent workflow in LangGraph. Each step is a node that calls a tool, such as reading a document or validating a field. The graph keeps the state of each seller's documents as it goes and routes on what each node finds. A document that passes moves on. One that fails takes the retry path.

## detail-a

A failed check doesn't end the run, and it doesn't get waved through. The workflow retries it, and conditional routing decides where the document goes next.

That's the idea in the title. With identity and tax documents, a confident wrong answer costs more than a slower right one.

## detail-b

Across the platform's AI features, nothing downstream uses a model's answer until it has been checked. The guardrails:

- Schema validation on model responses.
- A retry, then a fallback path, when the output is malformed.
- Prompt changes regression-tested against a curated eval set before they ship.

## try-it

The documents are made up, but the toy checks, fails, retries and routes the way the real one does. The step where it asks you for help isn't from this agent. It comes from an internship at Container Corporation of India, where I built a pipeline that sent the least confident 15% of a model's predictions to a person and retrained on their answers.

## around

The agent is one part of a multi-seller platform I work on. I also built a generation service there (OpenAI for product copy, Stable Diffusion for images, on versioned prompt templates) that cut product listing time by 40%. The storefront itself is Next.js, Tailwind and REST APIs. It got stores to market 30% faster, and CI/CD in GitHub Actions halved deployment cycles with zero downtime.
