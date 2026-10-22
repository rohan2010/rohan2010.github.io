# v2 "Rhymes": phase-1 contracts

Written by the phase-0 foundation (2026-10-22). Read this, `MASTER.md` (binding), `concepts.md` and `craft-bar.md` before starting.

Each phase-1 agent works in its **own git worktree and branch**, owns **only the paths listed for it**, and imports the shared APIs below without changing them. If a shared API is missing something you need, **stop and ask the lead**. Don't work around it by editing a lead-owned file.

---

## 0. Ownership

### Lead-owned (nobody else edits these)

| Path | What it is |
|---|---|
| `next.config.ts`, `package.json`, `package-lock.json`, `eslint.config.mjs`, `tsconfig.json` | config and deps (no new dependencies without the lead) |
| `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`, `src/app/og.png/`, `src/app/apple-icon.png/`, `src/app/icon.svg` | root layout, home page composition, metadata, share card |
| `src/styles/` | tokens, base type, scene layouts, figure plate, view transitions |
| `src/lib/motion/` | GSAP/Lenis provider and hooks |
| `src/lib/transitions.tsx` | `<PageTransition>`, `<SharedElement>`, `FORWARD`, `BACK` |
| `src/components/ruler/` | ruler, odometer, `--era` driver |
| `src/components/scene/` | `<Scene>`, `<SceneSlot>`, `<SceneHeading>` |
| `src/components/site/` | header, nav, footer (with the sources list) |
| `src/components/iso/` | the anatomy kit (vendored, unchanged) |
| `src/content/schema.ts`, `src/content/scenes.ts`, `src/content/sources.ts`, `src/content/site.ts` | the content contract, the scene registry, history sources, site facts |
| `src/scenes/_example/`, `src/figures/_example/` | reference patterns: copy them, don't edit them |
| `src/components/figures/bench/` | v1 bench, read-only. 1C may **import** it; changes (for example the `seekRef` scrub in `tech-motion.md` §8) go through the lead |
| `plans/` | plans |

**Facts and sources.** To add a history fact, send the lead `{claim, source, url}` and they'll add it to `sources.ts` after checking it. Never cite history that isn't in `sources.ts`.

### Phase-1 workstreams (MASTER §6)

| WS | Owns (and only these) | Entry point the home page renders |
|---|---|---|
| **1A**: scenes 0–3 | `src/scenes/s0-s3/`, `src/figures/envelope-phone/`, `src/figures/memo-grid/` | `export function Scenes0to3()` in `src/scenes/s0-s3/index.tsx` |
| **1B**: scenes 4–5 | `src/scenes/s4-s5/`, `src/figures/sorter/`, `src/figures/docline/` | `export function Scenes4to5()` in `src/scenes/s4-s5/index.tsx` |
| **1C**: scenes 6–8 | `src/scenes/s6-s8/`, `src/figures/phone-quant/` (bench imported from `src/components/figures/bench/`) | `export function Scenes6to8()` in `src/scenes/s6-s8/index.tsx` |
| **1D**: project pages | `src/app/work/` (including `_components/`), `src/content/work/*.ts`, `src/figures/explode/` | routes `/work/` and `/work/[slug]/` |

- Keep the entry-point export names. The placeholder scenes in your folder are yours to rewrite or delete.
- **1B:** the `taught` placeholder imports the example figure. Replace it with the sorter, and keep the `_example` folder.
- **1D:** a new full page needs its slug in the `WorkSlug` union in `schema.ts`, which is lead-owned. Ask the lead to add it. Five slugs are already there: `bloomscroll`, `conductor`, `decentralmem`, `value-imprint`, `bharat-edge`.
- **Scenes linking to work pages:** link with a trailing slash: `/work/<slug>/`.
- **CSS:** each scene folder ships one CSS file, imported by its `index.tsx`. Scope every rule to its scene id (`#taught …`) or to a class prefix you own (`.sorter-…`). Don't style `:root`, `body`, `.scene` or `[data-layout]` globally.

---

## 1. Design tokens (`src/styles/tokens.css`)

Use the tokens as CSS variables. Tailwind utilities also map to them: `bg-paper`, `text-ink`, `text-ink-2`, `text-accent-ink`, `bg-card-stock`, `font-serif`, `font-sans`, `font-mono`.

| Token | Light / Dark | Use for |
|---|---|---|
| `--paper` | `#F3EFE4` / `#121315` | page |
| `--card-stock` | `#E9DDBE` / `#1C1B17` | punched cards, manila (scene 4), the scene-3 memo |
| `--ink`, `--ink-2` | text, secondary text (≥ 4.5:1) | |
| `--sepia`, `--teal` | graphics only | |
| `--teal-ink` | teal text and links | |
| `--accent` | `color-mix(sepia → teal by --era)` | graphics and focus rings |
| `--accent-ink` | same drift, text-safe | accent text |
| `--rule` | hairlines | |
| `--vellum` | engineering vellum (scene 5 on) | |
| `--era` | 0 → 1, a registered `<number>` | **read it, never set it** (see §3) |

- **Type roles** (classes in `base.css`; ≤ 6 sizes on the home page):

  | Class | Font and size | Use |
  |---|---|---|
  | `.t-display` | Plex Serif 52–128 px | scene 0's line and the peak **only** |
  | `.t-h1` | 40–76 | |
  | `.t-h2` | 30–44 | |
  | `.t-h3` | 24/32 | |
  | `.t-body` | Plex Sans 18/30 | the default |
  | `.t-caption` | 14/20, `--ink-2` | captions |

  - **`.t-year`** is Plex Mono. Use it for **years and card numerals only** (B2), and also add `data-mono` to the element.
  - **`.link`** is the one link style. **`.measure`** caps line length at 62ch, and **`.sr-only`** hides text visually.
- **Spacing:** `--space-1…8` = 4, 8, 16, 24, 40, 64, 96, 160.
- **Layout:** `--ruler-w` 72px, `--strip-h` 40px, `--gutter`, `--grid-gap`, `--grid-max` 1200px.
- **Motion:** `--ease-press` (things that land) and `--ease-ink` (ink and colour). Durations `--dur-press` 160ms, `--dur-ui` 320ms, `--dur-event` 700ms, `--dur-ink` 1200ms. Nothing over 800ms except the peak sequence (M3).
- **Breakpoints:** phone `≤ 767px`, desktop ruler `≥ 768px`, full 12-column layouts `≥ 1024px`.
- **Theme:** `<html data-theme>` and `<body data-theme>` follow the system, live. Light is the designed theme. Write a dark override as `:root[data-theme="dark"] #your-scene …` (lamplight, not art-directed).

---

## 2. The scene shell (`@/components/scene/Scene`, server components)

```tsx
import { Scene, SceneHeading, SceneSlot } from "@/components/scene/Scene";

<Scene id="handwriting" layout="split">          {/* id: SceneId; layout must match scenes.ts */}
  <SceneSlot slot="figure">…static figure…</SceneSlot>
  <SceneSlot slot="text">
    <SceneHeading id="handwriting">Reading handwriting</SceneHeading>   {/* h2 with "1989 ↔ 2021" inside */}
    <p>…</p>
  </SceneSlot>
</Scene>
```

### `<Scene>`

```
<Scene id: SceneId; layout?: SceneLayout; year?: number; yearTo?: number|null; beat?: Beat; className?: string>
```

- `year`, `yearTo`, `beat` and `layout` come from the registry. Pass them only to assert a value: a mismatch fails the build.
- It renders `<section id={id} class="scene" data-scene data-year data-year-to data-era data-layout data-beat aria-labelledby="{id}-title">`. The ruler reads those attributes, which is the scene's registration.

### `<SceneSlot>`

```
<SceneSlot slot: "text" | "figure" | "note" | "wide">
```

Each layout places the slots differently (`src/styles/scenes.css`). Slots stack in source order on phones.

### `<SceneHeading>`

```
<SceneHeading id level?: 1|2 size?: "display"|"h1"|"h2"|"h3" years?: boolean>
```

- It renders an `h2` (an `h1` with `level={1}`, scene 0 only), with the years in mono plus an sr-only spoken form.
- **The years must live in the headings**, because the ruler is `aria-hidden`.

### The registry: `src/content/scenes.ts`

| n | id | year → yearTo | layout | owner |
|---|---|---|---|---|
| 0 | `objection` | 1843 | `statement` | 1A |
| 1 | `ruler` | 1843 → 2026 | `map` | 1A |
| 2 | `handwriting` | 1989 → 2021 | `split` | 1A |
| 3 | `collaborative` | 1992 → 2021 | `sheet` | 1A |
| 4 | `taught` | 1890 → 2024 | `centered` (pinnable) | 1B |
| 5 | `act` | 2023 → now | `peak` (the only full-bleed, the largest type) | 1B |
| 6 | `memory` | 2024 → now | `card` | 1C |
| 7 | `everyone` | 2026 → next | `solo` | 1C |
| 8 | `your-year` | 2027 | `closing` | 1C |

Each scene also has `title`, `yearLabel`, `era` and `beat`. The build enforces that no two adjacent scenes share a layout, that `era` never falls, and that there is exactly one peak.

### Every scene must

1. Be a **server component** whose HTML alone tells the beat: a real heading, the copy, and a static figure or a before/after pair. This is the JS-off and reduced-motion form (A8, M1).
2. Keep motion in small `"use client"` leaves inside it.
3. Show the end state (or a meaningful still) on first paint. Don't hide content that only JS reveals (CLS, LCP).

---

## 3. Motion APIs (`@/lib/motion`, client components only)

```ts
import { gsap, ScrollTrigger, SplitText, useGSAP, MOTION, REDUCE, PHONE, DESKTOP,
         useScene, useScrub, useReducedMotion, scrollTo, getLenis } from "@/lib/motion";
```

- **Always import GSAP from `@/lib/motion`, never from `"gsap"`.** That's where the plugins are registered and the defaults set (`pinType: "transform"`, `ignoreMobileResize`). Never import it in a server component.
- **`useScene(): { id, year, yearTo, era, layout, ref, element() }`** returns the enclosing `<Scene>`.
  - Use `element()` inside effects and `useGSAP`.
  - `ref.current` is still `null` during a child's layout effects, because React attaches a parent's ref after its children's layout effects.
- **`useScrub(onProgress: (p: number) => void, options?)`** scrubs the scene, or `options.trigger`.

  | Option | Values | Default |
  |---|---|---|
  | `pin` | `false` \| `"desktop"` \| `"always"` | `false`. `"always"` is for scene 4 only, per concepts §4 |
  | `start` | ScrollTrigger start | `"top top"` when pinned, else `"top 80%"` |
  | `end` | ScrollTrigger end | `"+=150%"` when pinned (≤ 1.5 screens), else `"bottom 20%"` |
  | `phoneEnd` | end on phones when pinned | `"+=100%"` |
  | `scrub` | `true` or catch-up seconds | `true` |
  | `trigger` | `RefObject<HTMLElement>` | the scene's `<section>` |
  | `reducedProgress` | number | `1` |

  - `onProgress` runs every frame. **Write attributes or styles on refs; never `setState`.**
  - Under reduced motion there is no pin and no scrub: `onProgress(reducedProgress)` is called once, and again if the setting flips live.
  - Everything is reverted on unmount and route change.
- **`useReducedMotion(): boolean`** is live. It's `false` on the server and on the first client render.
- **`scrollTo(target: number | "#id" | HTMLElement, { offset?, immediate? })`** is the only allowed programmatic scroll (G4). `window.scrollTo` is pulled back by Lenis. Plain `#hash` links work as they are.
- **Time-based effects:** use `useGSAP(fn, { scope })` with `gsap.matchMedia()`. Build the motion under `MOTION`, and set the static end state under `REDUCE` (pattern: `src/scenes/_example/ExampleProgressBar.tsx`).
- **SplitText:** use `type: "words"` on phones. Set `aria-label` to the full sentence (SplitText does this). Revert it in cleanup.
- **The provider does these already (don't redo them):**
  - Lenis on GSAP's ticker
  - `ScrollTrigger.refresh()` after a route change and after fonts load
  - top-of-page or `#hash` on navigation, and restoring the scroll position on Back and Forward
- **Rules:**
  - No pin inside a pin, and no horizontal-scroll sections.
  - A pinned element must not contain `position: fixed` UI.
  - A pinned scene should fit in one viewport (`min-height: 100svh`, content inside), or its heading is cut off while it's pinned.
  - Don't set `--era`.

### The ruler and `--era` (`src/components/ruler/`, lead-owned)

- A reading line sits 40% down the viewport. Inside a scene, the ruler's year runs from `year` to `yearTo`, and `--era` runs from this scene's era to the next one's.
- `--era` is written on `<html>` (`html[data-era-live]`). Each scene also carries its own static `--scene-era` for JS-off.
- Read colour from `var(--accent)` / `var(--accent-ink)`. They drift by themselves.

---

## 4. Figures (anatomy kit)

Load the `anatomy` skill. The layout per figure follows the skill's `references/react.md`, as `src/figures/_example/` shows:

```
src/figures/<name>/
  view.ts       world constants + P = fitProjection(...)
  geometry.ts   every static path, computed once on the server
  model.ts      pure: progress → pose / readout text (no DOM)
  art.tsx       SERVER: static parts as keyed JSX constants → <XLive under={…} card={…}/>
  live.tsx      "use client": the ONE client component; refs + useScrub/useGSAP; writes attributes
  figure.tsx    SERVER: <Plate fig title hint readout={readoutOf(0)} keys caption><XArt/></Plate>
  <name>.css    scoped to the figure's class
```

### How a scrubbed figure reads progress (`src/figures/_example/live.tsx`)

```tsx
"use client";
const STEP = axisVector(P, [FEED, 0, 0]);
export function CardFeedLive({ under, card }) {
  const cardRef = React.useRef<SVGGElement>(null);
  const { anchor, say } = useReadout<SVGGElement>();
  useScrub((p) => {
    const f = feedAt(p);                                   // pure model
    cardRef.current?.setAttribute("transform", `translate(${STEP[0]*f} ${STEP[1]*f})`);
    say(readoutOf(p));                                     // only writes on change
  }, { pin: "desktop" });
  return <IsoFigure …><g ref={anchor}>{under}<g ref={cardRef}>{card}</g></g></IsoFigure>;
}
```

### Rules

- **Keys:** give every element prop's root a stable `key`. Don't put `"use client"` components inside server-built art (react.md trap).
- **Painter's order:** the live component places static parts and moving parts in painter's order.
- **Morphs:** a rhyme morph is a tween of **shared parts** with matching part counts, not a crossfade.
  - Export a pure `poseAt(progress)` and `draw(pose)`.
  - Scrub targets directly, with no springs: reverse scrubbing must equal forward scrubbing.
  - For a CSS-only detail, scrub one custom property (`--p`).
- **Server state:** render the rest or end pose on the server. Its readout text renders on the server too.
- **`aria-live`:** announce only when the phase changes, never every frame (A5).
- **Labels:** an illustrative figure says so in its caption (scene 4's pocket heights, scene 7's quantization demo).
- **Hydration:** hydrate lazily near the viewport, so figures below the fold don't block LCP.
- **Plate:** `.iso-plate` is the one card style on the home page (UX-CR1). Corner labels are `.iso-plate-corner`, and the readout is in mono because it's data.
- **Checks:** `node ~/.claude/skills/anatomy/scripts/lines.mjs "http://localhost:<port>/#<scene>" --select "#<scene> .iso-svg"` must print `line ends: 0`, with `--theme dark` and `--theme light`, and at `--width 390`. Run the audit if the figure has pipes, cables or round parts. (`_example` passes: 0 of 96.)

---

## 5. Content schema (`@/content/schema`)

```ts
type SceneId = "objection" | "ruler" | "handwriting" | "collaborative" | "taught" | "act" | "memory" | "everyone" | "your-year";
interface Source { id; claim; source; url; verified: boolean; checked; note? }
interface WorkPage {
  slug: WorkSlug; title; oneLine /* plain-language, UX-T1 */; role; dates; year /* ruler order */; scene?: SceneId;
  ancestor: { year; text; sources: string[] /* ids in sources.ts */ };
  situation: string[]; tension: string[]; decisions: { fork; taken; notTaken; why }[];
  architecture: { nodes: { id; label; job; detail?; layer?; state?: "done"|"stub"|"external" }[]; edges: { from; to; label? }[] };
  learned: string[] | null;   // Rohan's words only. null → section hidden. NEVER invent.
  outcome: { value? /* only stated numbers */; text }[]; unlocks: string[]; status; links: { label; href; kind }[];
}
interface ArchiveEntry { name; year; line; credit?; href? }
```

- `unlocks` was added beyond the brief's field list: MASTER §3 requires a "What it unlocks" beat.
- **1D:** one file per page in `src/content/work/<slug>.ts`, registered in `src/content/work/index.ts`. `bloomscroll.ts` is a **stub** that only proves the route works. Rewrite it from the dossier, with ≥ 400 words.
- The template is `src/app/work/_components/WorkTemplate.tsx`. Its section order is: header (shared element) → ancestor → Situation → Tension → What I did (architecture, forks) → What I learned (if any) → Outcome → What it unlocks → pager.
- Keep `generateStaticParams` and `dynamicParams = false` (G6).

### Truth (MASTER §2)

- History claims must exist in `sources.ts`. State them as their `claim` says, and read `note` first.
- Rohan claims come from the résumé or the dossiers, with MASTER §3's corrections:
  - DecentralMem: only the Claude adapter works.
  - Conductor: Phase 0, no live run.
  - BharatEdge: paper in preparation, no results.
  - BulkMagic: scene 5 only.
- **No phone number anywhere.**

---

## 6. Route transitions (`@/lib/transitions`, server-safe)

```tsx
<PageTransition>…page…</PageTransition>                       // in each page.tsx (already on /, /work/, /work/[slug]/)
<Link href="/work/bloomscroll/" transitionTypes={FORWARD}>     // into a page; BACK for "← back"
  <SharedElement name={sharedName("bloomscroll")}>bloomScroll</SharedElement>
</Link>
```

- Put the same `SharedElement` name on the work page's header. A morph pairs only when both ends are in the viewport (G1).
- Reduced motion zeroes every animation (`transitions.css`).

---

## 7. Checks every phase-1 agent runs before handing back

1. `npm run lint` and `npm run build`: both pass with no new warnings.
2. Serve the export: `python3 -m http.server <port> --directory out`.
3. Check in a real browser with the Playwright MCP:
   - **Widths:** 1440×900 and 390×844.
   - **Themes:** light and dark.
   - **Motion:** `reducedMotion: "reduce"`, including flipping it live.
   - **JS disabled:** a full-page screenshot with every section filled.
   - **Console:** 0 errors. The font and CSS "preloaded but not used" warnings are known.
4. Read every screenshot critically.
5. Confirm, for your scenes or pages:
   - no horizontal scroll at 390
   - a wheel of 100 px moves 90–110 px (U3)
   - CLS 0 while scrolling through any pin
   - targets ≥ 44 px
   - focus visible
   - the headings outline (one `h1` per page, no skipped levels)
   - the years in the headings
   - no banned patterns (`craft-bar.md` §4.1)
6. Run `lines.mjs` on every figure: `line ends: 0` in both themes.
7. Check the budgets after your change. Measure gzip JS per route from `out/*.html` script tags:
   - home ≤ 260 KB
   - motion ≤ 60 KB (no new motion libraries)
   - mobile LCP ≤ 2.0 s
   - CLS ≤ 0.02
8. No phone number: `grep -rE '[0-9]{10}' src out` shows nothing phone-like, and the lead's exact-number grep (ask for it; it is not written down in the repo on purpose) returns nothing.
9. Delete `.playwright-mcp/` and stop the servers.
10. Commit locally on your branch. Never push.

---

## 8. Phase-0 state (for reference)

- **Placeholder scenes 0–8** on `/` use the storyboard's draft copy. The hero line is still a draft (MASTER §7.3), and so is the scene-0 `h1`, which is the name: S1 wants ≤ 8 words of thesis, so 1A and Rohan decide.
- **Measured at commit:**
  - home JS 242 KB gzip
  - motion chunks 56.5 KB gzip (GSAP + ScrollTrigger + SplitText 47.3, Lenis 9.2)
  - `/work/bloomscroll/` 232 KB gzip
  - CLS through the example pin ≈ 0.0003
- **Sources:** every fact in `concepts.md` "Fact checks" is in `sources.ts`, with these notes:
  - **Tapestry:** "coined" is widely credited but not confirmed from a primary source. Say "named" or "described".
  - **Hollerith → IBM:** went through CTR in 1911. Don't say "TMC became IBM".
