# Plan: "Hand them the agent"

Decided 2026-10-25: direction **Play with it**; real photo **yes**; the toy is **a document-checking
agent** with a light **roguelike (Hades) flavour**. Inspiration and reasoning: `inspiration.md`.

## The idea in one line
You build agents, so the site hands the visitor one. They feed it messy documents and watch it die,
retry and escape, the way a roguelike run does.

## Voice
- **One-liner (draft, tweak wording later):** "I build AI that does paperwork so humans don't have
  to. I've mostly spent the free time on Steam."
- Dry and a little sarcastic throughout. Short sentences. No "passionate about".
- **Never name the employer.** Say "my day job". Résumé numbers are fine without the name.

## The page (one page, top to bottom)

1. **Opening.** Rohan's photo and the one-liner. Below it sits the toy: a desk with three or four
   document cards (ID proof, tax form, a deed, a blurry phone photo). Drag one onto the agent, or tap
   it on a phone.
2. **The toy: each document is a run.** The agent reads it, checks fields, and when a check fails it
   "dies" and starts attempt 2 (fix the field, retry, or hand the unsure one to a human). When it
   passes, it routes the document on and the run ends with "Escaped". A small counter tracks runs
   and escapes. Light touch: the wording and a run counter only, no Hades art or names. The real
   ideas underneath are tool-calling steps, conditional routing, retries, guardrails and a human in
   the loop. **Labelled as a toy**; the documents and timings are made up.
3. **"I built the real one."** Two or three lines: at my day job, the real version took seller
   activation from days to minutes; listing time −40%; storefronts launched 30% faster. No company
   name, no internals.
4. **Other things I've built.** Value Imprint (NeurIPS 2024), DecentralMem, bloomScroll, as small
   cards with a link each. Not playable yet, and that's fine.
5. **How I got here.** A short trail, not a big timeline: Delhi → CONCOR (an offline handwriting
   model; the toy's "hand it to a human" step is the same idea) → Let's Dunch → Purdue → day job → now.
6. **Say hi.** Email, LinkedIn, GitHub. Footer line in the same voice, e.g. "Currently: losing to
   Hades." *Optional later:* a real "recently played on Steam" line, refreshed by a scheduled GitHub
   Action at build time (GitHub Pages is static and the Steam API key can't go in the browser).

## Look and feel
Set **after** the toy exists, around it. The toy is the visual identity. Start from one constraint:
it should look like a real desk and real paper, not a dashboard. Avoid the stock "modern portfolio"
look (gradient blobs, stat tiles, skill marquees).

## How we build it (fast, in this order)
1. Make the toy work on its own with plain styling. Rohan plays with it and says yes or no.
2. Put Rohan's photo and words around it.
3. Add sections 3–6 (simple).
4. Style everything around the toy. Check desktop, phone and reduced motion in a real browser.

Each step is shown to Rohan before the next. No parallel agents, no spec documents.

## From Rohan
- [x] Photo: `public/me.jpg` / `me.webp` (1200px, metadata stripped; original in `photo/`, not committed).
- [x] One-liner: the "free time on Steam" line (wording can still change).
- [x] Outside work: games on Steam, e.g. Hades.
- [x] Employer: not named anywhere. Numbers appear as "my day job".
- [ ] Where and when was the photo taken? (A true caption is a nice small detail.)
