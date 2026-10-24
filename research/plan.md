# Plan: "Hand them the agent"

Decided 2026-10-25: direction **Play with it**; real photo **yes**; the toy is **the onboarding agent**.
Inspiration and reasoning: `inspiration.md`.

## The idea in one line
You build agents, so the site hands the visitor one. They feed it messy documents and watch it work.

## The page (one page, top to bottom)

1. **Opening: the desk.** Rohan's photo and one honest sentence in his own voice. Below it sits the
   toy: a small desk with three or four document cards (KYC, tax form, deed, a blurry photo). Drag
   one onto the agent, or tap it on a phone.
2. **The agent works, out loud.** It reads, finds a missing field, retries, asks a "human" for the
   unsure one, routes it on, and passes it. A clock in the corner shows "days" ticking down to
   "minutes". Every step is a real idea from the BulkMagic work: tool-calling nodes, conditional
   routing, retries, guardrails, an eval set. **Labelled as a toy**; the documents and timings are
   illustrative.
3. **"I built the real one."** Three short lines on what the real system did, with the real numbers
   (days → minutes, −40% listing time, +30% faster storefront launches). No NDA detail.
4. **Other things I've built.** Value Imprint (NeurIPS 2024), DecentralMem, bloomScroll, as small
   cards with a link each. Not playable yet, and that's fine.
5. **How I got here.** A short trail, not a big timeline: Delhi → CONCOR (an offline handwriting
   model; the agent's "human check" step is the same idea) → Let's Dunch → Purdue → BulkMagic → now.
6. **Say hi.** Email, LinkedIn, GitHub, plus a live line like "currently building: …".

## Look and feel
To be set **after** the toy exists, around it, not before. The toy is the visual identity. Start
from one constraint: it should look like a real desk and real paper, not a dashboard.

## How we build it (fast, in this order)
1. Make the toy work on its own page with plain styling. Rohan plays with it and says yes or no.
2. Put Rohan's photo and words around it.
3. Add sections 3–6 (simple).
4. Style everything around the toy. Check desktop, phone and reduced motion in a real browser.

Each step is shown to Rohan before the next. No parallel agents, no spec documents.

## Needs from Rohan
- [ ] A photo (any size; one showing something you're into is best). Put it in `public/me.jpg`.
- [ ] One honest sentence about yourself, ideally with a bit of humour (Maggie's is "designer,
      anthropologist, and mediocre developer").
- [ ] Two or three things you're into outside work.
- [ ] OK to say "BulkMagic" by name next to the toy? (Résumé numbers only, no internals.)
