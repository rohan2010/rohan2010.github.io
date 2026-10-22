# Motion stack for v2: findings from the spike

Written 2026-10-22. Next 16.4.2, React 19.3.0, Tailwind 4, `output: "export"` on GitHub Pages.
Every number below comes from `npm view`, from the installed packages, or from a spike that was built, served
from `out/` with `python3 -m http.server` and driven in Chromium through Playwright at 1440×900 and 390×844.
The spike lived in the scratchpad and has been deleted. Nothing in `src/` was changed.

---

## 1. Recommendation

| Layer | Pick | Version (npm, 2026-10-22) | Licence | Added JS (gzip) |
|---|---|---|---|---|
| Timeline, scroll and text | **GSAP** core + **ScrollTrigger** + **SplitText** | `gsap@3.15.0` (2026-04-13) | GSAP Standard "no charge" licence | about 47 KB in the Next chunk (core 28.3 + ScrollTrigger 18.6 + SplitText 3.7) |
| React glue | **`@gsap/react`** (`useGSAP`) | `2.1.2` (2025-01-15), peer deps `gsap ^3.12.5`, `react >=17` | same as GSAP | under 1 KB on top of gsap |
| Smooth scroll | **Lenis**, driven by GSAP's ticker | `lenis@1.3.27` (2026-10-15) | MIT | 5.5 KB (about 9 KB as a Next chunk with its glue and CSS) |
| Route transitions | **React `<ViewTransition>`** plus Next `<Link transitionTypes>` | built into React 19.3 and Next 16.4 | MIT | **0 KB** (already in React) |
| Optional, only if a design calls for it | `Flip` (9.9 KB), `MotionPathPlugin` (9.7 KB) | in `gsap@3.15.0` | Standard | added per use |

**Total for the motion stack: about +57 KB gzip.** Measured: the home route went from 183.8 KB to 240.6 KB of
gzipped JS once `SmoothScroll` (Lenis + GSAP + ScrollTrigger + SplitText) was in the root layout.

### Licence check (GSAP)

- `npm view gsap license` returns `Standard 'no charge' license: https://gsap.com/standard-license`. Each plugin
  file's header (for example `SplitText 3.15.0`) points to the same terms.
- The README in the 3.15.0 package says: "GSAP is now **100% FREE** including ALL of the bonus plugins like SplitText,
  MorphSVG … even for commercial use" (made possible by Webflow). gsap.com/pricing says the same thing: "100% free for all users".
- Every former Club plugin ships in the public npm package (SplitText, MorphSVG, DrawSVG, ScrollSmoother,
  Inertia, ScrambleText, GSDevTools and others). No private registry or token is needed.
- **Not verified today:** the full licence text. gsap.com/standard-license currently shows a "forums offline" page,
  and its text was not readable on 2026-10-22. From earlier versions of the licence, the one notable restriction is
  that you may not use GSAP in a product that competes with Webflow's visual animation builder. A personal portfolio
  is clearly fine. GSAP is not OSI open source, so do not vendor-modify it and republish it.

### Rejected or deferred, and why

| Library | Version and licence | Size measured (gzip) | Verdict |
|---|---|---|---|
| anime.js v4 | `4.5.0` (MIT); `5.0.0-beta.2` is on npm | `animate` 13.3 KB; `animate + onScroll + createTimeline + splitText` 21.8 KB | Good and smaller. But it would duplicate GSAP, and it has no proven pinning or Lenis sync to match ScrollTrigger's (pin spacers, refresh ordering, `matchMedia` revert). Use **one** timeline engine. Reconsider anime.js only if we drop pinning entirely. |
| Motion (framer-motion) | `motion@14.6.0` / `framer-motion@14.6.0` (MIT, released today) | `motion/react` (`motion`, `useScroll`, `useTransform`) 52.7 KB; `motion` (`animate`, `scroll`) 29.2 KB; `motion/react-mini` 3.9 KB | It overlaps GSAP almost completely. Its strength, layout and exit animations in React, is now covered by `<ViewTransition>` at 0 KB. Do not add it. |
| ScrollSmoother (GSAP) | free in 3.15 | not measured | It needs a wrapper/content DOM structure and transforms the whole page. Lenis keeps native scroll, so `position: sticky`, `scroll-padding` and the existing anchor links keep working. Lenis wins. |
| three.js | `0.186.1` (MIT) | minimal scene (renderer, scene, camera, mesh, material) 133.7 KB | Too heavy for one hero moment on a portfolio whose identity is SVG figures. |
| React Three Fiber | `@react-three/fiber@9.8.2` (MIT); 10.x is canary | `Canvas` + three 251 KB | No. |
| A WebGL hero moment, if it is ever wanted | none needed | — | Use the anatomy kit's own small shader layer (raw WebGL inside the isometric drawing) and load it lazily with `next/dynamic` and `ssr: false`, below the fold or after idle. Do not add three.js. |

---

## 2. Spike: what was built and what happened

Spike routes: `/lab/` (SplitText headline, a pinned scrubbed scene, and **the real bench figure scrubbed by scroll**),
plus `/projects/[slug]` with `generateStaticParams → [{ slug: "demo" }]` and `dynamicParams = false`.
Lenis ran in the root layout. Both routes were wrapped in directional `<ViewTransition>`s, with a shared
`name="project-demo"` thumbnail-to-hero morph.

| Check | Result |
|---|---|
| `npm run build` | Passed. `/projects/demo` prerendered as SSG (●). No warnings from the motion code. |
| Console at 1440 and 390, on both routes, with client navigations | **0 errors.** Two warnings came from the site's existing font preload ("preloaded but not used"); they have nothing to do with motion. |
| Lenis active (`html.lenis`), no horizontal scroll at 390 | Passed. |
| ScrollTrigger pin and scrub, `/lab/` | Passed. The scene sat at `top: 0` from scroll 658 to 2206 (`end: "+=200%"`). The bench stayed pinned across `+=250%`. Drift while pinned: **0.0 px** at 120 fps. |
| SplitText | 37 split nodes, `aria-label` set to the full sentence. `autoSplit` re-split after fonts loaded. |
| Bench scrubbed by its own `step()` | Passed in both directions. The readout ran "Claude back to the rack → fetching GPT-4o → GPT-4o · memory → card 2 · failed · retrying → retry 1 · passed", then backwards to "checking" and "failed · retrying" when scrolling up. |
| Client nav `/lab/ → /projects/demo/` | Passed. `startViewTransition` was called with types `["nav-forward"]`, the slide animations ran, the page landed at `scrollY = 0` and the old pin-spacers were removed (0). |
| Client nav back | Passed. Type `nav-back`. Both pins were re-created and positioned correctly; checked by scrolling the whole page again afterwards. |
| Shared-element morph | **Partly broke.** See gotcha G1. It morphs when the thumbnail is in the viewport at the top of the page (verified: `::view-transition-group(project-demo)`, and the screenshot showed it mid-morph). It does **not** pair when the source is far down a scrolled page: only `old(project-demo)` fades out. |
| Deep link `/projects/demo/` | 200, renders, Lenis on. `/projects/demo` without the slash returns a 301 to the slash version. |
| `trailingSlash` (default `false`) | **Broke.** `/projects/demo/` returned a Python **directory listing** (because `out/projects/demo/` holds RSC `.txt` segments), and GitHub Pages would return 404. See G2. Fixed with `trailingSlash: true`. |
| Reduced motion, first load | Passed after one fix (G5). No Lenis, 0 pin-spacers, no split, the progress bar showed its end state, steps at opacity 1, and the bench at its scripted end ("card 2 · retry 1 · passed"). |
| Reduced motion toggled live (both ways) | Passed. Lenis is destroyed and re-created; `gsap.matchMedia` reverts and rebuilds the pins. |
| Lenis and existing anchors (`#work`, scroll-padding 72px) | Same landing position as native scroll (`top: 144` in both cases). The `End` key reaches the bottom. |
| Frame pacing while scrubbing (rAF deltas) | p50 8.3 ms, p95 9.1 ms, p99 9.3 ms (120 Hz headless). Same at **4× CPU throttle**. 0 long tasks, 0 long animation frames over 50 ms. |
| CLS | **0 on load.** But **1.09 during scroll** with the default `pinType: "fixed"` under Lenis (source: the pinned `<section>`). With **`pinType: "transform"` it was 0**, with the same 0.0 px drift. See G3. |
| LCP (local, cached, no throttling) | 36 to 48 ms. Only useful as a relative number; budgets are in §5. |

---

## 3. Integration patterns for Next 16

1. **Client boundaries.** Only the leaf components that animate are `"use client"`: `SmoothScroll`, `SplitHeadline`,
   `PinnedScene`, `ScrubBench`. Pages and layouts stay Server Components. They import the client leaves and pass plain
   props. GSAP is never imported from a Server Component.
2. **One `motion/gsap.ts` module** imports GSAP, registers its plugins once (`gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP)`,
   guarded by `typeof window`) and re-exports them. Registering `useGSAP` as a plugin avoids duplicate-React warnings.
3. **`useGSAP(fn, { scope })` for every effect.** It runs in an isomorphic layout effect, and everything created inside it
   (tweens, ScrollTriggers, SplitText, `matchMedia`) is reverted on unmount. That is what removed the pin-spacers on
   route change in the spike. Use `contextSafe` for event handlers that create tweens after mount.
4. **Use `gsap.matchMedia()` for motion and reduced motion.** Build pins and scrubs under
   `(prefers-reduced-motion: no-preference)` and set static end states under `(reduce)`. It reverts and rebuilds
   automatically when the preference changes.
5. **Lenis and ScrollTrigger share one loop.** Create Lenis once in a client component in the **root layout** so it survives
   navigations. Use `autoRaf: false`, `lenis.on("scroll", ScrollTrigger.update)`,
   `gsap.ticker.add(t => lenis.raf(t * 1000))` and `gsap.ticker.lagSmoothing(0)`.
   Do not create Lenis at all under reduced motion; restore `lagSmoothing(500, 33)` when it is destroyed.
6. **Route change.** In the layout component, an effect on `usePathname()` calls `lenis.scrollTo(0, { immediate: true, force: true })`,
   then `requestAnimationFrame(() => ScrollTrigger.refresh())`. The new page's triggers are created in its own `useGSAP`
   before that frame, so the refresh measures the final layout.
7. **SSR-safe guards.** Read nothing from `window` during render. Keep the static first paint correct without JS:
   SplitText splits only after hydration; the bench renders `REST`; steps are visible in CSS and only hidden by `gsap.from`.
   That is why load CLS was 0.
8. **Page transitions.** Use `<ViewTransition>` from `react`, which is stable in 19.3 and needs no Next flag. Put the
   directional wrapper in each `page.tsx`, not in the layout, because layouts persist and never enter or exit. Pass
   `transitionTypes={["nav-forward"]}` or `["nav-back"]` on `<Link>`. Give shared elements a matching `name`, plus
   `share="morph" default="none"`. Add `::view-transition { pointer-events: none }`.
   Use **GSAP Flip only** for same-page layout changes (for example a card grid re-sorting). For routes, View Transitions are free and worked.

---

## 4. Static-export gotchas

- **G1. Shared-element morphs need both ends in the viewport.** React pairs named `<ViewTransition>`s only if both are
  visible in the old and new snapshots. A card clicked 3,000 px down the page has no visible partner at the top of the
  new page, so it only fades. Use morphs for things near the top (hero to hero, sticky nav, a project card in the first
  screen). Elsewhere, rely on the directional slide. A browser Back button carries no transition type, so only
  named morphs play.
- **G2. Set `trailingSlash: true`.** Without it, the export writes `projects/demo.html` *and* a `projects/demo/` folder of
  RSC `.txt` payloads. Then `/projects/demo/` 404s on GitHub Pages (and shows a directory listing in a plain static
  server). With it, the export writes `projects/demo/index.html`: `/projects/demo/` returns 200 and `/projects/demo` 301s
  to it. Write internal links with the trailing slash (`/projects/demo/`) to avoid the redirect.
- **G3. Pinning under Lenis: use `pinType: "transform"`.** With the default `"fixed"`, the switch to `position: fixed`
  logged layout shifts in Chrome (CLS 1.09 over one scroll of `/lab/`). `"transform"` measured CLS 0 with no jitter,
  because Lenis and ScrollTrigger update in the same ticker frame. The catch: a transform-pinned element becomes the
  containing block for any `position: fixed` children, so keep fixed UI (the TopBar) outside pinned sections.
- **G4. Never call `window.scrollTo` while Lenis is running.** Lenis keeps its own target and pulled the page back (in the
  spike it drifted from 3500 to 5). Use `getLenis()?.scrollTo(...)` for any programmatic scroll, the skip link included
  if it is ever JavaScript-driven. Plain `#hash` anchors are fine with `anchors: true`.
- **G5. Effect order across a parent and a child.** `useGSAP` runs in a **layout** effect. A child that registers an
  imperative handle in a plain `useEffect` is not ready yet. That was the one bug the spike hit: under reduced motion,
  `seek(1)` hit `null` and the bench stayed at `REST`. Register handles with `useLayoutEffect`, and also re-apply in
  ScrollTrigger's `onRefresh`.
- **G6. Keep `generateStaticParams` plus `export const dynamicParams = false` on every dynamic segment.** An unknown slug is then a
  build error, not a runtime 404 that a static host cannot produce.
- **G7. `scroll-behavior: smooth` in `globals.css` can stay.** Lenis writes the scroll with `behavior: "instant"`, so it
  is not double-smoothed (checked in `lenis.mjs`). Lenis's CSS (`lenis/dist/lenis.css`) is required; import it in the
  `SmoothScroll` client file.
- **G8. No middleware, rewrites or headers.** All motion is client-side. Nothing needs a server, and nothing here
  conflicts with Pages.
- **G9. Lenis in the root layout pulls GSAP and ScrollTrigger (about 47 KB) into every route**, including ones with no
  pins. That is acceptable at this size. If a route must be lighter, move `SmoothScroll` into a `(motion)` route-group
  layout instead of the root.

---

## 5. Budgets

| Metric | Budget | Spike measurement |
|---|---|---|
| Motion JS added (gzip) | **≤ 60 KB** for GSAP, ScrollTrigger, SplitText, Lenis and `useGSAP`. Flip or MotionPath only behind a real design need, +10 KB each. | +56.9 KB |
| Total JS, home route (gzip) | **≤ 260 KB** (React + Next is about 140 KB of that) | 240.6 KB, including all bench code |
| LCP (p75, mobile, field) | **≤ 2.0 s.** The LCP element is the hero text or the static bench SVG, never an animated or split element that starts hidden. | 36 to 48 ms locally |
| CLS | **≤ 0.02 on load, and 0 from pinning** (`pinType: "transform"`) | 0 on load; 0 with transform pins |
| INP (p75) | **≤ 150 ms.** No work in scroll handlers beyond `step()` and attribute writes. | no long tasks at 4× CPU |
| Scrub frame time | p95 ≤ 16.7 ms at 4× CPU throttle; 0 long animation frames over 50 ms | p95 9.2 ms |

## 6. Mobile strategy

- Keep Lenis on for touch, but leave `syncTouch` off (the default) so iOS keeps native momentum. Only wheel input is smoothed.
- Pins are shorter on phones: `gsap.matchMedia({ "(max-width: 640px)": … })` uses `end: "+=150%"` instead of `+=250%`. At 390 px
  the bench is about 360 px wide; scrubbing works, but a long pin of a small figure feels like dead scroll.
- No horizontal-scroll sections and no pin-inside-pin.
- Use `ScrollTrigger.config({ ignoreMobileResize: true })` so the iOS URL bar collapsing does not trigger refreshes and jumps.
- SplitText: words only on small screens (`type: "words"`), with fewer nodes and the same effect.

## 7. Reduced-motion strategy

- Use one media query, `(prefers-reduced-motion: reduce)`, everywhere, and follow it live (both directions verified).
- **Lenis is not created**: native scroll, native anchors.
- **No pins and no scrubs.** `gsap.matchMedia` sets every scene to its final state, and the content stacks in normal flow.
- **No SplitText**, so the heading stays one text node.
- **Bench:** show the scripted end state (`scriptAt(1)`). The existing click and keyboard interaction still works, through
  the figure's own `settleNow()` path, which already handles stillness.
- **View transitions:** `animation-duration: 0s` on all `::view-transition-*` (the snippet from the Next guide). A
  gentler alternative keeps a 150 ms crossfade and drops the translate.
- The site's existing `Reveal` observer already respects the setting; keep it.

---

## 8. Scrubbing the anatomy figures (the bench)

The bench is ideal for scrubbing because the model is pure and its time is additive:
`step(state, input, dt)` carries leftover time across phase boundaries. So **the state at scroll progress `p` is one call,
with no replay loop and no accumulated error**, and it runs the same forwards and backwards.

```
SCRIPT       = { pick: 1, run: { failures: 1 } }      // Claude → GPT-4o, first card fails once, retries, passes
SCRIPT_START = step(REST, SCRIPT, 0)                  // inputs are consumed here, at t = 0
SECONDS      = sum of DURATION over the script's phases (11.8 s; computed once at module load)
scriptAt(p)  = p <= 0 ? REST : step(SCRIPT_START, {}, p * SECONDS)
```

Pipeline per ScrollTrigger update: `progress → scriptAt → poseOf (frame.ts) → draw()`, where `draw()` writes
`transform`/`d` attributes on refs. `draw()` already exists in `live.tsx`. React never re-renders during a scrub.

Changes needed in `live.tsx`, small and additive (what the spike did):

1. Add an optional `seekRef` prop. When it is present, `BenchLive` registers
   `seekRef.current = (p) => { stop(); touring = false; bench = scriptAt(p); draw(poseOf(bench), pose.latch, pose.count); say(readoutOf(bench)); describe(); }`
   in a **`useLayoutEffect`** (G5).
2. Skip the idle tour when `seekRef` is set.
3. In scrub mode, bypass the latch spring and the needle `follow` and use the pose's targets directly. Springs depend on
   history and would make reverse scrubbing differ from forward scrubbing. ScrollTrigger's `scrub: true` plus Lenis
   provides the smoothing.
4. `art.tsx`: `BenchArt` forwards `seekRef`.

Keep the scrubbed bench as a separate placement (a pinned "how it works" chapter). The hero bench keeps its own tour and
interaction. The other figures (`detail.tsx`) can follow the same contract: export a pure `xAt(progress)` and a `draw(pose)`.
For CSS-only details, scrub a single custom property instead (`--p` set in `onUpdate`).

Accessibility: `describe()` writes the spoken summary only when the phase or seat changes, never every frame, so
scrubbing does not flood `aria-live`.

---

## 9. Skeleton code (these patterns ran in the spike)

### `next.config.ts` (the addition)

```ts
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true, // G2: /x/ → x/index.html, so deep links work on GitHub Pages
  images: { unoptimized: true },
  // …existing turbopack rules
};
```

### `src/motion/gsap.ts`

```ts
"use client";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);
  ScrollTrigger.config({ ignoreMobileResize: true });
}

export { gsap, ScrollTrigger, SplitText, useGSAP };
export const REDUCE = "(prefers-reduced-motion: reduce)";
export const MOTION = "(prefers-reduced-motion: no-preference)";
```

### `src/motion/SmoothScroll.tsx` (render once in `app/layout.tsx`, inside `<body>`)

```tsx
"use client";
import * as React from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { usePathname } from "next/navigation";
import { gsap, ScrollTrigger, REDUCE } from "./gsap";

let current: Lenis | null = null;
export const getLenis = () => current; // G4: use this for programmatic scrolls

export function SmoothScroll() {
  const pathname = usePathname();

  React.useEffect(() => {
    const mq = window.matchMedia(REDUCE);
    let tick: ((time: number) => void) | null = null;
    const start = () => {
      if (current || mq.matches) return;
      const lenis = new Lenis({ autoRaf: false, anchors: true });
      lenis.on("scroll", ScrollTrigger.update);
      tick = (time) => lenis.raf(time * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
      current = lenis;
    };
    const stop = () => {
      if (tick) gsap.ticker.remove(tick);
      tick = null;
      current?.destroy();
      current = null;
      gsap.ticker.lagSmoothing(500, 33);
    };
    const onChange = () => {
      if (mq.matches) stop();
      else start();
      ScrollTrigger.refresh();
    };
    start();
    mq.addEventListener("change", onChange);
    return () => {
      mq.removeEventListener("change", onChange);
      stop();
    };
  }, []);

  React.useEffect(() => {
    current?.scrollTo(0, { immediate: true, force: true });
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  return null;
}
```

### Split headline

```tsx
"use client";
import * as React from "react";
import { gsap, SplitText, useGSAP, MOTION } from "./gsap";

export function SplitHeadline({ children }: { children: string }) {
  const ref = React.useRef<HTMLHeadingElement>(null);
  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add(MOTION, () => {
      const split = SplitText.create(ref.current!, {
        type: "words,chars",
        mask: "words",
        autoSplit: true, // re-splits after fonts load or on resize
        onSplit: (self) => gsap.from(self.chars, { yPercent: 110, duration: 0.7, ease: "power3.out", stagger: 0.015 }),
      });
      return () => split.revert();
    });
  }, { scope: ref });
  return <h1 ref={ref}>{children}</h1>;
}
```

### Pinned and scrubbed scene

```tsx
"use client";
import * as React from "react";
import { gsap, useGSAP, MOTION, REDUCE } from "./gsap";

export function PinnedScene() {
  const root = React.useRef<HTMLElement>(null);
  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add(MOTION, () => {
      gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: root.current, start: "top top", end: "+=200%", pin: true, pinType: "transform", scrub: 0.5 },
      })
        .from(".step", { autoAlpha: 0, y: 40, stagger: 0.5 })
        .to(".bar", { scaleX: 1 }, 0);
    });
    mm.add(REDUCE, () => gsap.set(".bar", { scaleX: 1 })); // static end state, no pin
  }, { scope: root });
  return (
    <section ref={root}>
      <div className="bar" />
      <ol><li className="step">…</li></ol>
    </section>
  );
}
```

### Bench scrubbed by its model

```tsx
// live.tsx (additions)
const SCRIPT: BenchInput = { pick: 1, run: { failures: 1 } };
const SCRIPT_START = step(REST, SCRIPT, 0);
const SCRIPT_SECONDS = (() => { let s = SCRIPT_START, t = 0; while (busy(s) && t < 60) { s = step(s, {}, 1 / 120); t += 1 / 120; } return t; })();
export const scriptAt = (p: number) => (p <= 0 ? REST : step(SCRIPT_START, {}, Math.min(1, p) * SCRIPT_SECONDS));

// inside BenchLive, with props.seekRef?: React.RefObject<((p: number) => void) | null>
React.useLayoutEffect(() => {            // layout effect: ready before the parent's useGSAP (G5)
  const seek = props.seekRef;
  if (!seek) return;
  seek.current = (p) => {
    stop(); touring.current = false;
    const state = scriptAt(p);
    bench.current = state;
    const pose = poseOf(state);
    latch.current = { at: pose.latch, rate: 0 };
    count.current = pose.count;
    draw(pose, pose.latch, pose.count);  // targets directly: reversible, no spring history
    say(readoutOf(state));
    describe();
  };
  return () => { seek.current = null; };
}, [props.seekRef, draw, say, describe, stop]);
// …and in the tour effect: `if (idle && !engaged && !asksForStillness() && !props.seekRef)`
```

```tsx
// ScrubBench.tsx
"use client";
export function ScrubBench() {
  const root = React.useRef<HTMLElement>(null);
  const seek = React.useRef<((p: number) => void) | null>(null);
  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add(MOTION, () => {
      ScrollTrigger.create({
        trigger: root.current, start: "top top", end: "+=250%",
        pin: true, pinType: "transform", scrub: true,
        onUpdate: (self) => seek.current?.(self.progress),
        onRefresh: (self) => seek.current?.(self.progress),
      });
    });
    mm.add(REDUCE, () => seek.current?.(1)); // end state, no pin
  }, { scope: root });
  return (
    <section ref={root}>
      <Plate fig="Fig 1" title="The model bench" hint="Scroll to run" readout={readoutOf(REST)}>
        <BenchArt seekRef={seek} />
      </Plate>
    </section>
  );
}
```

### Route transitions (server `page.tsx`, no client code)

```tsx
import Link from "next/link";
import { ViewTransition } from "react";

const DIR = { "nav-forward": "nav-forward", "nav-back": "nav-back", default: "none" } as const;

export default function Page() {
  return (
    <ViewTransition enter={DIR} exit={DIR} default="none">
      <main>
        <Link href="/projects/demo/" transitionTypes={["nav-forward"]}>
          <ViewTransition name="project-demo" share="morph" default="none">
            <div className="thumb" />
          </ViewTransition>
        </Link>
      </main>
    </ViewTransition>
  );
}
// app/projects/[slug]/page.tsx: export const dynamicParams = false; generateStaticParams(); the same wrapper;
// <ViewTransition name={`project-${slug}`} share="morph" default="none"> around the hero.
```

```css
::view-transition { pointer-events: none; }
::view-transition-group(.morph) { animation-duration: 400ms; }
::view-transition-old(.nav-forward) { --slide-offset: -60px; animation: 150ms ease-in both fade reverse, 400ms ease-in-out both slide reverse; }
::view-transition-new(.nav-forward) { --slide-offset: 60px;  animation: 210ms ease-out 150ms both fade, 400ms ease-in-out both slide; }
::view-transition-old(.nav-back)    { --slide-offset: 60px;  animation: 150ms ease-in both fade reverse, 400ms ease-in-out both slide reverse; }
::view-transition-new(.nav-back)    { --slide-offset: -60px; animation: 210ms ease-out 150ms both fade, 400ms ease-in-out both slide; }
@keyframes fade  { from { opacity: 0; } to { opacity: 1; } }
@keyframes slide { from { translate: var(--slide-offset); } to { translate: 0; } }
@media (prefers-reduced-motion: reduce) {
  ::view-transition-old(*), ::view-transition-new(*), ::view-transition-group(*) { animation-duration: 0s !important; animation-delay: 0s !important; }
}
```

### Install

```bash
npm i gsap@3.15.0 @gsap/react@2.1.2 lenis@1.3.27
```
