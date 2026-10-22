# v2 concepts: rohan2010.github.io

Creative direction for the rebuild. Rohan's brief: the current site "looks like UI slop": it has no story and follows no UX laws. The portfolio has to prove his design and problem-solving skill by itself. It needs one strong conceit, scroll storytelling (GSAP, Lenis, anime.js are allowed) and **project pages** that show how each project is built and what he learned.

**His message:** *AI is amazing; everything around it is helping us progress, and making full use of it will lead us to an amazing future.*

**Rules carried over from v1:** facts come only from `docs/RP_resume_developer.pdf`, the repo READMEs (`src/content/projects.ts`) and well-documented public history. Nothing is invented: no metric, status or publication the sources don't state, and no phone number anywhere. History facts each get one checked source in the build plan (see "Fact checks" at the end).

**What is wrong with v1, in design terms** (so we don't repeat it):
- The concept (a model bench) is a metaphor for his *job*, not for his *message*. It says "I am careful", not "this is where we're going".
- Every chapter is a heading, then a block, then chips. Time passes in the copy, but the page never changes state.
- It wears the generic kit the `frontend-design` skill lists as tells: cream paper, a mono eyebrow over every heading, `A · B · C` meta strings, mono data labels, `↗` on every link, and same-weight cards. Some of these can stay, but only where they carry meaning.
- Projects are cards that link out to GitHub. There's no page where his thinking is visible.

A note on the skills: from `company-frontend-design` I've kept the 5-step directive, motion with a purpose, and the reduced-motion and adjacent-section rules. I've dropped its indigo brand colour, gradient text, noise-on-everything and SaaS section templates, because they conflict with this brief and are themselves slop tells.

---

## Concept 1: "Rhymes": a short history of helpful machines

### 1. The conceit
**Every era of computing made machines help more people, and each step of Rohan's career rhymes with one of those eras: the page is a 180-year timeline where his work lands at the point in history it continues.**

*Why it embodies the message rather than saying it:* the visitor *experiences* progress. The page physically moves forward in time, the palette warms from ink-on-rag-paper to living teal, and the scale of the year ruler opens up as the present nears (more happened in 2017–2026 than in 1843–1950). The visitor feels the speed of progress, sees that each leap was people and machines working together, and finds Rohan at the leading edge, with the last scene, still blank, left for the visitor. Hope is shown as a trajectory, not stated in a slogan.

The device that makes it his and not a museum is **the rhyme**: a historical machine and Rohan's project share one drawing, and scrolling morphs one into the other. They really are the same problems:
- 1989: LeCun's network reads handwritten ZIP codes for the US Postal Service. **2021:** Rohan ships a handwritten-digit CNN on a phone for Container Corporation of India, offline, with the least-sure 15% sent to a person.
- 1992: "collaborative filtering" is coined at Xerox PARC (Tapestry). **2021:** Rohan's "Who to Meet" recommender at Let's Dunch learns from what people actually do.
- 1890: Hollerith's tabulator sorts census cards into pockets, counting what a country is made of. **2024:** Value Imprint sorts 6,501 RLHF annotations into value categories, counting what a model is taught (NeurIPS 2024).
- 2022–23: language models learn to use tools (ReAct, Toolformer). **2024–now:** BulkMagic agents call tools to validate KYC, tax and legal documents, with retries: activation goes from days to minutes.
- 2024: MCP standardises how models reach context. **Now:** DecentralMem.AI serves one memory to Claude, GPT-4o, Gemini and local LLMs over MCP.
- Next: models small enough for a budget phone. **Now:** BharatEdge-Eval asks whether that shrinking costs Hindi and Hinglish users more than English users. bloomScroll runs its model on your own computer.

### 2. Narrative arc (8 scenes)
| # | Scene | What you see | What moves | What it means | Rohan fact | Beat |
|---|---|---|---|---|---|---|
| 0 | **1843: the objection** | Rag paper. One sentence of Ada Lovelace's Note G set large: *"It can do whatever we know how to order it to perform."* Below, small: Rohan's name and one line. | Words ink in, letter by letter, as if pressed. A single card hole punches through on load. | The founding doubt: machines only do what we tell them. The page is going to argue with it, kindly. | Name, role: full-stack + AI engineer. | Curiosity |
| 1 | **The ruler** | The year ruler unrolls down the left margin: 1843 → 2026, on a scale that stretches near the present. | Scroll drives the ruler. Tick density visibly grows. | Progress is accelerating, and you can see it. | — (the frame for the rest of the page) | Curiosity → momentum |
| 2 | **1989 ↔ 2021: reading handwriting** | A USPS envelope with a ZIP code; the digits lift into a small iso network. Scroll and the envelope becomes a CONCOR cargo slip, and the network folds into a phone. | The morph (scroll-scrubbed). The 15% uncertain digits peel off to a small human figure and come back labelled. | The same problem, 32 years on, now in a pocket, offline, with a person in the loop. | CONCOR, SDE intern 2021: edge CNN, TFLite, Flutter, active learning on the bottom 15%. | Recognition |
| 3 | **1992 ↔ 2021: "collaborative"** | The word *collaborative filtering* typeset as a 1992 memo heading. The memo folds into a grid of people at an event, with lines of "who to meet". | Lines draw between people as you scroll; the registrations counter ticks +30%. | The field named itself after collaboration 30 years ago. | Let's Dunch: recommender (scikit-learn, implicit feedback), led 3 people, +30% registrations. | Warmth |
| 4 | **1890 ↔ 2024: what are they taught?** | A Hollerith-style sorter. Cards fall into pockets. The cards turn into RLHF annotation cards, and the pockets get value names. One pocket fills faster. | Cards drop on scroll. The stacks rise unevenly. | Tension: models learn values from us, and the counts lean. Auditing them is how you keep the future good. | Purdue M.S. HCI; Value Imprint: 6,501 annotations, hh-rlhf / WebGPT / Alpaca GPT-4, bias toward information-utility over prosocial values; NeurIPS 2024. | Tension |
| 5 | **2023 ↔ now: machines that act** | A document line: a seller's packet rides through KYC, tax and legal stations. A failed packet goes up a return lift and passes on retry. | Scroll-pinned. The packet moves with scroll; the retry runs on its own in time. | The answer to the tension: AI acts in the world because someone built the checks around it. | BulkMagic 2024–now: LangGraph agents, days → minutes; −40% listing time; guardrails (schema, retry, fallback, evals); −30% time-to-market. | Payoff |
| 6 | **2024 ↔ now: memory that travels** | The model bench (v1's figure, reused): four cartridges, one memory cabinet. The visitor can swap the model. | Time-based idle tour; the visitor drives it. | Models change every few months. What Rohan builds around them stays. | DecentralMem.AI (MCP, Postgres, Qdrant, Redis, FastAPI); Conductor (task-graph orchestrator); he swaps models for fun. | Delight |
| 7 | **Next: for everyone** | The ruler runs past 2026 into blank paper. A budget phone; two speech bubbles, one English, one Hindi. | The phone's model "shrinks" (bits 16 → 8 → 4 → 3) with scroll, and the Hindi bubble is the one that blurs. | The future is only amazing if it reaches everyone. This is the question he's working on now. | BharatEdge-Eval (paper in preparation, never called published); bloomScroll (on-device). | Hope |
| 8 | **Your year** | A blank punch card with the next year on the ruler. "The next one's a collaboration." Email, LinkedIn, GitHub, résumé. | Hovering a link punches a hole in the card. | The future is something we build together. | Delhi, open to relocating, immediate joiner. | Invitation |

### 3. Visual language
- **Theme:** single designed theme, light (paper is the literal material: rag paper, manila card stock, engineering vellum). A dark theme exists for accessibility and preference, as "the same drawings under lamplight" (see tokens), but it isn't art-directed scene by scene.
- **Type:** **IBM Plex Serif** (display, 400 and 600, set large and tight) + **IBM Plex Sans** (body 18/30) + **IBM Plex Mono** used only for years on the ruler and the numerals punched on cards. The choice is the story: Hollerith's Tabulating Machine Company became IBM in 1924, so the page's type comes from the descendant of the 1890 machine in scene 4. All three are on Google Fonts. No eyebrows: the year on the ruler does that job.
- **Palette: the era drift.** Base tokens stay the same, and one variable, `--era` (0 → 1), mixes the accent in with `color-mix()` as you scroll. This evolves "warm paper + teal": teal is now *the colour of the present*, and it grows.

| Token | Light | Dark | Role |
|---|---|---|---|
| `--paper` | `#F3EFE4` (rag) | `#121315` | page |
| `--card-stock` | `#E9DDBE` (manila) | `#1C1B17` | punched cards, scene 4 |
| `--ink` | `#1B1A17` (iron-gall black) | `#EDEAE2` | text |
| `--ink-2` | `#55524A` | `#A9A59B` | secondary text, ≥ 4.5:1 |
| `--sepia` | `#8A5A2B` | `#C79A6B` | 1843–1950 accent, graphics only |
| `--teal` | `#0F8B8D` | `#3CC4C6` | the present, graphics only |
| `--teal-ink` | `#0A6466` | `#7FDCDD` | links and teal text |
| `--accent` | `color-mix(in oklab, var(--sepia), var(--teal) calc(var(--era)*100%))` | same | the drifting accent |

- **Texture:** real, not noise. Faint laid-paper lines on the 1843 scene, a card-stock fibre (one 8 KB tiled PNG) on scene 4, and engineering-vellum grid lines from scene 5 onwards. Every texture belongs to an era.
- **Grid:** a 12-column grid with a fixed **ruler gutter** (72 px) on the left on desktop. Each rhyme scene uses a different split: 2 is figure-left, 3 is a full-bleed memo, 4 is centred and pinned, 5 is a horizontal pinned run, 6 is a figure card, 7 is a single phone in empty space. No two adjacent scenes share a layout.
- **Signature element: the rhyme morph.** One iso drawing (built with the anatomy kit) that is two machines at once: the 1890 sorter's pockets become Value Imprint's value buckets, and the envelope becomes the cargo slip. Part counts match on both sides, so the morph is a tween of shared parts, not a crossfade. Second signature: the **accelerating ruler**, which nobody else has because it only makes sense for this story.

### 4. Motion language
- **Scroll drives:** the ruler, the `--era` colour drift, each rhyme morph (scrubbed, so the visitor controls history), card drops in scene 4, the packet's position in scene 5, the bit-depth slider in scene 7.
- **Time-based:** ink-in of the Lovelace line (1.2 s, once), the retry loop in scene 5, the bench's idle tour, link hover punches.
- **Easing and durations:** `--ease-press: cubic-bezier(.2,.8,.2,1)` for things that land (cards, packets), `--ease-ink: cubic-bezier(.4,0,.2,1)` for ink and colour. Durations: 160 ms (hover, press), 320 ms (UI change), 700 ms (in-scene event), 1200 ms (once-per-page ink-in). Scrubbed tweens are linear in scroll *progress*, with Lenis (`lerp 0.1`) supplying the feel.
- **Between scenes:** no fade-ups. The ruler's year rolls over, the paper texture changes along a torn edge (scene 3 → 4: rag to manila), and the next scene's figure is already half-drawn at the bottom of the viewport.
- **Into project pages:** the scene's figure is the shared element. Clicking "How it's built" fires a View Transition (`document.startViewTransition` around the router push), and the figure grows into the project page's header, where it explodes into layers.
- **Reduced motion:** no Lenis, no pinning, no scrub. Each rhyme is shown as a static before/after pair with both years. The ruler is a plain list of years in the margin. Figures are at rest. Everything readable without JS.
- **Phone (390 px):** not a shrunk desktop. The ruler becomes a **top year strip** (sticky, 32 px) that flips like an odometer. Rhymes become a **thumb toggle** (`1989 | 2021`) that plays the morph on tap instead of a scrubbed side-by-side, so you don't need 3 screens of scroll per scene. Scene 5's horizontal run becomes a vertical line that the packet falls down. Pinning is limited to scene 4 (one 150 vh pin).

### 5. Project page template: "Field report"
URL: `/work/<slug>`. Pages: CONCOR digit reader, Let's Dunch recommender, Value Imprint, BulkMagic activation agent, BulkMagic guardrails (could merge with the agent), DecentralMem.AI, BharatEdge-Eval, bloomScroll, Conductor. NoteNinja stays as a short entry on an archive page.

1. **Header:** the scene's figure (continuous with the home page), the year on a mini ruler, one-sentence problem in plain words, role, dates, team size.
2. **The ancestor** (a narrow margin column, 3–4 sentences): what the historical rhyme was and what changed since. This is the conceit carried into each page.
3. **Exploded architecture:** the anatomy figure explodes vertically into its layers on scroll (for DecentralMem: MCP interface → namespaces → Redis → Qdrant → Postgres, plus the FastAPI embedder at the side). Each layer gets its job in one line, and clicking a layer shows the data that crosses it. It's keyboard-operable (each layer is a button), with a plain list as a fallback.
4. **Forks in the road** (decisions and trade-offs): each one is drawn as a fork in a line, with the path taken solid and the one not taken dotted, and why. E.g. bloomScroll: rules → embeddings → local LLM cascade *instead of* an LLM call per title (cost, privacy, latency).
5. **What broke / what I learned:** in Rohan's voice, 3 short points. **Needs Rohan's input**; nothing is invented.
6. **Outcome:** only stated numbers (+30%, −40%, days → minutes, 6,501, NeurIPS 2024). Where there's no number, status in plain words ("Phase 0 spike, no live run yet").
7. **Next / previous** along the ruler: the footer is a mini ruler, and the next project is the next year.

*Transition:* figure-to-header shared element (View Transition), with a 420 ms `--ease-press`. Back to home restores the scroll position and replays the reverse transition. Under reduced motion, a plain navigation.

### 6. Interaction moments
1. **Scrub history** (scene 2/4): dragging the scrollbar or thumb toggle morphs 1890 into 2024. The visitor feels the continuity themselves. Purpose: proves the claim instead of asserting it.
2. **Shrink the model** (scene 7): a bit-depth slider (16 → 3 bits) on the phone figure. The answers shown are a *schematic illustration*, labelled as such, because BharatEdge has no results yet; the slider teaches what quantization is. Purpose: explains his live research question in 5 seconds.
3. **Punch your year** (scene 8): hovering or focusing a contact link punches a hole in the blank card for the next year. Purpose: confirms the action and pays off the card motif.

### 7. Risks
- **Gimmick:** history could crowd Rohan out. Mitigation: every scene's headline is about Rohan; history is a 1–2 line margin note plus the drawing. History is ≤ 25% of the words.
- **Fact risk:** history claims must be exact. Every one gets a source in the build plan; Lovelace's line is quoted from Note G (verify wording).
- **Performance:** 4–5 iso figures. Mitigation: SVG only, each figure lazily hydrated when it's near the viewport; one GSAP + ScrollTrigger + Lenis bundle (~45 KB gz); no WebGL; LCP is the Lovelace text.
- **Accessibility:** scroll-jacking is the main danger. Lenis with native scroll (no hijacked wheel step), pins ≤ 1.5 screens, every morph has a text equivalent, the rhymes are real headings and the ruler is `aria-hidden` with the years in the headings.
- **Build effort: L**, about 9–12 agent days (5 figures incl. 2 morphing ones, the ruler, 6–9 project pages).

---

## Concept 2: "The trace": your request, through a dependable AI system

### 1. The conceit
**The whole site is a single request travelling through a production AI system, drawn as a live trace; each span on the trace is a part Rohan built, so you watch his career turn an intent into a shipped result.**

*Why it embodies the message:* it shows AI making progress *with* the engineering around it: retrieval, tools, guardrails, a human in the loop. The visitor picks the request, and the system routes it (a precomputed router, which is itself a small demo of Conductor). At the end it returns a real artifact.

### 2. Narrative arc (7 scenes)
| # | Scene | What you see / what moves | Means | Rohan fact | Beat |
|---|---|---|---|---|---|
| 0 | **Intent** | A single input line on paper: "What should this system do?" with 3 preset requests ("List my product", "Who should I meet?", "Is this fair to Hindi speakers?") and a free-text one. | Every AI system starts with a person wanting something. | Name, role. | Curiosity |
| 1 | **Embed** | The request breaks into tokens, which float into a 2D map of meaning. | Machines turn words into geometry. | — | Curiosity |
| 2 | **Recall** | The trace pulls a span from a memory cabinet: Postgres, Qdrant, Redis drawers open. | Memory makes models useful across time. | DecentralMem.AI. | Reveal |
| 3 | **Plan and act** | The trace forks into a task graph. Specialist spans run in parallel; one fails and retries. | Agents with checks do the work. | Conductor; BulkMagic agents, days → minutes. | Tension |
| 4 | **Check** | A guardrail gate: schema, eval set; one output is caught. Then a "values" probe. | Dependability and values. | BulkMagic guardrails; Value Imprint, NeurIPS 2024. | Tension → relief |
| 5 | **Human in the loop** | The least-sure 15% goes to a person. | AI + people beats either alone. | CONCOR active learning; Let's Dunch feedback loop. | Warmth |
| 6 | **Ship** | The trace closes; a total time; the shipped result is Rohan's contact card. | The future arrives as a shipped thing. | Contact. | Payoff / invitation |

### 3. Visual language
- **Type:** **Instrument Sans** (UI) + **Newsreader** (display, optical sizes) + **JetBrains Mono** for span labels only, where mono *is* the data.
- **Palette:** "trace paper": `--paper #F2F1EC`, `--ink #17191B`, `--ink-2 #4E5359`, `--teal #0F8B8D` (spans that succeed), `--amber #B7791F` (retry, graphics only), `--teal-ink #0A6466`. Dark: `#101214` / `#E9EBEC` / `#3CC4C6` / `#E0A23C`. Dark theme fits observability tools, so both are first-class.
- **Texture:** a millimetre grid like oscilloscope or graph paper, at 4% ink.
- **Grid:** the trace waterfall *is* the grid: time runs down the page, span bars run across.
- **Signature:** the visitor's own request rides the whole page as a sticky chip, and every scene transforms it. The trace's total duration is shown at the end.

### 4. Motion language
- Scroll drives the trace's time cursor; spans grow as the cursor passes. Time-based: retries, token drift. Easing: `cubic-bezier(.3,.7,.2,1)`, 240 / 480 / 900 ms.
- Into project pages: a span bar expands to fill the screen (View Transition) and becomes the page's own sub-trace.
- Reduced motion: the full trace drawn statically, as a table with the same rows.
- Phone: the waterfall rotates: time runs down and spans become stacked rows. The request chip docks at the bottom like a keyboard bar.

### 5. Project page template
A **sub-trace**: the project's architecture as a span waterfall of one real request through it (e.g. bloomScroll: one title → rules → MiniLM → local LLM). Each span opens to its decision (taken / not taken) and the trade-off. Then "what I learned" and outcomes. Transition: span → full-screen.

### 6. Interaction moments
1. Pick or type a request and watch the route change (the different presets light different spans and projects).
2. Force a failure: a "break it" toggle injects a malformed output and shows the guardrail catch it.
3. Hover any span to see its latency budget and the project it belongs to.

### 7. Risks
- **Gimmick:** free text could imply a live LLM that isn't there. Label it "simulated route"; no API calls on a static site.
- **Story:** the arc is a pipeline, not a life. Career order is lost; the "amazing future" message is implicit.
- **Performance:** light (SVG bars).
- **Accessibility:** a trace is a table, which is easy to make accessible.
- **Effort: M**, about 6–8 agent days.

---

## Concept 3: "The workshop at first light"

### 1. The conceit
**The isometric bench grows into a whole workshop as you scroll, and the light rises from pre-dawn to full morning: each station is a project you can step into, and the workshop being fully lit is the future.**

*Why it embodies the message:* each station lights up as it's built; the dawn is literal progress. It reuses the anatomy look Rohan already likes.

### 2. Narrative arc (7 scenes)
| # | Scene | Sees / moves | Rohan fact | Beat |
|---|---|---|---|---|
| 0 | **Before dawn** | One lamp on the bench; the rest of the room is dark outlines. | Name, role. | Curiosity |
| 1 | **The phone station** | A digit-reading rig with a phone in a clamp; the lamp swings over. | CONCOR. | Recognition |
| 2 | **The matchmaking board** | A corkboard with strings between cards. | Let's Dunch. | Warmth |
| 3 | **The card sorter** | The sorter in a corner, pockets filling unevenly. | Value Imprint. | Tension |
| 4 | **The production line** | The document line, retries. Sun hits the windows. | BulkMagic. | Payoff |
| 5 | **The bench** | v1's model bench, the visitor swaps the models. | DecentralMem, Conductor. | Delight |
| 6 | **Open stool** | Full morning. An empty stool at the bench. | Contact. | Invitation |

### 3. Visual language
- **Type:** **Bricolage Grotesque** display + **Source Serif 4** body.
- **Palette:** the light ramp: `--night #1A1E24` → `--dawn #E9C9A8` → `--paper #F4F2EC`, with teal as the colour of lamps and running machines.
- **Signature:** the time-of-day lighting over one continuous iso world (WebGL lamp light from the anatomy skill).

### 4–5. Motion and project pages
- One continuous camera pan across an iso world, driven by scroll. Each station is a project page; entering one zooms the camera into that station and explodes it.
- Reduced motion: stations shown as separate still figures, fully lit.
- Phone: one station per screen, swiped, not panned.

### 6. Interaction moments
Flip the lamp switch at each station; pick up a tool to see its spec; sit on the stool (contact).

### 7. Risks
- **Gimmick:** a pretty room that says "I build things", not "AI leads somewhere good". The message is weakest here.
- **Performance:** one huge iso world (500+ parts) plus WebGL light; this is the heaviest option.
- **Accessibility:** a camera pan is hard to make readable; the text must live outside the world.
- **Effort: L+**, about 12–15 agent days.

---

## Recommendation: Concept 1, "Rhymes"

**Why:**
1. **It's the only concept that embodies the message.** "AI leads to an amazing future" needs *time* to be visible, and Rhymes is made of time: the accelerating ruler, the colour drift and the blank last year are the argument.
2. **His career is load-bearing.** Every scene is one of his jobs or projects, placed at the moment in history it continues. The rhymes are true (LeNet ↔ CONCOR digits, collaborative filtering ↔ Let's Dunch, Hollerith ↔ Value Imprint, tool use ↔ BulkMagic agents, MCP ↔ DecentralMem).
3. **It shows HCI thinking** (Purdue M.S.), not just engineering: the human in the loop, the values audit and the Hindi users are the through-line.
4. **It keeps what works:** paper and teal (now with a reason), the anatomy kit, and the model bench (scene 6).
5. **The project pages have a natural form:** the ancestor note plus the exploded figure plus forks in the road.

Borrow from Concept 2: the "forks in the road" decision diagram and the sub-trace for one request on the bloomScroll and BulkMagic pages.

### Design directive (5 steps)
1. **Style:** Editorial, evolved into "technical history book": an engineering plate in a history book, not a broadsheet.
2. **Emotional brief:** It opens quiet and a little doubtful (1843), and builds momentum as the ruler speeds up. It ends warm and open, with the visitor invited into the next year.
3. **Fonts:** IBM Plex Serif (display) / IBM Plex Sans (body) / IBM Plex Mono (years and card numerals only).
4. **Colour:** dominant `--paper`, secondary `--ink`, sharp `--accent` drifting from `--sepia` to `--teal` with `--era`.
5. **Motion principle:** *Time moves down the page; nothing moves unless history or the visitor moves it.*

### Storyboard

Legend: `|` on the left of desktop frames is the year ruler. `[fig]` is an anatomy iso figure. Phone frames are 390 px wide.

#### Scene 0: 1843, the objection (curiosity)
Lovelace's sentence inks in. One hole punches through. Rohan's name sits underneath, small and confident. No buttons above the fold except a quiet "Start in 1843 ↓".

```
DESKTOP                                                    
+----------------------------------------------------------------+
| 1843 |                                                         |
|  ·   |   "It can do whatever we know                           |
|  ·   |    how to order it to perform."                         |
|  ·   |                         Ada Lovelace, Note G, 1843      |
|      |                                                         |
|      |   (o)  <- a single punched hole                         |
|      |                                                         |
|      |   Rohan Pant builds AI that does more than it's told,   |
|      |   and the checks that keep it honest.                   |
|      |   Full-stack + AI engineer · Purdue M.S. HCI            |
|      |                                                         |
|      |   Start in 1843 ↓                       Résumé  Contact |
+----------------------------------------------------------------+
```
```
PHONE
+----------------------+
| 1843 ▸▸▸▸        ≡   |  <- sticky year strip
|                      |
| "It can do           |
|  whatever we know    |
|  how to order it to  |
|  perform."           |
|   Ada Lovelace, 1843 |
|                      |
|  (o)                 |
|                      |
| Rohan Pant builds AI |
| that does more than  |
| it's told, and the   |
| checks that keep it  |
| honest.              |
|                      |
| Start in 1843 ↓      |
+----------------------+
```
(H1 wording is a draft; Rohan picks the final line.)

#### Scene 1: The ruler (momentum)
The ruler unrolls; ticks get denser. Four faint labels mark the eras ahead, so the visitor knows the shape of the page (a progress map: the goal-gradient effect).

```
DESKTOP
+----------------------------------------------------------------+
| 1843 -|                                                        |
|       |      180 years of machines learning to help.            |
| 1890 -|      Five of them rhyme with my work.                   |
|       |                                                        |
| 1950 -|      1989 reading handwriting ......... 2021           |
| 1989 -|      1992 collaborative ............... 2021           |
| 2017 =|      1890 counting what we're made of .. 2024          |
| 2022 ≡|      2023 machines that act ............ now           |
| 2026 ≣|      next: for everyone ................ now           |
+----------------------------------------------------------------+
```
```
PHONE
+----------------------+
| 1843 ▸▸▸▸▸▸▸▸▸   ≡   |
| 180 years of         |
| machines learning to |
| help. Five rhyme     |
| with my work.        |
|                      |
| 1989 ↔ 2021  digits  |
| 1992 ↔ 2021  people  |
| 1890 ↔ 2024  values  |
| 2023 ↔ now   agents  |
| next ↔ now   everyone|
+----------------------+
```
Each row is a link that jumps to its scene.

#### Scene 2: 1989 ↔ 2021, reading handwriting (recognition)
```
DESKTOP  (scroll scrubs left state -> right state, ~1.5 screens)
+----------------------------------------------------------------+
| 1989 |  [fig: envelope 4 7 9 0 6]   ===>   [fig: CONCOR slip   |
|  ↓   |   digits lift into a small            in a phone clamp, |
| 2021 |   iso network]                        network folded    |
|      |                                        into the phone]   |
|      |                                                         |
|      |  1989: a network reads ZIP codes      2021: I put one on |
|      |  for the US Postal Service.           a phone, offline,  |
|      |                                       for Container Corp |
|      |                                       of India. The 15%  |
|      |      ? ? ?  ---> [person] ---> ✓      it was least sure  |
|      |                                       of went to a       |
|      |                                       person.            |
|      |                                       How it's built →   |
+----------------------------------------------------------------+
```
```
PHONE
+----------------------+
| 2021 ◂ 1989      ≡   |
| [ 1989 | 2021 ] tap  |
| +------------------+ |
| | [fig: phone with | |
| |  slip, digits]   | |
| +------------------+ |
| Reading handwriting  |
| 1989: ZIP codes for  |
| the USPS. 2021: I put|
| it on a phone,       |
| offline. The least-  |
| sure 15% went to a   |
| person.              |
| How it's built →     |
+----------------------+
```

#### Scene 3: 1992 ↔ 2021, "collaborative" (warmth)
Full-bleed memo layout, different from scene 2.
```
DESKTOP
+----------------------------------------------------------------+
| 1992 |  ┌───────────────────────────────────────────────────┐  |
|      |  │ MEMO  Xerox PARC, 1992                            │  |
|      |  │ "collaborative filtering"                         │  |
|      |  └───────────────────────────────────────────────────┘  |
| 2021 |      o───o        o           The field named itself    |
|      |       \  │ \     /            after working together.   |
|      |        o─o──o───o             At Let's Dunch I built    |
|      |            (lines draw on     "Who to Meet": it learned |
|      |             scroll)           from who people actually  |
|      |                               met. I led 3 people       |
|      |                 +30%          through the booking       |
|      |              registrations    redesign.                 |
+----------------------------------------------------------------+
```
```
PHONE
+----------------------+
| 2021 ◂ 1992      ≡   |
| ┌──────────────────┐ |
| │ "collaborative   │ |
| │  filtering" 1992 │ |
| └──────────────────┘ |
|   o──o   o           |
|    \ │ / │           |
|     o──o─o           |
| +30% registrations   |
| Let's Dunch: a       |
| recommender that     |
| learned from who     |
| people met.          |
+----------------------+
```

#### Scene 4: 1890 ↔ 2024, what are they taught? (tension)
Pinned, centred. Paper changes to manila along a torn edge. This is the signature morph.
```
DESKTOP  (pinned ~1.5 screens)
+----------------------------------------------------------------+
| 1890 |            [fig: Hollerith-style sorter]                |
|      |        cards ▮▮▮ ──> reading head ──> pockets           |
|      |                                                         |
|      |    | ▮ | ▮▮ | ▮▮▮▮▮▮▮ | ▮ | ▮▮ |   <- pockets fill       |
| 2024 |    values ......... info-utility ......... prosocial    |
|      |                                                         |
|      |  1890: count what a country is made of.                 |
|      |  2024: count what a model is taught.                    |
|      |  Value Imprint audited 6,501 RLHF annotations           |
|      |  (hh-rlhf, WebGPT, Alpaca GPT-4) and found a lean       |
|      |  toward information-utility over prosocial values.      |
|      |  Purdue M.S. HCI · NeurIPS 2024        How it's built → |
+----------------------------------------------------------------+
```
Pocket heights are illustrative unless Rohan supplies the paper's counts; the caption says so.
```
PHONE  (the one pinned scene, 150 vh)
+----------------------+
| 2024 ◂ 1890      ≡   |
| [fig: sorter, front  |
|  view, 5 pockets]    |
| ▮ ▮▮ ▮▮▮▮▮▮ ▮ ▮▮     |
| What are models      |
| taught?              |
| 6,501 annotations    |
| audited. NeurIPS '24 |
| How it's built →     |
+----------------------+
```

#### Scene 5: 2023 ↔ now, machines that act (payoff)
Horizontal pinned run on desktop; vellum grid appears; teal is now strong.
```
DESKTOP  (pinned, packet moves left->right with scroll)
+----------------------------------------------------------------+
| 2023 |  [▤]──> KYC ──> TAX ──> LEGAL ──> [activated]           |
|      |              ↑      │ fail                              |
|  now |              └─retry┘                                   |
|      |                                                         |
|      |  days → minutes     −40%            −30%                |
|      |  seller activation  listing time    time-to-market      |
|      |                                                         |
|      |  At BulkMagic, agents call tools to check documents.    |
|      |  Schema checks, retries, fallbacks and an eval set      |
|      |  keep them dependable.                 How it's built → |
+----------------------------------------------------------------+
```
The three metrics sit in a row of unequal widths, set as type with no cards.
```
PHONE  (no pin: line runs downward, packet falls as you scroll)
+----------------------+
| now ◂ 2023       ≡   |
| [▤]                  |
|  │ KYC   ✓           |
|  │ TAX   ✗ → retry ✓ |
|  │ LEGAL ✓           |
|  ▼ activated         |
| days → minutes       |
| −40% listing time    |
| −30% time-to-market  |
| How it's built →     |
+----------------------+
```

#### Scene 6: 2024 ↔ now, memory that travels (delight)
The v1 model bench, reused.
```
DESKTOP
+----------------------------------------------------------------+
| 2024 |  ┌──────────────────────────────────────┐  Models change |
|      |  │ [fig: model bench: 4 cartridges,     │  every few     |
|  now |  │  one memory cabinet, eval gauge]     │  months. The   |
|      |  │  Claude  GPT-4o  Gemini  Local       │  memory stays. |
|      |  └──────────────────────────────────────┘  DecentralMem  |
|      |   ← → pick a model · Space to run           serves one   |
|      |                                             memory to    |
|      |   Also on the bench: Conductor              all of them  |
|      |   (goal → task graph → pull request)        over MCP.    |
+----------------------------------------------------------------+
```
```
PHONE
+----------------------+
| now ◂ 2024       ≡   |
| [fig: bench, 116%    |
|  crop, tap a model]  |
| Claude GPT-4o Gemini |
| Models change. The   |
| memory stays.        |
| DecentralMem →       |
| Conductor →          |
+----------------------+
```

#### Scene 7: Next, for everyone (hope)
The ruler runs past 2026 into blank paper. Empty space is the point.
```
DESKTOP
+----------------------------------------------------------------+
| 2026 |                                                         |
|  ┆   |            [fig: budget phone]                          |
|  ┆   |            ┌─────────────┐                              |
| next |            │ EN: ▇▇▇▇▇▇  │   bits  16 ──●── 8 ── 4 ── 3  |
|      |            │ HI: ▇▇▇░░░  │   (illustration, not results) |
|      |            └─────────────┘                              |
|      |  A future that's amazing for everyone has to fit on     |
|      |  a budget phone and speak Hindi. BharatEdge-Eval        |
|      |  measures what shrinking a model                        |
|      |  costs those users. Paper in preparation.               |
|      |  bloomScroll runs its model on your own computer.       |
+----------------------------------------------------------------+
```
```
PHONE
+----------------------+
| next ◂ 2026      ≡   |
| [fig: phone]         |
| EN ▇▇▇▇▇▇            |
| HI ▇▇▇░░░            |
| bits [16|8|4|3]      |
| For everyone means   |
| on a budget phone,   |
| in Hindi.            |
| BharatEdge-Eval →    |
| bloomScroll →        |
+----------------------+
```

#### Scene 8: Your year (invitation)
```
DESKTOP
+----------------------------------------------------------------+
| 2027 |   ┌──────────────────────────────────────────────┐      |
|  ?   |   │ 2027  ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○     │      |
|      |   │ (blank card; links punch holes on hover)     │      |
|      |   └──────────────────────────────────────────────┘      |
|      |   The next one's a collaboration.                       |
|      |                                                         |
|      |   rohanpant.work@gmail.com                              |
|      |   LinkedIn        GitHub        Résumé (PDF)            |
|      |   Delhi, open to relocating, can start now.             |
+----------------------------------------------------------------+
```
```
PHONE
+----------------------+
| 2027             ≡   |
| ┌──────────────────┐ |
| │ 2027 ○○○○○○○○○○  │ |
| └──────────────────┘ |
| The next one's a     |
| collaboration.       |
| [ Email me        ]  |
| [ LinkedIn        ]  |
| [ GitHub          ]  |
| [ Résumé (PDF)    ]  |
| Delhi · relocating   |
+----------------------+
```
Phone contact rows are 56 px tall (Fitts's law: full-width thumb targets).

### Project page storyboard (template)
```
DESKTOP  /work/decentralmem
+----------------------------------------------------------------+
| ← 2024 on the ruler                    prev 2023 · next 2026   |
|                                                                |
|  DecentralMem.AI                       [fig grows in from home]|
|  One memory for every model.                                   |
|  Personal project · 2024–now · solo                            |
|----------------------------------------------------------------|
| ancestor │  THE PROBLEM                                        |
| 2024: MCP│  Each model forgets you when you switch...          |
| gives    │                                                     |
| models a │  ARCHITECTURE (explodes on scroll)                  |
| standard │     ┌ MCP interface ─────────┐  <- click a layer    |
| way to   │     ├ namespaces ────────────┤     to see what      |
| reach    │     ├ Redis cache ───────────┤     crosses it       |
| context. │     ├ Qdrant vectors ────────┤ ── FastAPI embedder  |
|          │     └ PostgreSQL (truth) ────┘                      |
|          │  FORKS IN THE ROAD                                  |
|          │    ●── Postgres as truth (taken)                    |
|          │    ┆·· vector DB only (not taken): why             |
|          │  WHAT I LEARNED   (Rohan writes these)              |
|          │  OUTCOME          (only stated facts)               |
+----------------------------------------------------------------+
```
```
PHONE
+----------------------+
| ← 2024     prev next |
| DecentralMem.AI      |
| [fig]                |
| The problem          |
| ...                  |
| Architecture         |
| [MCP           ▸]    |
| [namespaces    ▸]    |
| [Redis         ▸]    |
| [Qdrant        ▸]    |
| [PostgreSQL    ▸]    |
| Forks in the road    |
| What I learned       |
| Outcome              |
| ancestor (at end)    |
+----------------------+
```
On phone the ancestor note moves to the end, and the layers become an accordion of buttons (the exploded figure stays above, static).

### UX laws this design follows (for the review)
- **Goal-gradient / progress:** the ruler and scene 1's map show where you are and how much is left.
- **Peak-end rule:** the peak is scene 4/5 (tension resolved by his production work); the end is a warm invitation, not a footer.
- **Jakob's law:** the content is still a normal scrolling page with real headings, links that look like links, and the back button working.
- **Fitts's law:** 56 px full-width contact rows on phone; the rhyme toggle sits in the thumb zone.
- **Hick's law:** one primary action per scene ("How it's built →").
- **Doherty threshold:** all interactions respond under 100 ms; morph scrubbing is tied to scroll.
- **Von Restorff:** the one pinned scene (4) and the one horizontal run (5) are the only exceptions in rhythm, so they stand out.

### Slop check (against the brief's list)
No gradient blobs, glassmorphism, emoji, "Hi, I'm X", three-column feature grids, stock tech icons, purple-blue gradients or particle fields. The only "particles" are punched cards and tokens that are the data itself. No two adjacent scenes share a layout. Mono appears only where it's historically literal (years, card numerals). No eyebrows above headings: the ruler carries the year.

### Open questions for Rohan
1. The H1 (scene 0) wording.
2. Value Imprint's per-category counts (to make scene 4's pockets true instead of illustrative), plus the paper link.
3. "What I learned" for each project page: 3 points each, in his words.
4. Whether BulkMagic internals can be shown at architecture level (confidentiality).
5. DecentralMem.AI repo link and start year.

### Fact checks before building (each needs one source in the build plan)
Lovelace Note G wording (1843); Hollerith tabulator and the 1890 US census; Tabulating Machine Company → IBM (1924); LeCun et al. 1989, handwritten ZIP codes for the USPS; "collaborative filtering" coined with Tapestry at Xerox PARC (1992); Transformer (2017); RLHF (Christiano et al. 2017; InstructGPT 2022); ReAct (2022) and Toolformer (2023); MCP announced Nov 2024.

### Build effort
**L: about 9–12 agent days.** Order: tokens and type → ruler and `--era` drift → scenes 0, 1, 3, 8 (type-led, cheap) → scene 6 (reuse the bench) → scenes 2, 4, 5 figures (anatomy kit, about 60–110 parts each) → scene 7 → project page template → 6–9 project pages → reduced-motion and phone passes → Playwright checks at 1440, 1024 and 390.
