# v2 master plan: "Rhymes"

This plan pulls together four inputs:
- `concepts.md` (creative direction)
- `craft-bar.md` (benchmark, UX laws, acceptance criteria)
- `tech-motion.md` (motion stack, tested in a spike)
- `projects/*.md` (case-study dossiers)

**This file wins where they disagree.** v1 (`plans/landing-page.md`, `plans/design-pass.md`) is superseded.

## 1. The idea
**Every era of computing made machines help more people. Each step of Rohan's work rhymes with one of those eras.** The home page is a 180-year timeline: a year ruler speeds up as it nears the present, and the accent colour drifts from sepia to teal (teal is the present). Rohan's projects appear at the moment in history they continue. The last year is blank, and that's the visitor's: the contact section.

**Message carried:** AI is progress that people and machines make together. It's only amazing if it's dependable and reaches everyone.

## 2. What the page is (scenes, from `concepts.md` §2 and the storyboard)
| # | Scene | Rhyme | Rohan fact | Beat |
|---|---|---|---|---|
| 0 | 1843, the objection | Lovelace, Note G | name, one line | curiosity |
| 1 | The ruler | the map of the page | — | momentum |
| 2 | Reading handwriting | LeNet ZIP codes, 1989 ↔ CONCOR, 2021 | edge CNN, bottom 15% → human | recognition |
| 3 | "Collaborative" | Tapestry, 1992 ↔ Let's Dunch, 2021 | recommender, +30% | warmth |
| 4 | What are they taught? | Hollerith, 1890 ↔ Value Imprint, 2024 | 6,501 annotations, NeurIPS 2024 D&B | tension |
| 5 | Machines that act | ReAct/Toolformer, 2022–23 ↔ BulkMagic | days → minutes, −40%, −30% | **peak** (55–80% of scroll; largest type; the only full-bleed block) |
| 6 | Memory that travels | MCP, 2024 ↔ DecentralMem, Conductor | the bench (v1 figure, reused; the visitor drives it) | delight |
| 7 | Next, for everyone | small on-device models ↔ BharatEdge-Eval, bloomScroll | paper in preparation; on-device | hope |
| 8 | Your year | blank punch card | email, LinkedIn, GitHub, résumé | invitation; ends on the opening's callback, no résumé fine print |

**Truth rules:**
- Every history claim needs a source in `src/content/sources.ts`.
- Every Rohan claim comes from the résumé or the code, as the dossiers record it.
- Illustrative visuals are labelled as illustrative (scene 4 pocket heights, scene 7 quantization demo).
- No phone number anywhere.

## 3. Project pages, `/work/<slug>/`
- **Full pages:** bloomScroll, Conductor, DecentralMem.AI, Value Imprint, BharatEdge-Eval.
- **The BulkMagic agent** gets a page only if Rohan confirms no NDA problem; otherwise it stays in scene 5 only.
- **Archive list:** NoteNinja (team project, credited as such), CONCOR and Let's Dunch (résumé only).

**Template** ("Field report", `concepts.md` §5, with acceptance from `craft-bar.md`):
1. Header continuous with the home figure (View Transition)
2. The ancestor
3. Exploded architecture: keyboard operable, with a list fallback
4. Forks in the road
5. What broke / what I learned: **Rohan's words only; the placeholder stays until he supplies them**
6. Outcome: only stated numbers
7. Next/previous along a mini ruler

Situation → Tension → Decisions → Outcome → What it unlocks, with at least 400 words each.

**Content corrections from the code review (binding):**
- **DecentralMem:** describe what is built. The Claude adapter works; the others are stubs. The retry worker is a stub. Nothing `PRIVATE-SOURCE` is published without approval.
- **Value Imprint:** team paper (2nd of 5 authors), NeurIPS 2024 Datasets & Benchmarks, Spotlight. Confirm with Rohan.
- **Conductor:** Phase 0 spike, no live run.
- **BharatEdge:** "Independent research · Paper in preparation". No results claimed.

## 4. Visual and motion system
- **Type:** IBM Plex Serif (display) / Plex Sans (body 18/30) / Plex Mono (**only** years and card numerals). Self-host with `next/font/google`.
- **Tokens:** from `concepts.md` §3: `--paper`, `--card-stock`, `--ink`, `--ink-2`, `--sepia`, `--teal`, `--teal-ink`, and `--accent` as a `color-mix` driven by `--era`.
- **Grid:** 12 columns plus a 72 px ruler gutter on desktop. On phone the ruler becomes a sticky odometer year strip. No two adjacent scenes share a layout.
- **Motion stack** (tested, `tech-motion.md`):
  - `gsap@3.15` + ScrollTrigger + SplitText + `@gsap/react`
  - `lenis@1.3` on GSAP's ticker
  - React `<ViewTransition>` with `<Link transitionTypes>`
  - Nothing else (no anime.js, Motion or three.js)
- **Required config:** `trailingSlash: true`, `pinType: "transform"`, and `lenis.scrollTo` (not `window.scrollTo`).
- **Motion principle:** *Time moves down the page; nothing moves unless history or the visitor moves it.* No generic fade-ups.
- **Reduced motion:** no Lenis, no pins, no scrub. Static before/after pairs. Everything readable with JS off.
- **Budgets:** motion JS ≤ 60 KB gzip, home route JS ≤ 260 KB gzip, mobile LCP ≤ 2.0 s, CLS ≤ 0.02, INP ≤ 150 ms. Figures are hydrated lazily near the viewport.

## 5. Acceptance (the build fails unless all pass)
All 34 criteria in `craft-bar.md` §5, and the banned patterns in §4. Headline checks:
- One designed peak (scene 5).
- The ending calls back to the opening.
- At least 3 case studies of ≥ 400 words each.
- axe: 0 serious violations; controls ≥ 44 px; focus visible; works with JS off.
- Core Web Vitals within the budgets on mobile.
- Reduced-motion parity: every beat reachable with the same meaning.
- Every anatomy figure: `line ends: 0` in both themes.

## 6. Build: parallel workstreams
Phase 0 runs alone; phases 1–2 run in parallel in **separate git worktrees** (one branch each, each agent owns disjoint paths), merged by the lead after review.

| WS | Owner paths | Depends on | Content |
|---|---|---|---|
| **0. Foundation** | `src/app/layout.tsx`, `src/styles/`, `src/lib/motion/`, `src/components/ruler/`, `src/content/schema.ts`, `next.config.ts` | — | Tokens and fonts, Lenis/GSAP provider, era drift, ruler and odometer, scene shell API (`<Scene id year layout>`), `/work/[slug]` route and template shell, reduced-motion and no-JS baseline, `trailingSlash`. **Merge before phase 1.** |
| **1A. Scenes 0–3** | `src/scenes/s0-s3/`, `src/figures/envelope-phone/`, `src/figures/memo-grid/` | 0 | Lovelace ink-in, ruler map, rhyme morph 1 (envelope → phone), memo → people grid |
| **1B. Scenes 4–5** | `src/scenes/s4-s5/`, `src/figures/sorter/`, `src/figures/docline/` | 0 | Hollerith sorter → Value Imprint pockets (morph), the BulkMagic document line (the peak) |
| **1C. Scenes 6–8** | `src/scenes/s6-s8/`, `src/figures/phone-quant/` (bench reused from `src/components/figures/bench/`) | 0 | Bench scene, quantization slider (labelled illustrative), punch-card contact |
| **1D. Project pages** | `src/app/work/`, `src/content/work/*.ts`, `src/figures/explode/` | 0 | Template, exploded architecture component, 5 pages from the dossiers, archive list |
| **2. QA critic** | read-only, then fix PRs | 1A–1D merged | Runs every `craft-bar.md` criterion in a browser and reports failures; the owning workstream fixes them |

Each phase-1 agent: lint, build, real-browser checks at 1440 and 390, light and dark, reduced motion and JS off, and `lines.mjs` on its figures before handing back. No pushes.

## 7a. Decisions (Rohan, 2026-10-22)
- **Concept:** Rhymes. **Local commits:** OK, on branch `v2-rhymes`; never push.
- **DecentralMem:** describe what's actually built. The Claude adapter works; the multi-model design is in place, with GPT-4o, Gemini and local adapters as stubs; the retry worker is a stub. No `PRIVATE-SOURCE` content until approved.
- **BulkMagic:** scene 5 only, **no case-study page**.
- Still open: the hero line, "what I learned", the Value Imprint authorship and track, and the Conductor live-run status. Builders use the drafts and hide the placeholders.

## 7. Needs Rohan (blocking marked ★)
1. ★ **Approve the concept** ("Rhymes"), or pick "The trace" (M) or "The workshop" (L+).
2. ★ **Local commits** to create worktrees (nothing is pushed).
3. **Hero line** for scene 0 (draft: "Rohan Pant builds AI that does more than it's told, and the checks that keep it honest.").
4. **DecentralMem:** OK to describe the actual build state? Which `PRIVATE-SOURCE` items may be published?
5. **BulkMagic:** NDA OK for a case-study page?
6. **"What I learned":** 3 points per project. They can come after the build, since placeholders are hidden.
7. Confirm Value Imprint authorship and track; Conductor live-run status; the BharatEdge wording.
