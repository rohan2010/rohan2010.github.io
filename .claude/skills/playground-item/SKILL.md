---
name: playground-item
description: Build a new item for the Playground on Rohan's portfolio (rohan2010.github.io, /playground/), or edit one: a fancy landing-page component (WebGL/three.js hero, shader, cursor effect, animated headline, feature section…) that runs live, with a fill-in prompt people paste into their coding agent, a "where this breaks" list and the source code. Use whenever Rohan wants a new component, effect, prompt or "playground thing", or wants an existing item's prompt, pitfalls, preview or naive version changed.
---

# Building a Playground item

The Playground (`/playground/`) is a gallery of frontend pieces for landing pages. Each one **runs live**, comes with a **prompt** someone pastes into Cursor, Claude Code or v0 to build their own, a list of the **pitfalls** the obvious version hits, and the **code**.

## Scope: what belongs here

- **Yes:** web UI someone would put on a landing page or portfolio: WebGL or three.js heroes, shaders, cursor and scroll effects, animated type, feature sections, navigation, buttons and similar.
- **No:** project-specific pieces such as a case-study layout or a demo of one of Rohan's projects (he removed both). No image, video or writing prompts either; those aren't web UI.
- **Never mention or credit 21st.dev**, or any other component site, anywhere on the page, in the prompt or in code comments. If a piece is based on someone's work, credit the author by name only.

## Files

| What | Where |
|---|---|
| The component (client, `"use client"`), its CSS, shaders | `src/playground/<slug>/` |
| The obvious version (optional) | `src/playground/<slug>/Naive.tsx`, exporting `Naive` |
| Facts, prompt, pitfalls, code list | `src/content/playground/<slug>/item.json` |
| Registration | `src/playground/previews.ts`: `"<slug>": { now: X, before: { Preview: Naive, label: "The obvious version", note: "…" } }` |

The index page and the item page read these automatically. A piece that already runs on the site, like the home page's `DitherGrid`, is reused, not copied. If it needs an option to work inside a box (for example `fadeOnScroll={false}`), add the option with a default that keeps the site's behaviour the same.

## The component

It renders its own stage: full width of its container (about 1120px on desktop, about 343px on a phone), around `clamp(420px, 60vw, 600px)` tall, `border-radius: 18px`, with sample copy over it. Sample copy is generic product copy, never about Rohan's projects. On a real page the headline would be the `h1`, so in the preview use a `p` or `h2`, because the page already has its own `h1`.

Requirements. These also feed the pitfalls list, and the Playground index runs every item at once:

- **Colours:** only the site's tokens: `--paper`, `--paper-2`, `--ink`, `--ink-2`, `--ink-3`, `--rule`, `--brand` (tobacco), `--brand-ink`, `--deep`, `--on-deep`, `--signal` (brass), `--signal-ink`, `--lift`. Mix them with `color-mix(in oklab, …)`. For WebGL, read the tokens at runtime with `getComputedStyle` (they change with the colour scheme). Never write new hex values.
- **Fonts:** `--sans` (Instrument Sans), `--serif` (Instrument Serif italic, for one accent word), `--mono`.
- **Look:** calm, editorial and warm. No neon, rainbow gradients, glow spam, gradient blobs or "AI landing page" tropes. Boxes are fully bordered, never a tint with a left accent bar.
- **Runs only on screen:** use an IntersectionObserver plus `document.hidden`, and stop the loop when it's off screen or the tab is hidden.
- **Reduced motion:** honour `prefers-reduced-motion` with one still frame and no loop or magnet effects.
- **Sizing:** cap `devicePixelRatio` at 2, and size from the component's own box with a ResizeObserver, not from the window.
- **Cleanup:** dispose of geometry, materials, render targets and the renderer on unmount. React strict mode mounts twice in dev, so create the canvas in the effect.
- **Fallback:** if WebGL isn't available, show a static CSS fallback. The text still works.
- **Accessibility:** text is real DOM, and the canvas is `aria-hidden`.
- **Input:** pointer events, so mouse and touch both work. Touch screens (`(hover: none)`) get a sensible non-hover behaviour.
- **No SSR surprises:** never touch `window` during render. Randomness must not cause hydration mismatches.
- **Phones:** no horizontal overflow at 320px.

**The obvious version** is worth building when the difference shows on screen: a flat material next to a real one, a stack of DOM nodes next to one canvas, a render counter climbing. Make its flaws visible; if it looks the same as "Now", it reads as broken. It still stops when off screen and cleans up after itself, so it can't hurt the page.

## item.json

```json
{
  "title": "A field of *brass* dots that ripples under the cursor",
  "dek": "One or two sentences: what it is and where it goes on a page.",
  "kind": "Hero background",
  "date": "2026-10-27",
  "order": 7,
  "stack": ["three.js", "React"],
  "template": "…the prompt, with {blanks}…",
  "variables": [{ "key": "stack", "label": "Your stack", "value": "Next.js with plain CSS", "hint": "optional, short" }],
  "mistakesTitle": "Where this breaks",
  "mistakesIntro": "One sentence.",
  "mistakes": [{ "then": "…", "cost": "…", "now": "…", "line": "exact words from the template" }],
  "files": [{ "path": "src/playground/<slug>/X.tsx", "note": "one line" }]
}
```

- **`kind`:** where it goes on a page: `Hero`, `Hero background`, `Feature section`, `Headline`, `Navigation`, `Button` and so on.
- **`order`:** its place on the index (1 = first). Keep the values unique.
- **`mistakesTitle`:** use `"Where this breaks"` for general pitfalls. Leave it out (the default is "What I got wrong first") only when every mistake really is Rohan's own first version. If one of them is his, say so in `mistakesIntro`.

## Writing the prompt (`template`)

The prompt is the product. Someone with a different stack pastes it into a coding agent and should get the good version, not the obvious one.

1. **Open with the job and the stack:** "Build a … for the hero of my landing page in {stack}."
2. **Describe the look** concretely (layout, motion, colours as roles), with blanks for what people change.
3. **Write the behaviour as instructions,** including the touch and keyboard cases.
4. **Bake in the requirements above** in plain words (on screen only, reduced motion, ResizeObserver, pixel ratio cap, cleanup, fallback, real text). This is what separates it from a generic prompt.
5. **Length:** 150–300 words. One paragraph of instructions, no headings, no bullet list.
6. **Blanks:** 4–7 of them, written `{key}` with `\w+` keys. Each needs a variable with a label, a working example value and an optional short hint. The example values must make a complete, sensible prompt, because "Copy prompt" on the index copies them as they are.
7. **Each pitfall's `line`** is an exact substring of the template: the words that prevent that pitfall. The page shows it under "In the prompt".
8. **Wording:** plain, dry, British spelling for site copy ("colours"). No brand or site names, no filler.

**Pitfalls (4–5):** `then` is what the obvious version does, `cost` is why it hurts (concretely), `now` is what this version does, and `line` is the prompt words that fix it. Use real problems you hit or can show. Don't pad with generic advice.

## Check it

1. `npm run check`: blanks match variables, every pitfall line is in the template, files exist, the slug is registered in `previews.ts`, orders are unique, and the banned names are absent.
2. `npx tsc --noEmit`, `npx eslint src/playground`, then `npx prettier --print-width 200 --write` on your files (the repo uses long lines).
3. `npx next build`, then check `/playground/` and `/playground/<slug>/` in a real browser (Playwright) at 1440×900 and 390×844:
   - the preview actually renders (WebGL, not the fallback);
   - pointer interaction works;
   - "The obvious version" switch works and looks different;
   - the copy button works;
   - nothing scrolls sideways.
4. Show Rohan before committing. Commits never carry Claude attribution.
