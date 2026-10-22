# Design pass plan: rohan2010.github.io

A second pass over the built site. It fixes the six problems from the real-browser review and carries out Rohan's direction: **the bench is the narrator.** Facts still come only from `docs/RP_resume_developer.pdf` and the repo READMEs (`src/content/projects.ts`). No phone number anywhere: not in the copy, the metadata, the JSON-LD or the OG image.

## Decisions (Rohan, 2026-10-22)
- **Bench as the narrator.** The hero gets a bigger bench and a shorter headline. Each chapter opens with a zoomed detail of the bench part it is about (Fig 1.1 to 1.4), and a chapter rail shows where the reader is.
- **Mood:** the same warm paper and teal, with more contrast and a more confident accent. No new palette.

## What this plan decides (summary)
| Problem | Fix |
|---|---|
| 1. Every chapter has the same layout, so nothing shows time passing | A shared **chapter opener** (big numeral, years, title, detail figure) whose side alternates. Each chapter body gets its own layout. The rail carries the years: 2021, 2022–24, 2024–now, now. |
| 2. The bench is undersold | The hero splits 4/8 on desktop, the projection is fitted to the drawing's real bounds, and the bench sits right under the H1 at 390. |
| 3. The H1 runs to 5 lines and the lead repeats the résumé summary | A 5-word H1 and a 2-sentence lead (section 2). |
| 4. Too much tiny grey text | A new type scale with a 13 px floor for page text (12 px for the figure frame), contrast-checked tokens, and the accent given defined jobs. |
| 5. The toolbox is a wall of chips, the cards are uneven and the Work rows are dense | The toolbox becomes 4 plain lists. The shelf becomes rows. Work becomes 2×2 metric tiles. |
| 6. No OG image and no JSON-LD | A build-time `opengraph-image.tsx` (it is supported in a static export; see section 9) and a `ProfilePage`/`Person` JSON-LD with no telephone. |

---

## 1. Story spine (unchanged beats, now shown by layout)

| # | Chapter | Years on the rail | Bench part (detail) | The turn |
|---|---|---|---|---|
| 0 | Hero | | the whole bench, Fig 1 | Models are swappable; the engineering around them is not. |
| 1 | 01 Field | 2021 | cartridge rack, Fig 1.1 | First models, out where people use them. |
| 2 | 02 Research | 2022–24 | go/no-go gauge and eval-set card file, Fig 1.2 | Then: what are the models being taught? |
| 3 | 03 Work | 2024–now | eval line, shipped tray and retry chute, Fig 1.3 | Now: dependable in production. |
| 4 | 04 For fun | now | memory cabinet and socket mid-swap, Fig 1.4 | Off the clock he swaps the models himself. |
| 5 | Contact | | | Let's talk. |

The reader sees time passing three ways: the rail's years, each opener's large numeral and year, and the detail figures, which walk across the bench from left (rack) to right (tray) and then back to its heart (memory).

---

## 2. Hero redesign

### Copy: three options, one recommended
All three are true to the résumé: "Kept generation reliable in production…", BulkMagic, agent workflows, guardrails and evals.

**A (recommended)**
- Eyebrow: `Rohan Pant · Full-stack + AI engineer`
- H1: **I make AI models dependable.**
- Lead: `Full-stack engineer at BulkMagic, building agent workflows and the guardrails, evals and platform that let them ship. The bench is that loop: swap the model, check the output, ship.`

**B**
- H1: **Models change. The engineering around them holds.**
- Lead: `I build the memory, guardrails, evals and product around AI models: agent workflows at BulkMagic, NLP research at Purdue (NeurIPS 2024).`

**C**
- H1: **Software where AI models do real work.**
- Lead: `Agent workflows, guardrails and evals at BulkMagic, on a Next.js platform I built. M.S. HCI, Purdue; NeurIPS 2024.`

**Why A:** it is 5 words, so it sets on 2 lines at desktop and 3 at 390. It states the outcome rather than the stack, and its lead hands the reader straight to the bench, which makes the bench the narrator. B is the page thesis, but it takes 3–4 lines. C is a description, not a claim. The résumé-summary paragraph is removed; its facts move to the facts row.

- Facts row (13 px mono, ink-3, small accent dot separators): `BulkMagic · 2024–now` · `Purdue M.S. HCI` · `NeurIPS 2024`
- CTAs: `See the work` (primary, goes to `#field`; the label stays) and the email as a text link. The résumé button still depends on `RESUME_READY`.

### Desktop (≥1024)
- `.wrap` stays at 1168 px, but the hero grid becomes **4 / 8**: text in columns 1–4, the bench in columns 5–12. The figure gets about 770 px, up from about 660 px.
- Text column: eyebrow, H1 (`--text-display`), lead (`--text-lead`, ink-2, max 34ch), CTAs, facts row. It is vertically centred against the figure.
- Bench fill: the art currently fills about half its card. The anatomy rule is that the object fills about 55–65% of the card. Read that as **area**: today it is about 35%; the target is about 62%. To get there:
  1. Measure the drawn bounds in the browser, using `svg.getBBox()` on the root group at rest and at the picker's highest pose in the tour. Take their union as the motion envelope.
  2. Change `WIDTH`/`HEIGHT` in `view.ts` to that envelope's aspect (expect about 640×300 instead of 640×360), and set `PAD` to 8. Then the envelope fills about 92% of the SVG's width and 90% of its height.
  3. On desktop, set `.iso-plate` padding to `44px 28px 48px`. The corners sit at `inset: 16px 18px`.
  Result: the bench spans about 86% of the card's width and about 72% of its height. That is dense but still has air, and the corner labels stay clear (anatomy wins on this).
- `min-height: calc(100svh - 56px)` stays. The figure's top edge lines up with the eyebrow.

### Phone (390 × 844, and still at 375 × 667)
The order is: eyebrow, H1, **bench**, lead, CTAs, facts. Use `order` utilities so the DOM stays text-first for screen readers. The DOM order can be eyebrow/H1, then the figure, then the rest, because the H1 still comes first.
- H1 is 40/44 px, 3 lines at most.
- Bench budget: topbar 56, padding 16, eyebrow 16 + 12 gap, H1 132, gap 20, plate about 290 (art at 116% width, cropped as now, with plate padding `40px 12px 56px`). The plate's bottom lands at about **542 px**, so the whole bench sits in the first viewport at 390×844. At 375×667 at least the base and the socket show above the fold.
- Hint: `Tap a cartridge`. The readout wraps to 2 lines on the right, as now. The legend and caption follow the lead, below the fold.

---

## 3. Chapter rail

**Placement: inside the sticky top bar, which replaces today's nav.** One sticky surface, no new chrome, no hover-only labels.

Desktop (≥768), centred in the 56 px bar:
```
Rohan Pant    01 Field 2021 · 02 Research 2022–24 · 03 Work 2024–now · 04 For fun now    Contact  Résumé ↓
```
- Each item is an `<a>`: the numeral in mono 13 px, the label in sans 14 px, the years in mono 12 px, ink-3. The items keep chronological order (today's nav is out of order).
- **Active chapter:** the label turns to `--ink`, the numeral to `--accent-ink`, and a 2 px bar along the bar's bottom edge, under that item, fills left to right with progress through the chapter. Chapters already read sit at full width in `--accent` at 40%. Chapters not reached yet show nothing.
- In the hero no chapter is active: the rail sits at ink-3 and has no bars.
- Progress uses CSS scroll-driven animation, `animation-timeline: view()` on a named timeline per chapter (`view-timeline-name: --ch1` on each `<section>`, with `timeline-scope` on `body`), animating `transform: scaleX()` on the bar. Where that isn't supported, the bar shows only the active and read states.
- The active state comes from one IntersectionObserver in `ChapterRail.tsx`, a small client component (about 1.5 KB), with `rootMargin: "-45% 0px -50% 0px"`. The link gets `aria-current="true"`. There are no scroll listeners.

Phone (<768):
- The bar shows `Rohan Pant` on the left and, once past the hero, the current chapter on the right as `02 Research · 2022–24` in 13 px, with the `Menu` button.
- A thin rail of 4 equal segments runs along the bar's bottom edge, with the same active, read and progress states. It is not interactive, so it does not need 44 px targets.
- The `Menu` summary grows to 44×44 hit area and lists the four chapters plus Contact, with years. Escape closes it and returns focus to the summary.

---

## 4. Chapter system: one opener, four distinct bodies

### 4.1 Shared opener (`Chapter.tsx`)
A 12-column row with two parts:
- **Marker:** the numeral `01` at 72 px in mono, `--accent-ink`, tracking -0.04em, then the years `2021` (13 px mono, ink-3), the eyebrow word `Field` (13 px mono uppercase, accent-ink), the H2 and a one-line lead where the chapter has one.
- **Detail figure:** the plate for Fig 1.x.

Sides alternate: 01 and 03 put the marker in columns 1–6 and the figure in 7–12; 02 and 04 swap them. At 390 the marker comes first and the figure follows at full width.

Rhythm: the opener has 128 px above it and 72 px below before the body (72 and 48 px on phone). The chapter rule (`border-top`) is kept.

### 4.2 01 Field (2021): two field reports side by side
- Both entries are from 2021, so they sit side by side, not on a vertical timeline. A 1 px rule runs across the top with a dot per entry, labelled `Sep–Nov 2021` and `Aug 2021–Feb 2022`: a horizontal timeline that reads as "the same year".
- Each entry is a borderless column: org (h3, 22 px), role · place (15 px ink-2), body (17 px, max 58ch). Its one key fact is set larger above the body in accent-ink mono 20 px: `bottom 15% → human review` and `+30% registrations`. The second chip, `offline inference`, stays as a normal chip under the body.
- At 390 the entries stack, and the dots move to a left-edge rule.

### 4.3 02 Research (2022–24): one paper spread on a tinted band
- The section's background is `--paper-2`, the only tinted chapter, which breaks the rhythm.
- Layout: on the left (4 columns), the stat **6,501** at 96 px mono with tabular numbers in `--ink` and the label `RLHF annotations audited` (15 px ink-2), then the `NeurIPS 2024` badge (accent chip). On the right (8 columns), the Value Imprint name (h3), its kind, and the body split into two short paragraphs, then the three audited datasets as a small `<ul>` in mono 14 px: `Anthropic/hh-rlhf`, `OpenAI WebGPT`, `Alpaca GPT-4`. Tech chips go last.
- The lead `M.S. in Human-Computer Interaction, Purdue University, Aug 2022–May 2024.` moves into the opener.
- There is still no paper link until Rohan sends one.

### 4.4 03 Work (2024–now): a spec sheet with metric tiles
- Role line under the opener: `BulkMagic, Inc` (semibold) · `Software Engineer · New York (remote) · Aug 2024–present`.
- **2×2 tiles** (1 column at 390), each a `.card` with 28 px padding:
  | Label (13 px mono, ink-3) | Metric (40 px, accent-ink, tabular numbers) | Body (15/24, ink-2) |
  |---|---|---|
  | Seller activation | days → minutes | existing row 1 text |
  | Product listing time | −40% | existing row 2 text |
  | Output guardrails | retry · fallback · evals (set at 24 px) | existing row 3 text |
  | Storefront time-to-market | −30% | existing row 4 text |
  Adding the labels gives each row a "what" before the "how", which lightens the density. The body text is unchanged.
- The callback `The bench at the top runs this loop…` becomes a link-styled line: `↑ The bench runs this loop: seat a model, check the output, retry, ship.`, linking to `#top`.
- **Toolbox:** see section 6.

### 4.5 04 For fun (now): workbench layout
- Under the opener, DecentralMem.AI spans the full width as a card split 7/5: name, kind and body on the left; on the right a "stack" list in place of chips, one row each: `PostgreSQL — source of truth`, `Qdrant — vector search`, `Redis — cache`, `FastAPI — self-hosted embeddings`, `MCP — serves Claude, GPT-4o, Gemini, local LLMs`. These roles are taken word for word from the résumé, and the list mirrors the cabinet's three drawers.
- Lab notebook: as now, full width, lined paper.
- Shelf: rows, as in section 7.

### 4.6 Contact: the one inverted band
- A full-bleed `--band` background (ink-dark in both themes) with `--band-ink` text. The email is set at 32 px in `--band-accent`, the rows stay as they are, and the location line is 13 px mono.
- The footer sits inside the band. The page ends on a confident accent instead of more grey.

---

## 5. Detail figures (Fig 1.1–1.4)

### 5.1 How they are made: a server-rendered, cropped subset of the same art
Reading the bench code settles the approach:
- Every static path is computed **once, at module load, with a single projection `P`** (`view.ts`), and is imported by `geometry.ts`, `shapes.ts` and `frame.ts`. A second `fitProjection` per detail would mean threading `P` through every builder and computing the geometry five times. That is a refactor with no visual gain.
- `.iso-svg path, .iso-svg circle { vector-effect: non-scaling-stroke }` is already in `iso.css`. **A tighter viewBox therefore magnifies the geometry while every stroke stays at its true hairline weight.** The crop stays crisp, and the line weights are exactly those of the hero.
- `frame.ts` is pure (no `"use client"`). Its pose functions (`poseOf`, `cardPathsOf`, `latchOf`, `coilOf`, `flapOf`, `drawerBodyOf`, `needleOf`) can run on the server to freeze a chosen pose.

So: **each detail is a static `<svg>` rendered on the server, with a cropped `viewBox`, that contains only the parts that fall inside the crop.** Parts in the subject group draw normally. Neighbours inside the crop draw as **context**: they stay solid and opaque, so they still occlude, but take the faint tones. Nothing outside the crop is emitted. This is not a second machine. It is the same constants, in the same painter's order.

Steps for the builder:
1. **Refactor `art.tsx` into an ordered layer list.** Split the coarse constants where a detail needs a finer boundary. `TRACK_BACK` becomes `EVAL_SET`, `TRACK_BED`, `CHUTE_BACK`, `TRAY_BACK` and `GAUGE_BACK`. `TRACK_FRONT` becomes `RAILS_FRONT`, `GAUGE_FRONT`, `CHUTE_FRONT` and `TRAY_FRONT`. Export
   `LAYERS: { id: PartId; group: "base"|"rack"|"socket"|"cabinet"|"gantry"|"picker"|"line"|"gauge"|"evalset"|"chute"|"tray"|"dial"; node: ReactNode | ((pose) => ReactNode) }[]`
   in today's exact painter's order. `BenchLive` takes its element props from this list, so the hero's order is unchanged; the done-check is a pixel diff. Moving parts are entries whose node is a function of a `Pose`. On the server they render once with `shift()` transforms and frame paths for the frozen pose.
2. **`details.ts`**: four specs, each `{ fig, title, readout, caption, label, focus: Group[], context: Group[], pose: BenchState, centre: Point3, motion?: "retry-flow" | "pins" }`.
3. **The crop**, computed at build time: project the focus groups' world bounds with `at()`, then take a box of a **common width of 240 viewBox units** (2.67× zoom) in a **4:3** aspect, centred on `at(centre)`. One zoom for all four keeps the set at a consistent scale, which is an anatomy rule. If the Fig 1.3 eval line does not fit in 240, widen all four together to the smallest width that fits, never just one. Emit only layers whose screen bounds intersect the crop; precompute their bounds from their path points in the same pass.
4. **Faint context, without see-through.** Wrap context layers in `<g data-ctx>`. In `bench.css`, re-point the tone tokens inside it: `--anatomy-hi`, `--anatomy-mid` and `--anatomy-lo` all map to `--anatomy-faint`, `--anatomy-lit` maps to `--anatomy-lo`, and shade and top fills map to `--anatomy-card`. Context stays opaque and painted in order, so it still hides what is behind it. This uses tone, not opacity, the way anatomy keeps solids solid.
5. **Line ends at the crop edge.** The crop cuts the base slab, rails and ruler strips in the middle of a surface. Under anatomy's rule, "a texture ends on a real edge or fades". Apply one static `<mask>` to the whole art group: a rectangle that fades from full to zero over the outer 7% on all four sides, as linear gradients multiplied together. Every cut line then fades into the card instead of stopping, and `scripts/lines.mjs` must read `line ends: 0` on the built page.
6. **Dots under zoom.** `Dots` are circle radii in user units, so they scale by 2.67×: a 0.45 screw becomes about 1.2 px. That reads as a real screw at the detail scale, which is what the anatomy 4× look asks for. Leave them as they are.
7. **Frame:** the same `Plate`. Corners: `Fig 1.x` (top left), the title (top right), a static readout (bottom right, true to the frozen pose), and no hint, because the details are not interactive. The caption under the card says what the part is and why this chapter opens on it.
8. **Size tier:** each detail is a **Figure**, a crop of the existing Hero. Expected parts in view are given below; all are at least 40 including context. No new geometry is drawn, except the split constants in step 1.

### 5.2 The four details

| Fig | Chapter | Focus (drawn normally) | Context (faint) | Frozen pose | Readout | Motion |
|---|---|---|---|---|---|---|
| **1.1** The cartridge rack | 01 Field | rack plate, back and front cheeks, all 4 cartridge slots and shells with their key-notch tops, contact strips, rack screws | base slab, groove, label plate, left gantry post and foot, ruler strip | 3 cartridges in the rack and slot 0 empty: its model is out on the bench (`REST` with `seated: 0`) | `4 slots · 1 out in the field` | **Static** |
| **1.2** Go/no-go gauge + eval-set card file | 02 Research | gauge feet, back, blade, bar and front; the no-go flap; the eval-set file with its index cards, divider, label slip and pull; the bent card held at the blade (lit) | track rails and rollers, chute walls, return bin | `check` phase with `u ≈ 0.85` and `failing > 0`: the dog-eared card stopped against the blade | `no-go · card held at the blade` | **Static** |
| **1.3** Eval line → shipped tray + retry chute | 03 Work | rails, rollers, axles, flap, chute, return bin, the dotted retry path painted on the base, the shipped tray with a stack of 3 plates, the counter dial and needle | gauge (already shown in 1.2), socket front blocks, ruler strip | `idle` after 3 shipped cards, with the needle at 3/20 | `3 shipped · 1 retried` (this is the figure's own count, not a benchmark) | **One CSS motion:** the dotted retry path drifts slowly from bin to line start (`stroke-dashoffset`, 2.4 s per 3.5-unit period, linear) |
| **1.4** Memory cabinet, socket mid-swap | 04 For fun | cabinet case, top, plinth, three drawers (the vector drawer pulled out to `RECALL_OUT`), connector and pins, ribbon to the socket, socket blocks, seat plate, coil, latch; one cartridge seated and a second held in the jaws above the throat (lit) | gantry beam and carriage, housing, rack's right cheek | a constructed pose: `seated: 1`, picker at the socket holding cartridge 3 (fetch at `u ≈ 0.9`), drawer out | `memory: namespace “site” · swapping models` | **One CSS motion:** the connector pins pulse in sequence (`Dots pulse`, already in `iso.css`), meaning memory serving the socket |

Expected parts in view: 1.1 about 45, 1.2 about 50, 1.3 about 60, 1.4 about 70.

### 5.3 Motion rules for details
- CSS only, so the details add **no client JS**.
- Paused until visible and when offscreen. `.bench-detail` starts with `animation-play-state: paused` on its animated children. The existing `Reveal` observer gets one more job: toggle `data-inview` on `[data-detail]` (observe and unobserve, no new component). `[data-inview]` sets `running`.
- `prefers-reduced-motion: reduce` sets `animation: none`; the static frame already reads, because the dotted path and the pins are both drawn at rest.
- Both are paint animations on small, isolated elements, which the motion guidance allows.

### 5.4 Page-weight budget
- Today: `out/index.html` is 656 KB raw (97 KB gzip). Client JS is 592 KB raw (184 KB gzip).
- After: client JS **≤ 190 KB gzip**: only the rail (about 1.5 KB) is added; details are server-only. HTML **≤ 210 KB gzip**: four cropped subsets, with path precision kept at 2 decimals. If a detail goes over 30 KB gzip, cut context layers first.

---

## 6. Type scale, colour tokens and contrast

### 6.1 Type scale (`globals.css`, as `@theme` tokens and component classes)
| Token | Desktop | 390 | Use |
|---|---|---|---|
| `--text-display` | `clamp(48px, 5.2vw, 72px)` / 1.0, 600, -0.03em | 40/44 | Hero H1 only |
| `--text-h2` | `clamp(32px, 3.6vw, 48px)` / 1.08, 600, -0.02em | 30/34 | Chapter titles |
| `--text-numeral` | 72 px mono / 1, 500, -0.04em | 56 px | Chapter numerals |
| `--text-stat` | 96 px mono, tabular | 64 px | 6,501 |
| `--text-metric` | 40/44 mono, tabular | 32/36 | Work tiles |
| `--text-h3` | 22/28, 600, -0.01em | 20/26 | Card and entry titles |
| `--text-lead` | 20/30 | 18/28 | Hero lead, chapter leads |
| `--text-body` | 17/28 | 17/28 | Prose |
| `--text-small` | 15/24 | 15/24 | Card bodies, meta lines |
| `--text-meta` | 13/18 mono, +0.02em | 13/18 | Eyebrows, dates, years, chips, facts |

- **Page floor: 13 px.** Today's 12 px eyebrows, chips and footers go up to 13 px.
- Headings use `text-wrap: balance`; paragraphs use `text-wrap: pretty`; numbers use `tabular-nums`.
- Italic notes (`note`, the callback) become upright ink-2.
- The figure frame (corner labels) goes from 10.5 px to **12 px** with `letter-spacing: .06em`. It is a frame label, not body text, and anatomy sets the frame's form.

### 6.2 Tokens (exact)
Light:
```
--paper:#f4f2ec  --paper-2:#ece9e1  --card:#fbfaf7
--ink:#121416    --ink-2:#3f444a    --ink-3:#5c6066
--rule:#dcd8ce   --rule-strong:#c4beb1
--accent:#0f8b8d (graphics only) --accent-ink:#0a6466 (text) --accent-wash:#e2efec
--band:#121416   --band-ink:#f4f2ec --band-accent:#3cc4c6
```
Dark:
```
--paper:#0e1012  --paper-2:#131619  --card:#15181b
--ink:#ecedee    --ink-2:#b4b9be    --ink-3:#8f949a
--rule:#272b30   --rule-strong:#3a3f45
--accent:#3cc4c6 --accent-ink:#7fdcdd --accent-wash:#12302f
--band:#1a1e22   --band-ink:#ecedee --band-accent:#7fdcdd
```
Measured contrast (WCAG):
- ink-2 on paper: 8.8
- ink-3 on paper, card and paper-2: 5.65, 6.06 and 5.21
- accent-ink on paper, card, paper-2 and wash: 6.2, 6.65, 5.72 and 5.88
- band-accent on band: 8.7
- dark ink-3 on card and paper: 5.83 and 6.24
- dark accent-ink on card: 11.2

`--accent` #0f8b8d is 3.7:1 on paper, so it is used only for bars, rules, dots and focus rings (the 3:1 non-text minimum), never for text.

**Figure frame tokens**, overridden on `.iso-plate` in `globals.css`, not by editing the kit copy:
- light `--anatomy-muted:#66666b` (5.47 on #fbfaf7, up from 3.21) and `--anatomy-text:#4a4a4e` (8.45)
- dark `--anatomy-muted:#8f8f94` (5.54 on #15181b, up from 3.5)

Inside the drawing the tone system (hi, mid, lo, faint, lit) stays as it is: those are graphics, and anatomy wins there.

### 6.3 Jobs for the accent (and only these)
- chapter numerals and eyebrow words
- the active rail item and its progress bar
- metric figures in Work, and the facts in Field
- links
- the primary button's hover (it stays ink at rest)
- focus rings
- the NeurIPS and research badges
- the Contact band's email

Grey is now for supporting text only.

---

## 7. Toolbox and project fixes

### 7.1 Toolbox: from 40 chips to 4 lists
Put it under Work as `Toolbox` (h3) in a 4-column grid of plain lists (2 columns at 768, 1 at 390). Use 15 px text with a mono column heading and no chips. Group by job; the items are the résumé's own, with nothing added and duplicates merged:
- **Ship AI features:** LLM APIs (Claude, GPT-4o, Gemini) · LangGraph agents · MCP servers · RAG pipelines · embeddings · vector search · prompt versioning · LLM evals · guardrails · LoRA/PEFT fine-tuning
- **Build the product:** Next.js · React.js · Tailwind CSS · Node.js · FastAPI · Spring Boot · .NET
- **Run it:** PostgreSQL · MySQL · MongoDB · Qdrant · Redis · Docker · GitHub Actions (CI/CD) · Azure DevOps
- **Languages & ML:** Python · JavaScript · Java · C++ · C# · SQL · Dart · Kotlin · PyTorch · TensorFlow

The first 3 items in each list are set in `--ink` and the rest in ink-2. Those first items are the ones the Work tiles use, so the eye lands there first. (`vector search (Qdrant)` and `Qdrant` are merged: Qdrant appears under Run it, and vector search under AI.)

### 7.2 Shelf: rows instead of uneven cards
- The 2×2 cards left a gap in bloomScroll (no `note`, short body). Replace them with a **ruled list of 4 rows**, each a 12-column grid. Columns 1–3: name (h3) and status chip. Columns 4–9: hook (17 px, `--ink`, medium), body (15 px ink-2) and note (15 px ink-3, upright). Columns 10–12: chips stacked, then `Code ↗` pinned to the bottom.
- Rows have no shared height, so there is nothing to leave a gap. At 390 the columns stack.
- The hover lift is dropped. A row shows a 2 px accent bar on its left edge on hover and `:focus-within`.
- BharatEdge keeps `Independent research · Paper in preparation` as its status (accent chip) and its note.

### 7.3 Lab notebook
No layout change. Its 12 px labels move to 13 px, and its italic note becomes upright.

---

## 8. Accessibility and motion items

Accessibility:
1. Add a skip link (`Skip to content`, visible on focus) before the top bar, targeting `<main id="main">`.
2. Headings: one H1, then H2 per chapter and for Contact, then H3 inside. The toolbox, notebook and shelf titles become real `h3`s styled with the meta style.
3. Rail: `<nav aria-label="Chapters">` with `aria-current="true"` on the active link. Phone `Menu` gets a 44×44 target, closes on Escape and returns focus.
4. Detail figures: `role="img"` on the SVG with an `aria-label` from the spec's `label`, describing what the part is and what it shows. Decorative masks and defs get `aria-hidden`.
5. Links that open a new tab add visually hidden text `(opens in a new tab)`. The `↗` glyph stays `aria-hidden`.
6. All text pairs meet 4.5:1 (section 6). Focus rings are 2 px `--accent` with a 3 px offset on every surface, including the Contact band, where the ring uses `--band-accent`.
7. `scroll-margin-top: 72px` on every section, for the sticky bar.
8. Touch targets of at least 24×24 everywhere and 44 for primary controls. `Code ↗` links get `py-2`.
9. The bench's existing keyboard model and live region stay as they are; check it still announces after the layer refactor.

Motion:
1. Only `transform` and `opacity` for UI motion. The rail bar uses `scaleX`. Detail motions are small paint animations, as the guidance allows.
2. No scroll listeners. Use IntersectionObserver for the active chapter and detail visibility, and CSS view timelines for progress.
3. The bench's rAF loop already stops offscreen (`visible` in `live.tsx`). Verify it after the refactor.
4. Reveal: chapter openers stagger the marker first, then the figure 80 ms later (`transition-delay`). Content already in view at load does not animate (this is already the case).
5. No `transition: all`. No `will-change` except on the rail bar while it is animating.
6. Under `prefers-reduced-motion`: no reveal, no rail fill animation (show active and read states only), no detail motion, and the bench is still. All of these are wired in CSS.

Guidance not adopted (it conflicts with this repo, which has zero runtime deps and a static export): `motion/react`, `cn`/`tailwind-merge`, and Base UI primitives. We have no dialogs, and the menu is a native `<details>`. The tracking rule is also not adopted: mono labels keep their small positive tracking, and display type keeps negative tracking, as they do now.

---

## 9. Metadata, OG image and JSON-LD

### 9.1 Does `opengraph-image` work with `output: "export"`?
**Yes.** `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/01-metadata/opengraph-image.md` says generated images are "statically optimized (generated at build time and cached) unless they use Request-time APIs". `static-exports.md` lists as unsupported only the route handlers "that rely on Request", and says a GET handler is prerendered when marked `export const dynamic = 'force-static'`.

**One risk to check:** GitHub Pages sets `Content-Type` from the file extension, and there are no custom MIME types (see the `github-pages` skill). If the export writes the image without a `.png` extension, crawlers will get `application/octet-stream`. That is why M7 has a done-check on the file name. **Fallback:** a GET route at `src/app/og.png/route.tsx` with `force-static` that returns the same `ImageResponse`, which writes `out/og.png`, with `openGraph.images: ["/og.png"]` set explicitly.

### 9.2 The image (`src/app/opengraph-image.tsx`)
- 1200×630 PNG, with `alt`, `size` and `contentType` exported and `dynamic = "force-static"`.
- Design: a `#f4f2ec` background with a 6 px `#0f8b8d` rule down the left edge.
  - Top left: `Rohan Pant` (44 px) and `Full-stack + AI engineer` (26 px, #5c6066).
  - Centre: the H1 `I make AI models dependable.` (84 px, #121416).
  - Bottom: four cartridge tags (`Claude`, `GPT-4o`, `Gemini`, `Local LLM`) drawn as divs with their key-notch patterns from `NOTCHES` (the same object as the site's `.cart-tag`), then the facts line `BulkMagic · Purdue M.S. HCI · NeurIPS 2024` in #0a6466.
- Font: `Geist-Regular.ttf`, which ships with `next/og` (`node_modules/next/dist/compiled/@vercel/og/`). Read it once at module scope with `readFile`. Only Regular is needed, and no new dependency or network fetch.
- The SVG bench is **not** embedded. Satori and Resvg would not apply `iso.css`, and a mis-shaded bench is worse than none.
- Stay under the 500 KB `ImageResponse` bundle limit.

### 9.3 Metadata in `layout.tsx` (one place)
- `metadataBase: new URL("https://rohan2010.github.io")`
- `title`: `Rohan Pant · Full-stack + AI engineer` (unchanged)
- `description`: `Rohan Pant makes AI models dependable in production: agent workflows, guardrails, evals and the platform they ship on.`
- `alternates.canonical: "/"`
- `openGraph: { type: "website", url: "/", siteName: "Rohan Pant", title, description, locale: "en_US" }`. The image is auto-wired by the file convention.
- `twitter: { card: "summary_large_image", title, description }`
- A `viewport` export with `themeColor` set to `#f4f2ec` (light) and `#0e1012` (dark) by media query.
- Icons: replace the stock `favicon.ico` with `src/app/icon.svg`, a cartridge front with 4 notches in `#121416` on `#f4f2ec`, plus `apple-icon.png` at 180 px (it can also be generated as a static `ImageResponse`). Delete the unused stock files in `public/` (`next.svg`, `vercel.svg`, `file.svg`, `globe.svg`, `window.svg`).

### 9.4 JSON-LD (`page.tsx`, one `<script type="application/ld+json">`)
Use `ProfilePage` with `mainEntity` as a `Person`. Serialise with `JSON.stringify(data).replace(/</g, "\\u003c")`, as the Next JSON-LD guide recommends.
```
Person:
  name: "Rohan Pant"
  url: "https://rohan2010.github.io"
  jobTitle: "Software Engineer"
  worksFor: { @type Organization, name "BulkMagic, Inc" }
  alumniOf: [
    { @type CollegeOrUniversity, name "Purdue University" },
    { @type CollegeOrUniversity, name "Maharaja Agrasen Institute of Technology" }
  ]
  email: "mailto:rohanpant.work@gmail.com"
  address: { @type PostalAddress, addressLocality "Delhi", addressCountry "IN" }
  sameAs: [LinkedIn, GitHub]
  knowsAbout: ["LLM agent workflows", "RAG pipelines", "LLM evals", "guardrails", "Next.js", "Python"]
```
**No `telephone`.** Everything in it is rendered on the page (education is in the Research opener and the footer line), per the metadata guidance.

---

## 10. File-level change list

| File | Change |
|---|---|
| `src/app/globals.css` | New tokens (section 6.2), type-scale classes, `.iso-plate` frame-token overrides and corner size, `.chapter*` opener and the four body layouts, `.rail*`, `.toolbox`, `.shelf-row`, `.band`, the skip link, `scroll-margin-top`. Remove italic styles. |
| `src/app/layout.tsx` | Full metadata, `viewport` export, skip link, `<main id="main">` moved here or kept in `page.tsx` (one place). |
| `src/app/page.tsx` | Chronological order, JSON-LD, details passed to chapters. |
| `src/app/opengraph-image.tsx` | **New** (section 9.2). Fallback: `src/app/og.png/route.tsx`. |
| `src/app/icon.svg`, `src/app/apple-icon.png` | **New.** Delete `src/app/favicon.ico` and the stock `public/*.svg`. |
| `src/content/story.ts` | Hero copy A. `chapters: {id, n, word, years}[]`. Work rows gain `label`. Toolbox regrouped into 4 lists. Field entries gain a `keyFact`. Research `datasets`. Fun `stack` roles. Contact eyebrow `Contact`. Work eyebrow `03 — Work`, Fun `04 — For fun`. Detail figure captions. `site.description` updated. |
| `src/components/ui/TopBar.tsx` | Hosts the rail; phone current-chapter label; 44 px menu with Escape. |
| `src/components/ui/ChapterRail.tsx` | **New** client component: IntersectionObserver plus `aria-current`; progress via CSS view timelines. |
| `src/components/ui/Chapter.tsx` | **New**: the opener (marker plus figure, `side` prop). |
| `src/components/ui/Reveal.tsx` | Also toggles `data-inview` on `[data-detail]`; adds the opener stagger. |
| `src/components/ui/Chips.tsx` | `SectionHead` is replaced by `Chapter`; `Chips` stays, at 13 px. |
| `src/components/sections/Hero.tsx` | 4/8 grid, phone order, new copy, facts row. |
| `src/components/sections/{Field,Research,Work,Fun,Contact}.tsx` | Rewritten to the layouts in section 4 and the shelf rows in 7.2. |
| `src/components/figures/bench/art.tsx` | Split the coarse constants and export the ordered `LAYERS`. `BenchArt` feeds `BenchLive` from it. |
| `src/components/figures/bench/live.tsx` | Takes its slots from `LAYERS`; no behaviour change. |
| `src/components/figures/bench/view.ts` | `WIDTH`/`HEIGHT`/`PAD` retuned to the measured envelope (section 2). `P` stays the single projection. |
| `src/components/figures/bench/details.ts` | **New**: the four detail specs (section 5.2), including constructed poses. |
| `src/components/figures/bench/detail.tsx` | **New** server component `BenchDetail({ spec })`: crop, layer culling, `data-ctx`, edge-fade mask, `Plate`. |
| `src/components/figures/bench/bench.css` | `[data-ctx]` token remap, `.bench-detail` sizing, retry-flow keyframes, paused and running states, reduced motion, phone plate padding. |
| `src/components/iso/*` | **No edits** (the kit copy stays clean; overrides live in `globals.css` and `bench.css`). |

---

## 11. Build milestones for `site-builder`

Check each in Playwright at 1440×900, 1024×768, 390×844 and 375×667, in light and dark, and once with reduced motion emulated. After every milestone, `npm run build` must pass and `grep -r "7042\|+91" out/` must return nothing.

**M1. Tokens and type.**
Swap the tokens and the type scale. Override the figure frame tokens. Remove the italics.
*Done when:* an axe run reports 0 contrast violations in both themes. No computed `font-size` below 13 px outside `.iso-plate`, and the plate corners measure 12 px. Eyebrows and numerals compute to `--accent-ink`.

**M2. Layer refactor (no visual change).**
Split the constants and export `LAYERS`, with `BenchLive` fed from it.
*Done when:* a screenshot diff of the hero at rest against the pre-refactor build is 0 px at 1440 and 390. The tour still runs, keyboard ← → and Space work, the live region announces, and the loop stops offscreen.

**M3. Hero.**
Copy A, the 4/8 grid, the retuned `view.ts`, the plate padding, the phone order.
*Done when:* the H1 is ≤ 2 lines at 1440 and ≤ 3 at 390. The art's `getBBox()` width is ≥ 85% of the plate's inner width at 1440. At 390×844 the plate's bottom edge is ≤ 844 px from the page top. `scripts/lines.mjs` reads `line ends: 0`.

**M4. Detail figures.**
`details.ts`, `detail.tsx`, the ctx remap, the mask, and the two CSS motions.
*Done when:*
- Four plates render with Fig 1.1–1.4 at one shared zoom.
- `lines.mjs` reads `line ends: 0` on the built page in both themes.
- 4× close-ups of each crop show no see-through context and no cut-off line.
- No new client JS chunk appears (compare `out/_next` before and after).
- `document.getAnimations()` on a detail is `paused` when offscreen and `running` in view, and there are none under reduced motion.
- HTML gzip is ≤ 210 KB.

**M5. Chapter rail and openers.**
`TopBar`, `ChapterRail` and `Chapter`, with the four openers alternating sides.
*Done when:* scrolling through each chapter sets `aria-current` on exactly one rail link, and the progress bar fills (or shows the active state without view-timeline support). The phone bar shows `0n Word · years`. The menu closes on Escape and returns focus. There are no scroll listeners (check `getEventListeners(window)` in DevTools).

**M6. Chapter bodies.**
Field side by side, the Research band, Work tiles and toolbox, Fun's stack list, the shelf rows, the Contact band.
*Done when:*
- Each chapter's body screenshot is visibly distinct.
- No shelf row or tile has more than 32 px of unexplained empty space; measure the gap between the last text and the bottom padding.
- The toolbox renders 4 lists with 0 `.chip` elements.
- At 390 there is no horizontal scroll (`scrollWidth === clientWidth`).

**M7. Metadata.**
`opengraph-image.tsx`, `metadataBase`, icons, viewport, JSON-LD.
*Done when:*
- `out/` contains the OG image **with a `.png` extension** at 1200×630 (otherwise switch to the `og.png/route.tsx` fallback).
- `og:image`, `og:url` and `twitter:image` are absolute `https://rohan2010.github.io/…` URLs.
- The JSON-LD parses, has no `telephone` key, and every value in it appears on the page.
- `public/` holds no stock Next SVGs.

**M8. Final accessibility and motion sweep.**
*Done when:*
- The keyboard order runs skip link, rail, hero CTAs, bench, chapters, contact.
- Every new-tab link has the hidden suffix.
- Lighthouse accessibility and SEO are both 100.
- Client JS is ≤ 190 KB gzip.
- Reduced motion shows no movement anywhere.
- Both themes have been reviewed in screenshots at all four sizes.

---

## 12. GitHub Pages compliance
Everything is static: the OG image and icons are generated at build time (`force-static`), with no runtime fetches, no server, no API calls, no redirects and no custom headers. The only hosting risk is the OG file's MIME type, which M7 covers.

## 13. Open questions for Rohan
1. **Hero copy:** A (recommended), B or C?
2. **Contact as a dark band:** OK, or keep it on paper with only the large accent email?
3. **Fig 1.4 shows a constructed pose** (one cartridge seated and another held above the throat). This exact frame never happens in the tour, because the tour unseats first. Is that fine for a detail, or should it show the `fetch` frame with the socket empty?
4. Still open from the first plan: the Value Imprint paper link, the DecentralMem.AI link, and the phone-free résumé PDF.
