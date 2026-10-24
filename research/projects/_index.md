# Project case studies: index and ranking

Dossiers in this folder (one per project). Each has a hook, architecture (Mermaid plus node and edge tables), decisions with evidence paths, engineering details, *draft* lessons, status, a visual idea and open questions.

| Rank | Project | File | Why (one line) |
|---|---|---|---|
| 1 | **bloomScroll** | `bloomscroll.md` | Shipped, end-to-end and measured: an on-device cascade with a documented speed audit (about 39 s → 2.7 s), a privacy-first design, CI with Playwright e2e, and a signature visual already built in. |
| 2 | **Conductor** (`strata_dev`) | `conductor.md` | The richest design rationale of any repo: every commit explains a trade-off (isolation by type shape, refusal ≠ outage, write-ahead audit). Strong senior signal, but a Phase 0 spike with no live run. |
| 3 | **DecentralMem.AI / MAML** | `decentralmem.md` | Real multi-store architecture (Postgres truth / Qdrant derived / Redis / self-hosted embeddings, MCP) that matches the landing-page thesis. Held back by résumé-vs-code gaps (only the Claude adapter exists) and `PRIVATE-SOURCE` items. |
| 4 | **Value Imprint** | `value-imprint.md` | The only *published* work (NeurIPS 2024, D&B track, Spotlight). High credibility, but there's no code, Rohan is second of five authors, and the page is limited to abstract-level content. |
| 5 | **BharatEdge-Eval** | `bharat-edge.md` | Rigorous protocol (pre-registered gates, content-addressed provenance, script-aware data checks). Unpublished, with no results and most of the harness stubbed, so it works as "research in progress", not a results story. |
| 7 | **NoteNinja** | `noteninja.md` | 2023 team notebook adapted from `teticio/audio-diffusion`. Rohan made only the init commit, and the headline feature (genre interpolation) isn't in the code. |

## Recommendation: 5 full pages

1. **bloomScroll**: the flagship. Lead with the cascade-funnel visual.
2. **Conductor**: the "how I think about agent safety and boundaries" page. Keep the Phase 0 honesty up front.
3. **DecentralMem.AI / MAML**: the hero's "memory stays, model swaps" made real. Publish only after Rohan clears `PRIVATE-SOURCE` items and the adapter wording.
4. **Value Imprint**: a short research page: venue, his contribution, the abstract finding, links. Confirm the track wording first.
5. **BharatEdge-Eval**: a "research in progress" page showing method and grid, **no results**, with wording approved by Rohan.

**Not full pages:** If only 4 pages: drop BharatEdge-Eval to a card that links to the repo, and promote it once the paper is out.

## Cross-cutting needs before publishing

- **`PRIVATE-SOURCE` (needs Rohan's approval):** everything tagged in `decentralmem.md` (the concept-readme framing and quote, TOON / knowledge-graph / AWS ideas, the research-reading phase, Feb 2026 dates, collaborator handles).
- **Drafts:** every "What I learned" bullet in every file is marked `DRAFT – confirm with Rohan`.
- **Accuracy flags:** MAML adapters (résumé says four models; code has one); bharat-edge README status table is stale; Value Imprint track and Spotlight; NoteNinja authorship.
- **Credits:** Value Imprint co-authors; possible MAML collaborators; NoteNinja team; Laya/Jev credits for bloomScroll.
- **Through-line worth using:** Value Imprint (what values are in alignment data) → BharatEdge H3 (does compression shift expressed values) → day-job guardrails and evals → Conductor's code-enforced boundaries. Measuring and constraining models, not just calling them.
