# Landing page plan: rohan2010.github.io

One page, read top to bottom like a short story. Facts come only from `docs/RP_resume_developer.pdf`. Anything the resume doesn't say is listed under Open questions (section 9), not invented.

## Decisions (Rohan, 2026-10-22)
- **Hero:** Concept A, The model bench (Hero tier, about 113 parts). **For fun:** L1, Lab notebook.
- **Résumé PDF:** Rohan will supply a copy without the phone number. Until then, the builder **does not** copy `docs/RP_resume_developer.pdf` to `public/`. It wires the button to `/rohan-pant-resume.pdf` and leaves it out of the page until that file exists (one flag in `story.ts`).
- **Location line:** show all three: `Delhi · open to relocating · immediate joiner`.
- **Still open:** lab notebook entries, the Value Imprint link and track, the DecentralMem.AI link and year, the cartridge model names, and a photo. The builder uses the defaults in section 9 and hides links that are still unknown.

**Thesis of the page:** *Models change every few months. Rohan builds the parts around them that don't: the memory, the guardrails, the evals and the product that ships. In his spare time he swaps the models for fun.*

---

## 1. Story spine

| # | Beat | The turn it makes |
|---|---|---|
| 1 | **Hero: the bench.** A model test bench seats one AI model after another. The memory, guardrails and output tray stay the same. | Sets the thesis: the models are swappable, the engineering around them is not. |
| 2 | **First models, out in the field (2021).** At Container Corporation of India he put a digit-reading CNN on a phone so it ran offline, and kept people in the loop for the predictions it was unsure of. At Let's Dunch he built a recommender that learned from what users actually did. | Origin: from the start he cared whether a model works where people use it, not only on a benchmark. |
| 3 | **Asking what models learn (2022–2024).** M.S. in HCI at Purdue. Value Imprint audited 6,501 RLHF annotations and was published at NeurIPS 2024. | Moves from making models work to asking what they are taught. This is the human side, and it carries into his production work. |
| 4 | **Making them dependable in production (2024–now).** At BulkMagic: agent workflows, guardrails, eval sets and the platform they run on. | Payoff: research habits (evals, auditing) become shipping habits. |
| 5 | **Off the clock: the bench is real.** He tries different models on the same task for fun, and built DecentralMem.AI so one memory works with any of them. | Lands the hero's metaphor as something true about him. The page ends on curiosity, not on a CV. |
| 6 | **Say hello.** Email, LinkedIn, GitHub, résumé. | A quiet close with one clear next step. |

---

## 2. Section-by-section spec

Container: max-width 1120 px, side gutter 24 px on desktop and 16 px at 390 px. Body text measure is 64ch at most. Each section has a mono eyebrow (`01 — Field`) and a display headline.

Motion for all sections: each block fades up 12 px over 360 ms (`cubic-bezier(.2,.7,.2,1)`) the first time it enters the viewport (IntersectionObserver in one tiny client component, `Reveal`). **Reduced motion:** no transform and no fade; content is visible from the start. Content is never hidden before JS runs: the hidden start state is applied only after hydration adds `data-reveal-ready` to `<html>`.

### 2.0 Top bar
- **Left:** `Rohan Pant` (Geist 600, 15 px). **Right:** `Work` · `Research` · `For fun` · `Contact` as anchor links, and a `Résumé ↓` link to the PDF.
- **Desktop:** sticky, 56 px tall, paper background at 85% with `backdrop-filter: blur(8px)`, and a 1 px rule that appears after 8 px of scroll.
- **390 px:** name on the left and `Résumé ↓` on the right. Anchors move into a `<details>` disclosure (`Menu`), with no JS.

### 2.1 Hero (`#top`)
**Purpose:** say who he is in one breath, and show the bench.

Copy:
- Eyebrow: `Full-stack + AI engineer`
- H1: **I build software where AI models do real work, and make them dependable.**
- Body: Full-stack software engineer with 3+ years in scalable web architecture and AI integration: LLM agent workflows, RAG pipelines and automated CI/CD. M.S. in Human-Computer Interaction from Purdue, with NLP research published at NeurIPS 2024.
- CTAs: primary `See the work` (→ `#work`), secondary `Download résumé` (PDF), tertiary text link `rohanpant.work@gmail.com` (mailto).
- Below the CTAs, a mono line of facts: `BulkMagic · Purdue M.S. HCI · NeurIPS 2024`

Figure: **Fig 1, The model bench** (section 3, concept A).

Layout:
- **Desktop (≥ 1024):** two columns, 5/12 text and 7/12 figure card, vertically centred, min-height `calc(100svh - 56px)`. The H1 uses `clamp(40px, 5.2vw, 68px)`.
- **390 px:** text first (H1 at 38/42), then CTAs stacked full width, then the figure card at full width (bleeding to the 16 px gutters). The SVG is scaled to 116% inside the card with `overflow: hidden`, as in the test rig's `stretch.css`. The hint changes to `Tap a cartridge`.

Interactions: these belong to the figure (section 3A, "Live behaviour").

### 2.2 Field notes, 2021 (`#field`)
- Eyebrow: `01 — Field`
- H2: **First models, out where people use them.**
- Two entries in a timeline column (a thin rule down the left, a date in mono and a dot on the rule):

**Container Corporation of India Ltd.** · SDE Intern · New Delhi · Sep–Nov 2021
> Trained an edge-optimized CNN in TensorFlow to read handwritten digits and shipped it with TFLite inside a cross-platform Flutter app, so on-site operations didn't depend on cloud compute. Then built an active-learning loop against concept drift: the 15% of predictions the model was least sure of went to a person, and the verified labels retrained it.

**Let's Dunch** · Software Engineer · Dubai (remote) · Aug 2021–Feb 2022
> Built a "Who to Meet" recommendation pipeline in Python and scikit-learn. It turned user metadata into similarity scores and corrected itself from an implicit feedback loop on interaction data, which lifted retention. Led a 3-person team through a full-stack redesign of the event booking flow: registrations rose 30%.

- Pull-stat chips beside each entry, in mono: `offline inference` · `bottom 15% → human review` · `+30% registrations`.
- **Desktop:** headline in the left 4/12 (sticky while the column scrolls), timeline in the right 8/12. **390 px:** one column; the headline isn't sticky.

### 2.3 Research (`#research`)
- Eyebrow: `02 — Research`
- H2: **Then I asked what the models were being taught.**
- Lead: M.S. in Human-Computer Interaction, Purdue University, Aug 2022–May 2024.
- Feature card: **Value Imprint**, an RLHF dataset auditing framework · `NeurIPS 2024` badge
> A two-phase NLP pipeline that maps an ethics-based taxonomy onto 6,501 curated RLHF annotations. A transformer classifier trained on it audits industry alignment data (Anthropic/hh-rlhf, OpenAI WebGPT, Alpaca GPT-4), and found a statistical bias toward information-utility over prosocial values. The datasets are open-sourced.
- Stack chips: `Python` `Transformers` `NLP`. CTA: `Read the paper ↗` (the URL is an open question; hide the link until we have it).
- Big number on the card: `6,501` in mono 56 px, with the label `RLHF annotations audited`.
- **Desktop:** card spans 8/12 with the big number on its right. **390 px:** big number on top, then the text.

### 2.4 Work (`#work`)
- Eyebrow: `03 — Production`
- H2: **Now I make them dependable in production.**
- Role header: **BulkMagic, Inc** · Software Engineer · New York (remote) · Aug 2024–present
- Four result rows, each a metric on the left (mono, 32 px) and a sentence on the right:

| Metric | Copy |
|---|---|
| `days → minutes` | Seller activation, via a stateful LangGraph agent workflow whose tool-calling nodes validate KYC, tax and legal documents, with conditional routing and retries on failure. |
| `−40%` | Product listing time, via a multimodal generation service (OpenAI API for product copy, Stable Diffusion for imagery) built on versioned prompt templates and structured-output parsing. |
| `guardrails` | Generation kept reliable in production: schema validation on model responses, retry and fallback paths for malformed output, and prompt changes regression-tested against a curated eval set. |
| `−30%` | Storefront time-to-market, by building the multi-seller platform (Next.js, Tailwind CSS, REST APIs). CI/CD automated with GitHub Actions halved deployment cycles, with zero downtime. |

- A callback line under the rows, in muted text: *The bench at the top runs this loop: seat a model, check the output, retry, ship.*
- **Toolbox** (sub-block): five rows from the resume's Skills section, each a label and its chips: Languages, Frameworks, AI / ML, Data & Infra, LLM Ops. Chips are plain text with a 1 px border; no logos.
- **Desktop:** the metric column is 3/12 and the copy 9/12. **390 px:** metric above copy; chips wrap.

### 2.5 For fun (`#fun`)
- Eyebrow: `04 — Off the clock`
- H2: **The bench is real. I swap models for fun.**
- Lead: When a new model comes out, I put it on the same task as the others and see what changes. To make that easy I built DecentralMem.AI, so one memory travels with me from model to model.
- **DecentralMem.AI card:** a model-agnostic persistent memory layer.
> MAML is a retrieval-augmented context layer that serves project-scoped memory to Claude, GPT-4o, Gemini and local LLMs through an MCP server interface, with namespace isolation and retries when the vector store fails. PostgreSQL is the source of truth, Qdrant does vector search and Redis caches, with embeddings from a self-hosted FastAPI service.
- Stack chips: `Python` `FastAPI` `PostgreSQL` `Qdrant` `Redis` `MCP`. CTA: `Code on GitHub ↗` (link is an open question).
- The rest of the section is the chosen leisure concept (section 3.L). The recommended **Lab notebook** goes here.

#### 2.5b From the workbench: GitHub projects (added 2026-10-22, Rohan's request)
A shelf of real projects from `github.com/rohan2010`, below the DecentralMem card. **Only public, non-fork repos. Copy comes only from each repo's README and description; read the full README with `gh api repos/rohan2010/<repo>/readme` before writing a card, and never claim results or status the README doesn't state.** Each card has: the name, a one-line hook, 1–2 sentences, stack chips, `Code ↗` (repo) and `Live ↗` (only if it has a homepage URL).

| Repo | Hook (from its README) | Notes |
|---|---|---|
| `bloomScroll` | Keeps YouTube on what you came for: a browser extension that hides off-topic videos using on-device rules, embeddings and a local AI model. Nothing leaves your computer. | TypeScript. The README says it's an early release. |
| `bharat-edge` (BharatEdge-Eval) | Does quantizing a small model to fit a budget phone hurt Hindi and Hinglish users more than English users, and can a cheap fix recover it? | Python. Gemma 3 1B, Qwen3, Llama 3.2 1B; llama.cpp/GGUF. **This is the first Lab notebook entry:** question = the README's question, models = the README's list, "What I noticed" = only stated findings, or `In progress` if it has none. **Status (Rohan, 2026-10-22):** independent personal research, not yet published, write-up coming soon. Show it as a status tag `Independent research · Paper in preparation` and a line like *"Unpublished for now: the write-up is on its way."* Never call it published, accepted or peer-reviewed, and don't link the README's write-up as if it were a paper. |
| `strata_dev` (Conductor) | Describe a goal; an orchestrator plans it as a task graph, delegates to specialist subagents, and hands you a pull request. | Python. |
| `NoteNinja` | Turns a song into another genre with a diffusion model trained on GTZAN spectrograms. | Jupyter/Python, 2023. |

- **Excluded:** `luman-studio` (Rohan removed it), forks (`rss-feeds`, `nanochat-test`, `OpenCV-Projects`, `SpringSensingTest`), private repos, repos with no README or only boilerplate (`burogu`, `ml-experiments`, `alignment-30`, `decenz-mcp`), the personal `khushi-farewell`, and the 2020–2023 Spring/coursework repos.
- Data lives in `src/content/projects.ts`, typed and written by hand at build time. **No GitHub API calls at runtime.**
- Card order: bloomScroll, BharatEdge-Eval, Conductor, NoteNinja (4 cards). **Desktop:** 2 columns. **390 px:** 1 column. Hover lifts the card 2 px; focus-visible shows a ring.
- End with `More on GitHub ↗` (https://github.com/rohan2010).

### 2.6 Contact (`#contact`)
- Eyebrow: `05 — Hello`
- H2: **Building something with models in it? Let's talk.**
- Rows, large (24 px) with an arrow on hover: `rohanpant.work@gmail.com` (mailto) · `LinkedIn ↗` (https://www.linkedin.com/in/rohan-pant/) · `github.com/rohan2010 ↗` · `Résumé (PDF) ↓`.
- Small mono line: `Delhi · open to relocating · immediate joiner`.
- **No phone number anywhere** in page content, metadata or JSON-LD.
- Footer: `© 2026 Rohan Pant · Built with Next.js, drawn with Anatomy.`

---

## 3. Hero concepts with anatomy

The size tiers come from the skill: a **Figure** is 40–80 parts, a **Hero** 80–150, an **Epic** more. All three concepts below are drawn in SVG with the kit, with no WebGL.

### Concept A: The model bench (recommended)
**Mapping:** a picker lifts one model cartridge from a rack and seats it in a socket. The same memory cabinet answers whichever model is seated, and each output card it produces runs through a go/no-go gauge: a pass slides into the "shipped" tray, a fail is flipped into a return chute and retried. **What moves means: the model is the swappable part, and Rohan builds the bench.** This covers DecentralMem (model-agnostic memory), BulkMagic (guardrails, retries, eval gauge, the shipped tray) and the leisure (swapping models to see what changes) in one real machine.

**Tier: Hero, about 113 parts** (about 2–4 hours of build). An Epic version (a full studio, with a conveyor per BulkMagic workflow, a WebGL lamp over the bench and the explode) is listed at the end of this section and is not recommended.

**Parts list (113):**

| Group | Parts | Count |
|---|---|---|
| Base | plate with bevel, 4 feet (flange + foot = 8), perimeter groove, 4 corner screws with rings, label plate with 2 screws and 3 rule lines, front ruler strip (minor every 5, major every 25) | 18 |
| Cartridge rack (left) | rack base, 2 side cheeks, 4 slot dividers, 4 cartridges × 3 (shell, grip ridges as a knurl band, contact edge strip; each cartridge has its own **key-notch pattern** instead of a name), 4 rack screws, 2 detent springs (split back/front) | 25 |
| Picker gantry | 2 posts with collars (4), beam with tick ruler (2), 2 end stops, carriage on 2 bushings (3), vertical plunger with collar (2), 2 gripper jaws, knurled thumb knob, rider tick | 18 |
| Socket station (centre) | socket block, throat with 2 guide rails (3), latch lever with pivot pin (2), contact pin row (dots, 1), status window on the front face (1, one tiny engraved `MODEL` label allowed), 4 mounting screws, ribbon connector, seat coil spring split back/front (2), lock knob | 16 |
| Memory cabinet (behind the socket) | cabinet case, 3 drawers (source-of-truth, vector, cache, sized by role: deep, medium, shallow), 3 pulls, 3 card holders, ribbon `Wire` to the socket's connector, cable clamp, 2 screws | 14 |
| Eval line (right) | track bed, 2 side rails, 6 rollers, output card (**the subject, `lit`**) plus a ghost card for the retry, go/no-go gauge frame, go slot, no-go flap on a pivot (2), return chute, shipped tray, counter dial (puck, bezel, ticks, needle = 4) | 22 |

**Model (`model.ts`):**
- `CARTRIDGES = ["Claude", "GPT-4o", "Gemini", "Local LLM"]`, which are exactly the models the resume's DecentralMem bullet names.
- One state machine: `pick → seat → recall → generate → check → (pass → ship) | (fail → retry ≤ 2 → fallback)`. The retry and fallback come from BulkMagic's guardrails bullet.
- Memory namespace: `"site"`. It stays the same across swaps, which is the whole point.
- `step(state, input, dt)` and `readoutOf(state)` are pure functions.

**Readout (bottom right):** `GPT-4o seated · memory: same namespace · card 3 passed` and, on the retry path, `card 4 · retry 1 · passed`. Every number counts the figure's own cards, so nothing claims a benchmark score. Aria `valuetext` gives the same text.

**Camera:** azimuth 50° so the long front (rack → socket → eval line) faces the viewer, elevation 30°, viewBox 640 × 360, `fitProjection` with pad 30. Layout runs along +x: the rack at x ≈ −190, the socket at 0, the memory cabinet behind it at y ≈ −70, the eval line from x ≈ 60 to x ≈ 200, and the gantry beam over the rack and socket at z ≈ 70.

**Live behaviour:**
- **Idle tour**, 9 s per loop, starting 1.4 s after the card enters view. The picker goes to the next cartridge, lifts it, carries it and seats it; the latch closes and the seat spring compresses; the vector drawer slides out 6 units (recall) and back; the card rolls out to the gauge and passes. Every third loop the card arrives with a bent corner, the no-go flap tips it into the return chute, and the retry card passes.
- **Pointer:** click a cartridge to seat it. **Keyboard:** `←`/`→` pick, `Space` runs a card. `role="group"` with a labelled control set.
- Springs: the picker follows with τ 0.12 s, and the latch and seat spring use the kit's `spring`. The figure stops when offscreen (`useInView`).
- **Reduced motion:** no tour. A swap places the cartridge directly, and the card appears in its tray. Rest pose: Claude seated, card 1 passed.
- **Painter's order:** base → rack back cheek → cartridges by depth → rack front cheek → memory cabinet → ribbon → socket back half → seated cartridge → socket front half and latch → gantry posts → beam → carriage and plunger (moving, in its slot above everything it passes over) → eval track → card → gauge → tray → counter dial.

**Card:** `Fig 1` · title `The model bench` · hint `Pick a cartridge ← →, Space to run` · readout as above. Legend keys: *the seated model (raised)* · *the output being checked (lit)* · *the retry path (dotted)*. Caption: *A test bench where the model is the swappable part: four cartridges (Claude, GPT-4o, Gemini and a local LLM) share one memory cabinet, and every output card goes through a go/no-go gauge before it ships. The tour fails one card in three on purpose to show the retry path.*

**Feasibility with the kit:** everything here is slabs, cylinders, coils, knurls, ticks, dots and one `Wire`, all in `iso-kit.ts` plus `react/draw.tsx`. That is the same vocabulary as `examples/test-rig/` (53 solids), at about twice its size. No `lathe.mjs`, `tube.mjs` or WebGL is needed, so the audit pipeline (`audit.mjs`) isn't needed either: the one cable is a `Wire` with terminal dots. Moving parts (picker, cartridge, latch, drawer, card, flap, needle) are built once at rest and moved with `translate`, as `live.tsx` does in the test rig. Only the seat coil and the needle are rebuilt per frame (`frame.ts`).

**Epic version (not recommended):** a whole AI workshop, with a conveyor station for each BulkMagic workflow (KYC, tax, legal), a WebGL work lamp, an exploded view of the memory cabinet and a fifth "your model" slot. It would be 250+ parts and 6+ hours. Concept A keeps the core idea.

### Concept B: The document line (BulkMagic's activation agent)
**Mapping:** a seller's document packet rides a short conveyor through three inspection stations (KYC, tax, legal), each a stamp press on a sprung arm. A diverter gate after each station routes a failed packet up a return lift for a retry, and a passed packet drops into an "activated" bin. A dial reads the elapsed steps. **Motion means: a stateful agent with tool-calling nodes, conditional routing and retries turns days into minutes.**
- **Tier:** Hero, about 105 parts.
- **Parts (grouped, 40+):** base (plate, feet ×8, groove, screws ×4, label plate); conveyor (bed, 2 side rails, 10 rollers, drive drum, belt seam lines, tensioner knob); 3 stations × (column, press arm, coil spring split, stamp head, indicator lamp housing, 2 screws); 3 diverter gates with pivots; return lift (2 posts, platform, lead screw, knurled crank); activated bin; packet (the subject, lit) with 3 sheets; step counter dial (puck, bezel, ticks, needle).
- **Readout:** `packet 2 · tax check retried · activated in 7 steps`.
- **Camera:** azimuth 40°, elevation 30°, viewBox 640 × 340.
- **Verdict:** strong and true, but it only tells the BulkMagic chapter. The research and the leisure are left out of the hero. Better as an inline Figure inside Work if Rohan wants a second figure there.

### Concept C: The card sorter (Value Imprint)
**Mapping:** a punched-card sorter feeds annotation cards one by one past a reading head. Each card drops into the pocket for its value category, and the pocket stacks rise to show how the data leans. **Motion means: auditing what an RLHF dataset actually rewards.**
- **Tier:** Figure–Hero, about 90 parts.
- **Parts (grouped, 40+):** base (plate, feet ×8, groove, screws ×4); hopper (walls ×3, weight block, feed roller, knurled knob); reading head (housing, brush row as dots, lamp window); transport (2 rails, 6 rollers); pocket row (7 pockets × wall + floor + card stack = 21, ticks on the front ruler); counter dial; the moving card (lit).
- **Readout:** `card 1,204 of 6,501 · pocket: information-utility`.
- **Truth gap:** the per-category counts aren't in the resume, so the stacks would have to come from the paper (Open questions). Without them the figure can't be honest, which is why it isn't recommended for the hero.

### Recommendation
**Concept A, The model bench, as a Hero of about 113 parts.** It is the only concept that carries the whole page: the hero sets up the metaphor, Work explains the gauge and retry path, and For fun reveals that the bench is how he actually spends his evenings. It needs only the kit's core, so it is the lowest-risk Hero build.

### 3.L Leisure section ("what I do for fun"): options
The idea Rohan raised (a model test bench in the leisure section) is folded into the hero above. If the hero is the bench, a second bench in the leisure section would repeat it. These are the three distinct options for the section itself:

**L1. Lab notebook (recommended).** A short, dated log of real experiments laid out as notebook pages. Each entry has the fields `Question`, `Models on the bench` (as small cartridge-shaped tags that echo the hero's key-notch shapes in CSS), `What I noticed` (2–3 sentences) and an optional `Link`. 3–6 entries, newest first, with a `More on GitHub ↗` link at the end. It costs no new figure and is the most honest version of "I experiment for fun", but it **needs Rohan's real entries** (Open questions).
- Desktop: a two-column grid of entries on a faint ruled background (a CSS gradient). 390 px: one column.
- Motion: entries reveal like the rest; none otherwise.

**L2. Cabinet of side projects (Fig 2, an anatomy Figure of about 60 parts).** A chest of small drawers on feet, one drawer per thing built for fun. Hover or tab opens a drawer and the card's readout names the project, and DecentralMem.AI is the biggest drawer. This is worth a second figure only if there are at least 4 real fun projects. It adds about 1 hour of build.

**L3. Bench in the leisure section, document line in the hero.** Rohan's original framing: the hero becomes Concept B (work-first), and the model bench moves down here as an interactive Fig 2 that the visitor drives. The split between work and play is clearer, but it means **two Hero-tier figures** (about 2× the build time and twice the client JS), and the hero no longer hints at the research or the fun.

**Recommendation:** A as the hero + L1. The hero's tour shows the bench, and the leisure section says the bench is true and gives the receipts.

---

## 4. Where else anatomy earns a place
- **Only Fig 1 by default.** The page has a single figure, so the hero stays special and the page stays light.
- **Optional Fig 2:** only if Rohan picks L2 (cabinet) or L3 (bench below). Never more than two figures on the page.
- Not recommended: Concept C inside Research. It would need numbers we don't have, and a big `6,501` stat does the job.

---

## 5. Visual direction
- **Mood:** an engineer's bench in daylight. Warm paper, ink-black type, one teal accent taken from the resume's heading colour so the PDF and the site feel like one thing.
- **Type:** Geist Sans (already loaded in `layout.tsx`) for display and body; Geist Mono for eyebrows, dates, metrics, chips and the figure card corners. Display uses weight 600 and tracking −0.02em, `clamp(40px, 5.2vw, 68px)`; H2 `clamp(28px, 3.4vw, 44px)`; body 17/28; small mono 12/16 with +0.04em tracking and uppercase eyebrows.
- **Spacing:** 4 px scale. Section padding is 128 px desktop and 72 px at 390 px; block gap 24/16; card radius 14; rules 1 px.

**Colour tokens** (on `:root`, with dark under `@media (prefers-color-scheme: dark)` and `[data-theme="dark"]`):

| Token | Light | Dark |
|---|---|---|
| `--paper` | `#F6F5F1` | `#0E1012` |
| `--card` | `#FBFAF7` | `#15181B` |
| `--ink` | `#16181A` | `#ECEDEE` |
| `--ink-2` | `#4A4F55` | `#A3A9AF` |
| `--rule` | `#DEDBD3` | `#26292D` |
| `--accent` | `#0F8B8D` | `#3CC4C6` |
| `--accent-ink` | `#0B6E70` | `#7FDCDD` |

- **How the figure's tones fit:** the iso figure stays monochrome, using the kit's own four shades and the one `lit` accent. Teal is **never** used inside the drawing, only for page links, CTAs and the NeurIPS badge. Set `--anatomy-paper` to `--card` inside `.iso-plate` so fills match the card exactly. **Light is the designed theme.** Theme: an inline script as the first child of `<body>` sets `body.dataset.theme` from `prefers-color-scheme` before paint (`suppressHydrationWarning` on `<body>`), and `<body class="iso">` makes the kit's `.iso[data-theme]` tokens follow it.

---

## 6. Component and file plan
```
src/app/
  layout.tsx            metadata (title "Rohan Pant · Full-stack + AI engineer", description, OG), fonts, theme script, <body class="iso">
  page.tsx              server component; composes the sections in order
  globals.css           tokens (section 5), Tailwind import, import of iso.css
src/content/story.ts    every string on the page, typed (one source; the builder never types copy into JSX)
src/components/
  iso/                  copied from the skill's kit/: iso-kit.ts, iso.css, react/draw.tsx, react/live.tsx (unchanged)
  ui/Reveal.tsx         "use client": IntersectionObserver fade-up; respects reduced motion
  ui/TopBar.tsx         server; <details> menu on mobile
  sections/Hero.tsx  Field.tsx  Research.tsx  Work.tsx  Fun.tsx  Contact.tsx   (all server)
  figures/bench/
    model.ts            pure: cartridges, state machine, readoutOf (no DOM)
    view.ts             world constants, P = fitProjection, at(), shift()
    geometry.ts         every static path, computed once (server-only import)
    frame.ts            per-frame paths: seat coil, needle (imported by live.tsx)
    art.tsx             server: static parts as keyed JSX constants, passed as element props
    live.tsx            "use client": refs, tour, pointer/keyboard, readout, aria
    bench.css           scoped .bench tokens and the phone stretch
    figure.tsx          <Plate fig="Fig 1" …><BenchArt/></Plate>
public/
  rohan-pant-resume.pdf copied from docs/ (see Open question 2 about the phone number)
```
- **Server/client split:** geometry runs at build time, so the client gets only path strings, `live.tsx`, `frame.ts` and `model.ts`. Following `references/react.md`, give every element prop's root a `key`, and keep no client components inside server-built art. Use `data-part` and event delegation for clicks on cartridges.
- No new npm packages are needed. The kit is self-contained.

---

## 7. GitHub Pages compliance check
| Pages CAN'T | This plan |
|---|---|
| Server code, API routes, Server Actions | None. All sections are static server components rendered at build time, and there's no form: contact uses `mailto:`. |
| Database or secrets | None. No API keys; the bench "runs" no real model, because it's a client-side state machine. |
| Custom headers, redirects, rewrites | None used. `next.config.ts` keeps `output: "export"` and `images.unoptimized`. |
| `cookies()`/`headers()`, middleware, ISR, dynamic routes | None. It's a single static route `/`. |
| Browser APIs at render | `window`/`matchMedia` are used only in effects and in the inline theme script. |
| PPR (`cacheComponents`) | Leave it off. |
| Large files | The PDF is about 140 KB and there's no video. The figure is inline SVG of roughly 100–200 KB of markup. |
| Jekyll stripping `_next/` | `.nojekyll` already exists, and the Actions deploy publishes `out/`. Confirm that Pages Source is "GitHub Actions". |
| Privacy | No analytics or data collection. The phone number never appears (check: `grep -r "<phone>" out/` must be empty, PDF aside; see Open questions). |

---

## 8. Build order (milestones for `site-builder`)
Verify every milestone with the Playwright MCP in a real browser at 1440 and 390 wide, in light and dark (per the user's CLAUDE.md).

1. **Kit in place.** Copy `kit/iso-kit.ts`, `kit/iso.css` and `kit/react/*` to `src/components/iso/`, import `iso.css` in `globals.css`, and set up the tokens and theme script. *Done when* `npm run build` writes `out/index.html` with no type errors.
2. **Content and static sections.** Add `story.ts` and all six sections plus the top bar, with no figure (a placeholder card at the hero's aspect ratio). *Done when* every string matches section 2, it reads well at 390 with no horizontal scroll, and `grep <phone> -r src out` is empty.
3. **Résumé and contact.** Wire the résumé button behind a flag (it shows only once Rohan's phone-free PDF is at `public/rohan-pant-resume.pdf`; **never** copy the PDF from `docs/`), and wire up the mailto, LinkedIn (`https://www.linkedin.com/in/rohan-pant/`) and GitHub links. *Done when* the contact links work, the résumé button is hidden while `public/rohan-pant-resume.pdf` is missing, and it shows and downloads once the file is added.
4. **Bench model.** `model.ts` with the state machine and readout. *Done when* a node script steps it through pick → seat → … → pass and a fail → retry → pass, and the readout strings match section 3A.
5. **Bench rest pose (server).** `view.ts`, `geometry.ts` and `art.tsx` render Fig 1 in the card with no JS. *Done when* the 1× view reads as a bench and a 4× zoom over each group shows no bare face, no line ending in the air and correct overlaps, in both themes.
6. **Bench live.** `live.tsx` and `frame.ts`: tour, click, keyboard, readout, aria, offscreen pause, reduced motion. *Done when* the tour runs 3 loops including a retry, keyboard-only control works, there are no console warnings (especially key warnings on the full page), and reduced motion shows the still rest pose.
7. **Leisure section and GitHub shelf.** Add L1 with the BharatEdge-Eval entry (more once Rohan sends them) and the projects shelf from section 2.5b. *Done when* it renders with real content only, every card's claims trace to its README, and all links resolve.
8. **Polish and ship.** Add Reveal motion, focus rings, metadata and OG, and check the dark theme. *Done when* the Actions deploy passes and `curl -sI https://rohan2010.github.io/` returns 200.

---

## 9. Open questions for Rohan
1. ~~Résumé PDF~~: decided. Rohan supplies a copy without the phone number.
2. **Leisure entries (for L1).** 3–6 real experiments: what you asked, which models you swapped (including which local LLMs), what you noticed, and links if any. Until they arrive, the builder ships the section with only the DecentralMem.AI card and no invented entries.
3. ~~Leisure direction~~: decided, A + L1.
4. **Value Imprint link.** The paper URL, and the NeurIPS 2024 track (main, workshop, or Datasets & Benchmarks), so the badge says it exactly.
5. **DecentralMem.AI.** Is it public? Give the repo or demo link, and the year.
6. ~~Location line~~: decided, all three.
7. **Model names on the bench.** Are you happy with Claude, GPT-4o, Gemini and "Local LLM" as the four cartridges (taken from the DecentralMem bullet), or do you want different ones?
8. **Photo.** Do you want a headshot anywhere (for example in Contact), or none?
