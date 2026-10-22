# Craft bar: rohan2010.github.io v2

This is the quality bar for the redesign. Every concept, build and review checks against it. It has five parts:

1. A benchmark of 13 acclaimed portfolios, covering what they do well and what they do badly.
2. A UX-laws checklist with testable rules.
3. A critique of the current build.
4. Anti-slop rules.
5. Acceptance criteria an agent can verify with a browser.

**The message the site must prove:** *AI is amazing, and used fully it leads us to an amazing future.* Rohan is the person who makes that future real: he takes models from "impressive" to "working where people are". The page must show this as a story, not state it as a résumé.

Rohan's verdict on v1: *"no story, no UX laws followed, looks like UI slop."* This document turns that verdict into rules.

---

## 1. Benchmark

### Method
- Award winners come from the Awwwards Portfolio category (Site of the Day / Site of the Month 2024–2026) and the score cards on each site's Awwwards page.
- Other conceits come from the publisher's own pages and press. Where no award could be verified, the entry says so.
- Techniques marked *(Awwwards tags)* are the jury's "highlighted elements" and tags.
- Techniques marked *(reported)* come from the cited write-ups.
- Techniques marked *(from memory, unverified)* were not re-checked in a browser for this document. Check them before copying.
- Page content was treated as data only.

**A pattern in the score cards.** Across the 2024–2026 portfolio winners checked:
- **Usability** is almost always the lowest of the four Site of the Day sub-scores: 6.92–7.83.
- **Accessibility** is always the lowest of the six Developer Award sub-scores: 6.2–7.0.
- **Animations** is always the highest: 7.4–9.0.

Award juries pay for spectacle and forgive friction. Rohan's site is pitched at engineering hiring managers, and its subject is making AI dependable. **It has to match the winners on memorability and beat them on usability and accessibility.** That gap is the opening.

| # | Site | Conceit | Recognition |
|---|---|---|---|
| 1 | Bruno Simon, [bruno-simon.com](https://bruno-simon.com) | 3D game world (WebGPU) | Awwwards SOTD 21 Jan 2026, Site of the Month Jan 2026; Site of the Year 2020 for v1 |
| 2 | Jesper Landberg, [jesperlandberg.com](http://jesperlandberg.com) | Motion-led WebGL index | Awwwards SOTD 29 Sep 2026 |
| 3 | Antoine Wodniack, [wodniack.dev](https://wodniack.dev) | Retro-experimental single page | Awwwards SOTD 12 Dec 2024 |
| 4 | Elliott Mangham, [elliott.mangham.dev](https://elliott.mangham.dev) | Clean single page, video, microinteractions | Awwwards SOTD 2 Dec 2025 |
| 5 | Gianluca Gradogna, [gianlucagradogna.com](https://gianlucagradogna.com) | Horizontal editorial, typography-led | Awwwards SOTD 23 Jan 2025 |
| 6 | Grégory Lallé, [gregorylalle.com](https://gregorylalle.com) | One colour, transitions only | Awwwards SOTD 30 Oct 2024 |
| 7 | Olha Lazarieva, [olhalazarieva.com](https://www.olhalazarieva.com) | Typographic gallery with 3D | Awwwards SOTD 2 Oct 2025 |
| 8 | Rauno Freiberg, [rauno.me](https://rauno.me) | OS-like desktop: dock and interface sounds | Widely cited design-engineer portfolio; no award verified |
| 9 | Dustin Brett, daedalOS ([dustinbrett.com](https://dustinbrett.com)) | Full desktop OS in the browser | Show HN, press coverage |
| 10 | Lynn Fisher, [lynnandtonic.com](https://lynnandtonic.com) | Rebuilt from a blank CSS file every year (v. XIX) | Long-running reference for responsive craft |
| 11 | Bartosz Ciechanowski, [ciechanow.ski](https://ciechanow.ski) | Interactive explainer essays | Widely cited reference for explorable explanations; no award verified |
| 12 | The Pudding, [pudding.cool](https://pudding.cool); Nadieh Bremer, [visualcinnamon.com](https://www.visualcinnamon.com) | Editorial scroll data-viz | Peabody 2017, SND Best in Show 2024 and 2025; Bremer: Information is Beautiful Gold |
| 13 | Terminal-portfolio genre (CLIfolio, Lovable template, termio.dev) | Terminal / CLI | **No award found**: the genre is now a template |
| — | Brittany Chiang v4 (bchiang7/v4) | The canonical dark dev one-pager | The baseline most dev portfolios copy |

### 1.1 Bruno Simon: the 3D game portfolio
- **Conceit.** You drive a small car around an isometric island. The projects are objects in that world.
- **Why it is memorable.** You *play* the CV. Every project is a place you arrive at, so remembering it is spatial.
- **Techniques (reported, Awwwards case study):**
  - Clicks, scrolling, keys, touch and a gamepad are all rebuilt as 3D interactions.
  - A day-night cycle, seasons and shared weather.
  - Spatialized ambient audio (birds, waves, thunder) and object sounds.
  - Three commissioned music tracks, released CC0.
  - A single UI click sound with slight pitch changes.
  - Shared counters, a daily lap leaderboard and achievements.
  - A lower-quality preset on mobile.
- **What it does badly.**
  - Accessibility 6.6 and markup 6.8 on the Awwwards Dev Award.
  - The case study names no accessibility fallback and no loading strategy.
  - Reaching a specific project's facts takes minutes of driving: Fitts and Hick in the worst sense.
  - It took over a year to build.
- **Take for Rohan:**
  - One world-object as the narrator works when the reader *operates* it, not when it is a picture.
  - Sound is a designed layer with one restrained UI click.
  - Always pair the world with a plain-HTML path to the facts.
- **Sources:** [Awwwards: Bruno's Portfolio](https://www.awwwards.com/sites/brunos-portfolio) · [Awwwards case study](https://www.awwwards.com/brunos-portfolio-case-study.html) · [Creative Bloq](https://www.creativebloq.com/news/3d-car-portfolio) · [Codrops, Three.js conference, 2026](https://tympanus.net/codrops/2026/07/16/meet-the-speakers-of-the-first-three-js-conference/)

### 1.2 Jesper Landberg: motion as the brand
- **Conceit.** A black-and-white index of projects where the transitions *are* the design.
- **Why it is memorable.** Index → project and project → project transitions are continuous: the image you clicked becomes the next page's hero. The home → profile view opens as a modal *(Awwwards highlighted elements)*.
- **Techniques:**
  - Infinite scroll.
  - GSAP and Three.js on Nuxt.
  - A two-colour palette (#000 / #FFF), so all the hierarchy comes from scale and motion.
- **What it does badly.** Accessibility 7.0 and usability 7.52. Infinite scroll has no end, which works against Goal-Gradient and Peak-End.
- **Take for Rohan.** The **shared-element transition from the story into a case study** is the one technique worth borrowing outright: the object you clicked carries over into the next page. View Transitions can do this on a static export.
- **Source:** [Awwwards: Jesper Landberg](https://www.awwwards.com/sites/jesper-landberg-4)

### 1.3 Antoine Wodniack: the confident single page
- **Conceit.** A retro-experimental single page in one saturated red (#f40c3f) on near-black (#160000).
- **Why it is memorable.** It commits to one colour and one attitude. You can recognise it from a thumbnail.
- **Techniques (Awwwards highlighted elements):**
  - An intro animation and a hero animation.
  - A 3D image gallery.
  - An "About" section driven by scroll and interaction.
  - A contact link with a hover animation, so the ending is a designed moment.
- **What it does badly.** Accessibility 6.2, the lowest in this set.
- **Take for Rohan:**
  - Commit to a palette strong enough to read in a thumbnail.
  - Design the contact as a moment, not a list of links.
- **Source:** [Awwwards: AW Portfolio](https://www.awwwards.com/sites/aw-portfolio)

### 1.4 Elliott Mangham: microinteractions with restraint
- **Conceit.** A clean dark single page (#121212 / #FFF) built around video and gestures.
- **Why it is memorable.** Every hover and press has its own response (tags: Gestures/Interaction, Microinteractions). The page's proof is a number: 10 SOTDs and 2 SOTY nominations. The content *is* evidence.
- **What it does badly.** Usability 6.92 and responsive 7.0.
- **Take for Rohan.** Lead with one hard, countable proof point. Craft lives in the feedback on every control.
- **Source:** [Awwwards: Elliott Mangham](https://www.awwwards.com/sites/elliott-mangham)

### 1.5 Gianluca Gradogna: horizontal editorial
- **Conceit.** Horizontal layout with infinite scroll. Typography carries the identity (tags: Horizontal Layout, Typography, Transitions).
- **Why it is memorable.** Horizontal reading breaks Jakob's Law on purpose, and the type is big enough to justify it.
- **What it does badly.** Accessibility 6.8 and usability 7.04. On a horizontal axis, keyboard and screen-reader order are easy to get wrong.
- **Take for Rohan.** A grid break is allowed **once**, as the peak, not as the whole navigation model.
- **Source:** [Awwwards: Gianluca Gradogna](https://www.awwwards.com/sites/gianluca-gradogna-portfolio)

### 1.6 Grégory Lallé: one colour, perfect transitions
- **Conceit.** One colour (#111) with minimal content. Transitions and the About page carry everything.
- **Why it is memorable.** Proof that restraint plus impeccable timing reads as craft. Nothing is decorative.
- **What it does badly.** Accessibility 6.6. Thin content: you learn little about the work.
- **Take for Rohan.** Fewer elements, each one timed. **Content density matters more than chrome.**
- **Source:** [Awwwards: Grégory Lallé — '24](https://www.awwwards.com/sites/gregory-lalle-24)

### 1.7 Olha Lazarieva: the typographic gallery
- **Conceit.** A personal site for a creative designer: a typography-led gallery with 3D accents (tags: Typography, Gallery, 3D, GSAP, React).
- **Why it is memorable.** The type system is the brand: display, text and caption roles that never mix.
- **What it does badly.** Every sub-score sits in 7.0–7.44. It is polished but not distinctive, which shows that polish alone tops out around 7.3.
- **Take for Rohan.** Polish without a narrative idea is the ceiling v1 hit.
- **Source:** [Awwwards: Olha Lazarieva](https://www.awwwards.com/sites/olha-lazarieva)

### 1.8 Rauno Freiberg: OS-like craft playground
- **Conceit.** A desktop-OS-like portfolio with a dock, interface sounds, and horizontal galleries of projects, experiments and photography *(reported)*.
- **Why it is memorable.** Every interaction is tactile: sound, spring physics, a cursor-aware response. The site is a demo of "invisible details" (his essay of that name; cmdk contributor).
- **What it does badly.**
  - The OS metaphor asks users to learn a fake desktop (Tesler's Law cost).
  - The work is scattered across windows with no narrative order (no Serial Position).
- **Take for Rohan.** Sound and haptic-feeling feedback on a *small* set of controls is a craft signal. **Opt-in, off by default.**
- **Sources:** [uiuxshowcase: Rauno Freiberg](https://uiuxshowcase.com/portfolio/rauno-freiberg/) · [Lovers Magazine interview](https://spaces.is/loversmagazine/interviews/rauno-freiberg)

### 1.9 daedalOS (Dustin Brett): the literal OS
- **Conceit.** A full desktop environment in the browser.
  - A file system persisted to IndexedDB.
  - A terminal, emulators, media players and DOOM.
  - The stated aim: give visitors the feeling of remote-connecting to his machine.
- **Why it is memorable.** Sheer depth, and it is a working engineering feat.
- **What it does badly.**
  - The portfolio *content* gets lost.
  - A recruiter has to know how to "use" it before they learn anything (Jakob's and Tesler's).
  - It is heavy.
- **Take for Rohan.** **Don't.** An OS or terminal metaphor proves you can build, not that you can tell a story. The brief asks for the second.
- **Sources:** [daedalOS README](https://cdn.jsdelivr.net/gh/DustinBrett/daedalOS@main/README.md) · [Lunduke](https://lunduke.substack.com/p/daedalos-the-crazy-desktop-environment) · [Show HN](https://hn.svelte.dev/item/44088777)

### 1.10 Lynn Fisher: the annual rebuild
- **Conceit.** Every year she rebuilds the site from a blank CSS file around one new idea. The current version is labelled "v. XIX".
- **Why it is memorable.** The responsive behaviour is the joke and the art: resizing the window changes the illustration, not just the layout *(from memory, unverified for the current version)*. Her bio says the refresh is known for "surprising responsive design".
- **What it does badly.** Thin on case studies. The work index is simple, and the conceit outshines the content.
- **Take for Rohan.** **The breakpoint is a design surface.** The 390 px layout should have its own composition, not a stacked desktop.
- **Sources:** [Adobe XD Ideas interview](https://xd.adobe.com/ideas/perspectives/interviews/lynn-fishers-annual-portfolio-redesign-skills-sharp) · [lynnandtonic.com/archive/2021/about](https://lynnandtonic.com/archive/2021/about) · [web.dev community highlight](https://web.dev/blog/community-highlights/lynn-fisher)

### 1.11 Bartosz Ciechanowski: the explorable essay
- **Conceit.** Long single-topic essays (Moon 2024, Airfoil 2024, Bicycle 2023, Mechanical Watch 2022, GPS 2022…). Dozens of small interactive figures sit inline in the prose, each with a slider or drag.
- **Why it is memorable.**
  - The figure *is* the explanation.
  - The text says "drag the slider", you do, and you understand.
  - Each figure isolates one idea, so chunking is perfect.
- **Techniques (from memory, unverified per article):**
  - WebGL figures that only animate when on screen.
  - One control per figure.
  - Calm, neutral styling, so the colour inside figures carries all the meaning.
  - A single-column measure.
- **What it does badly.**
  - Very long, with no progress or chapter indicator.
  - Some figures are heavy on low-end phones.
  - The site shell is bare, which is fine for an essay but not for a portfolio.
- **Take for Rohan.** This is the **closest benchmark to the Anatomy bench figures**. v1 used the bench as a *picture with a caption*. Ciechanowski shows the alternative: **a figure earns its place only when the reader changes it and learns something.**
- **Source:** [ciechanow.ski/archives](https://ciechanow.ski/archives/)

### 1.12 The Pudding and Nadieh Bremer: editorial scroll data-viz
- **Conceit.** Visual essays where scroll steps through a chart (scrollytelling): sticky graphic, stepping text.
- **Why it is memorable.**
  - Data reveals itself in the order the argument needs.
  - The peak is a single chart state you remember ("the one where all the dots turn red").
  - Bremer and Wu's *Data Sketches* won IiB Gold for making the process visible.
- **What it does badly.**
  - Scrollytelling hijacks pace.
  - Sticky graphics plus small text on phones.
  - Reduced-motion and screen-reader parity is often an afterthought.
- **Take for Rohan.** *One* scrollytelling sequence, with sticky figure and stepping captions, is the right tool for the peak: "AI used fully". It needs a static, fully readable fallback.
- **Sources:** [The Pudding: About](https://pudding.cool/about/) · [Nadieh Bremer (Wikipedia)](https://en.wikipedia.org/wiki/Nadieh_Bremer) · [Online Journalism Blog, IiB 2017](https://onlinejournalismblog.com/2017/11/30/information-is-beautiful-awards-2017-data-visualisation-interviews/)

### 1.13 The terminal genre, and the Brittany Chiang baseline
- **Terminal.**
  - Searching Awwwards for "terminal" returned no terminal-style personal portfolio among its winners.
  - The genre is now sold as templates: Framer CLIfolio, a Lovable "terminal developer portfolio", termio.dev ("no code"), and open-source CmdFolio and One-Dark Shell.
  - **A conceit you can buy as a template is slop by definition.**
  - It also fails Jakob's Law (typing commands to read a CV) and hides content from scanning.
- **Brittany Chiang v4.**
  - The canonical dark dev one-pager: sidebar nav, numbered sections, mono accents, cursor glow, a "Things I've built" card list.
  - Thousands of stars and forks made it the template most dev portfolios descend from.
  - It is the *source* of many v1 traits: numbered mono section labels, chips, uniform cards.
  - It is good as the Jakob's-Law baseline: people know how to read it. It is also exactly what "UI slop" now looks like when it is copied without its restraint.
- **Sources:** [Framer CLIfolio](https://www.framer.com/marketplace/templates/clifolio/) · [Lovable terminal template](https://lovable.dev/en/templates/websites/portfolio/terminal-developer-portfolio-website-template) · [Peerlist termio.dev](https://peerlist.io/vikasacharya/project/termiodev) · [CmdFolio](https://github.com/Sigmakib2/CmdFolio) · [Awwwards "terminal" search](https://www.awwwards.com/websites/terminal/) · [bchiang7/v4 on best-of-web](https://best-of-web.builder.io/library/bchiang7/v4) · [Elementor: dev portfolio examples](https://elementor.com/blog/inspiring-web-developer-portfolio-examples/)

### 1.14 Benchmark synthesis: what separates the memorable from the slop
1. **One idea, operated by the reader.**
   - Bruno's car, Ciechanowski's sliders, Pudding's stepping chart.
   - In each, the reader *does something* and the site answers.
   - v1's bench is looked at, not used.
2. **Transitions carry continuity.**
   - Landberg and Lallé: the thing you clicked becomes the next page.
   - The story-to-case-study handoff is where craft shows.
3. **Hierarchy through extremes, not boxes.**
   - Winners use 1–2 colours and huge type contrast (Wodniack, Gradogna, Landberg).
   - None of them puts every chunk in a bordered rounded card.
4. **A designed peak and a designed end.**
   - Wodniack's contact hover, Bruno's leaderboard, Pudding's final chart state.
   - Endings are interactions, not link lists.
5. **The opening is usability and accessibility.**
   - Award sites score lowest there: accessibility 6.2–7.0, usability 6.9–7.8.
   - A site with both memorability *and* WCAG 2.2 AA is rarer than another WebGL demo.
6. **Conceits that are templates (terminal, fake OS, dark one-pager) read as slop even when well built.**

---

## 2. UX laws checklist (scroll-story portfolio + case-study pages)

**Sources:**
- [lawsofux.com](https://lawsofux.com/) for the definitions.
- NN/g for the [Peak-End rule](https://www.nngroup.com/articles/peak-end-rule/), [touch targets](https://www.nngroup.com/articles/touch-target-size/) (≥1 cm × 1 cm, about 44 CSS px; about 2 mm spacing), and related articles: [F-shaped pattern](https://www.nngroup.com/articles/f-shaped-pattern-reading-web-content/), [progressive disclosure](https://www.nngroup.com/articles/progressive-disclosure/), [scrolljacking](https://www.nngroup.com/articles/scrolljacking-101/), [Jakob's Law](https://www.nngroup.com/videos/jakobs-law-internet-ux/).
- WCAG 2.2 and web.dev for the numeric thresholds.

**Format.** Every rule has an ID so reviews can cite it ("fails UX-F2"). **Test** says how an agent checks it in a browser.

| ID | Law | Rule (testable) | Test |
|---|---|---|---|
| UX-J1 | Jakob's | Scrolling scrolls the page: no scrolljacking. Wheel/trackpad deltas are never intercepted. Scroll-linked effects are driven by native scroll position only. | Wheel 100 px → `scrollY` changes by ≈100 px, ±10. |
| UX-J2 | Jakob's | The name, top-left, links to `/`. Nav is top-right or a top bar. A case study has a visible "← All work" (or story) link in the first viewport and a "Next project →" at the end. | Snapshot: these links are present on every case-study page. |
| UX-J3 | Jakob's | Section and nav labels use words a recruiter would search for (Work, Research, About, Contact) or carry a plain subtitle. A metaphor word ("Field", "Bench") is never the only label. | Read the nav text. |
| UX-F1 | Fitts's | Every interactive target is ≥ 44×44 CSS px on touch (NN/g 1 cm). Inline text links in prose are exempt but have ≥ 24 px line-height (WCAG 2.5.8). | `getBoundingClientRect` on all `a, button, [role=button], input` at 390 px: report any under 44 (non-inline) or under 24 (inline). |
| UX-F2 | Fitts's | The primary CTA on phone is ≥ 48 px tall, full width or ≥ 60% width, and inside the lower 2/3 of the first viewport (thumb zone). It is reachable again at the end without scrolling back up. | At 390×844: the CTA box's top is ≥ 280 px and its bottom ≤ 844 px. A contact CTA exists in the last viewport. |
| UX-F3 | Fitts's | The signature interaction's controls sit within 120 px of the figure they control and never only in a corner label. | Measure the distance between the control and the figure box. |
| UX-H1 | Hick's | Top-level nav has ≤ 5 items. The home page offers ≤ 2 CTAs per viewport (1 primary, 1 secondary). | Count. |
| UX-H2 | Hick's | The work index on the home page shows ≤ 4 featured case studies. More go behind "All projects". | Count featured cards/links. |
| UX-M1 | Miller's | No list on the home page shows more than 7 sibling items without grouping. The skills/toolbox list is grouped into ≤ 4 groups of ≤ 7, or moved to a case study / about page. | Count `li` siblings per `ul` on `/`. |
| UX-M2 | Miller's | Each case study states ≤ 3 outcome metrics above the fold. | Count metric elements in the first viewport. |
| UX-T1 | Tesler's | The complexity of AI work is absorbed by the page, not handed to the reader: each case study opens with a one-sentence plain-language "what it does for a person". Jargon (RLHF, GGUF, LoRA) first appears after that sentence, and with a gloss on first use. | Read the first paragraph of each case study. Grep the first 300 chars for unglossed acronyms. |
| UX-D1 | Doherty | Every user action shows a visible response in < 100 ms. Any state change completes or shows progress in < 400 ms. Route transitions finish < 400 ms (or are interruptible). | Performance trace: click → first paint delta. INP < 200 ms (see §5). |
| UX-D2 | Doherty | The signature interaction responds on `pointerdown`/`keydown`, not after an animation ends. Input during an animation is accepted (interruptible). | Click twice quickly → the second input is honoured. |
| UX-PE1 | Peak-End | The page has exactly **one** designed peak, the moment the "AI used fully → amazing future" thesis lands. It is placed at 55–80% of the scroll length. It is the largest type and/or the most saturated colour on the page and the only full-bleed moment. | Record each section's scroll % and the max font size; confirm the peak section owns the max. |
| UX-PE2 | Peak-End | The end is designed: the last viewport contains (a) a callback to the opening image or line, (b) one primary action (email), and (c) no résumé fine print above the fold of that viewport. No "please don't go" tactics. | Screenshot the last viewport and check all three. |
| UX-PE3 | Peak-End | No negative peaks: no layout shift, no blank reveal state, no dead link, no console error anywhere on the path. | CLS, console, link check. |
| UX-SP1 | Serial Position | The first and last beats carry the two things to remember: first, who Rohan is and the thesis in ≤ 8 words; last, the future + the contact. The weakest content (tool lists, education fine print) goes in the middle or on sub-pages, never last. | Read the first and last visible text blocks. |
| UX-SP2 | Serial Position | In the featured work list, the strongest project is first and the most future-facing project is last. | Review the order. |
| UX-VR1 | Von Restorff | ≤ 1 isolated (Von Restorff) element per viewport: one thing that breaks colour, scale or motion from its surroundings. The accent colour as fill appears ≤ 1× per viewport. | Scroll in 1-viewport steps and count accent-filled or outsized elements per screenshot. |
| UX-VR2 | Von Restorff | The accent is reserved: links/focus, plus the one isolated element. It is not used for eyebrows, numerals, chips *and* metrics at once. | Grep computed `color` = accent across text nodes; ≤ 3 distinct roles. |
| UX-Z1 | Zeigarnik | The story shows open loops that pull the reader forward: the hero poses a question or an unfinished state (a process mid-run, a sentence that completes later), and the peak resolves it. Unfinished work (papers in prep) is framed as "in progress" with a next step, not hidden. | Read: identify the question set up in the hero and where it resolves. |
| UX-GG1 | Goal-Gradient | A progress indicator (chapter rail or progress bar) is visible on desktop and phone from the first chapter. It gets visibly closer to "done". | It exists in the snapshot at 1440 and 390 once past the hero. |
| UX-GG2 | Goal-Gradient | Chapters get shorter towards the end: each of the last two chapters is ≤ the median chapter height. | Section heights. |
| UX-AU1 | Aesthetic-Usability | Aesthetic polish may not hide a usability gap: every decorative figure has a text equivalent, and no styling lowers contrast below AA. | Contrast audit (axe). |
| UX-PR1 | Prägnanz | Each viewport reads as one simple shape: one dominant element, one supporting block. The squint test (blur 8 px) shows ≤ 3 masses. | Screenshot, apply CSS `filter: blur(8px)`, count masses. |
| UX-PX1 | Proximity | Spacing inside a group ≤ ½ of the spacing between groups. Caption to figure ≤ 16 px; figure to next section ≥ 96 px desktop / 64 px phone. Headings sit closer to their own text than to the previous block (space-above ≥ 2× space-below). | Measure the gaps between bounding boxes. |
| UX-CR1 | Common Region | Bordered/filled containers only where items need grouping *against* neighbours. **≤ 1 card type** on the home page, and no nesting cards in cards. | Count elements with border-radius > 0 and a visible border or bg ≠ page. |
| UX-SI1 | Similarity | Things that look alike behave alike: every link looks like a link (one style), every button like a button. A non-interactive element never uses the link colour or underline. Chips are never clickable-looking unless they are. | Hover each accent-coloured element: it must be interactive. |
| UX-SI2 | Similarity | Different story beats must *not* look alike: no two consecutive chapters share the same layout skeleton. | Compare the DOM/visual structure of consecutive sections. |
| UX-UC1 | Uniform Connectedness | Story continuity is drawn: a line, thread or moving object visibly connects chapters (or the timeline), so the reader sees one journey, not stacked slides. | Screenshot: a continuous visual connector across ≥ 3 chapters. |
| UX-PO1 | Postel's | Accept any input: keyboard, mouse, touch, pen; reduced motion; zoom to 200%; text spacing override (WCAG 1.4.12); JS off (story readable, figures replaced by stills). Send conservative output: static HTML first. | Test each mode (see §5). |
| UX-OC1 | Occam's razor | Every element answers "what does this add to the story?" Remove anything that only says "I'm technical" (decorative mono labels, version stamps, fig numbers with no referent). | Review: list elements with no narrative or navigational job. Must be 0. |
| UX-CH1 | Chunking | Prose blocks ≤ 60 words on the home page; case-study paragraphs ≤ 90 words. Line length 45–75 characters. | Word counts; measure `ch` width. |
| UX-SA1 | Selective Attention | Nothing moves when the reader is reading: no motion in the viewport while a text block > 40 words is centred, except motion the reader started. No auto-carousels. No banner-like blocks (a box with a pill and an icon in the top-right) that cause banner blindness. | Record a video of a slow scroll and flag motion next to long text. |
| UX-CL1 | Cognitive Load | ≤ 2 typefaces (plus, optionally, 1 mono used **only** for code or data). ≤ 6 font sizes on the home page. ≤ 3 text colours. | Collect computed font families and sizes over all text nodes. |
| UX-CL2 | Cognitive Load | The intrinsic load of AI concepts is cut by showing, not telling: each technical concept on the home page is paired with a visual or interactive demonstration, or a concrete human outcome. | Review. |
| UX-FL1 | Flow | The story reads uninterrupted from hero to contact: no modal, no gate, no loader > 1 s, no forced horizontal section. Optional interactions never block scrolling past. | Scroll top to bottom with the wheel only; nothing stops it. |
| UX-FL2 | Flow | Challenge matches skill: the signature interaction is learnable in ≤ 1 attempt (affordance visible, hint ≤ 6 words, shown once) and rewards mastery (a second, deeper state for those who keep playing). | Watch for the first-click success; check the hint text length. |
| UX-CS1 | (Case studies) | Every case study follows the narrative arc: **Situation → Tension → What I did (decisions, not tasks) → Outcome (number or human result) → What it unlocks next (the future)**. Each beat is a heading or clearly marked. | Snapshot headings per case study. |

---

## 3. Critique of the current site (v1)

### Method
- Built with `npm run build` and served from `out/` on :4180.
- Viewed in Playwright Chromium at **1440×900** and **390×844**, scrolled top to bottom.
- Measured with `getBoundingClientRect` and `getComputedStyle` over all text nodes and controls.
- Afterwards the screenshots folder (`.playwright-mcp`) was deleted and the server stopped.

**Hard numbers:**

| Measure | Value |
|---|---|
| Page height | 9,153 px at 1440 (≈10 screens); 14,252 px at 390 (≈17 screens) |
| Section heights at 1440 | hero 844 · Field 1,271 · Research 1,282 · Work 1,883 · **For fun 3,210** · Contact 606 |
| Section heights at 390 | **For fun 5,304 (37% of the page)** |
| Mono text | **117 of 298 text nodes (39%)** set in Geist Mono or ui-monospace |
| Text sizes | 16 distinct sizes; 82 nodes at 13 px and 17 at 12 px |
| Undersized targets | Top-bar "Rohan Pant" and "Contact" are **28 px tall** at both widths; "More on GitHub" is 38 px |
| Routes | **`/` only.** No case-study pages exist. |

### Why v1 reads as "AI slop": 12 specific findings

1. **One section template, stamped four times** (fails UX-SI2, UX-PR1).
   - Every chapter is built from the same parts:
     - a huge teal mono numeral (`01`–`04`)
     - a teal mono eyebrow (`WORK  2024-now`)
     - a 3-line sans H2
     - a rounded bordered "Fig 1.x" card with mono corner labels
     - a 12–13 px grey caption under it
   - Only the side the figure sits on changes (left, right, left, right). That alternation is the most generic layout move there is.
   - Nothing about the layout tells you that 2021 differs from 2024. The reader's eye learns the template by chapter 2 and stops reading.

2. **Label-heavy mono everywhere** (fails UX-CL1, UX-OC1).
   - 39% of all text is monospace, and mono does five different jobs:
     - eyebrows (`ROHAN PANT · FULL-STACK + AI ENGINEER`)
     - figure stamps (`Fig 1.2`, `GO/NO-GO GAUGE`)
     - metric values (`days → minutes`, `-40%`)
     - chips (`Python` `Transformers` `NLP`)
     - the whole footer
   - Mono here means "this is a developer", not "this is code or data". This is the single strongest slop signal on the page.

3. **The bench is decoration, not narrator** (fails UX-OC1, UX-CL2; contrast Ciechanowski §1.11).
   - The isometric bench is drawn five times (Fig 1 and Figs 1.1–1.4) as near-identical pale grey line art on a pale card on pale paper.
   - At 390 px the part each figure is "about" is a few pixels of slightly darker line.
   - Every figure needs a 3-line caption to explain what you are looking at ("The end of the eval line. Cards that pass roll on…"). **A figure that needs a paragraph to be understood isn't telling the story; the paragraph is.**
   - The one real interaction ("PICK A CARTRIDGE ← →, SPACE TO RUN") is hidden in a 12 px uppercase corner label (fails UX-F3, UX-FL2).
   - Scrolling never changes the bench, so it doesn't progress with the story.

4. **Résumé-as-content** (fails UX-CS1, UX-SP1).
   - Field is two job entries with date ranges, company names and a chip.
   - Work opens with a résumé line: `BulkMagic, Inc · Software Engineer · New York (remote) · Aug 2024–present`. Four metric tiles follow, and their body copy repeats the label ("Seller activation… Seller activation, via a stateful LangGraph…").
   - Then a **40-item Toolbox** in four columns (fails UX-M1, UX-H1).
   - The footer is degree fine print.
   - Nowhere is there a situation, a tension, a decision Rohan made, or what it changed for a person. There are **no case-study pages at all**, so nothing can be explored in depth.

5. **No peak** (fails UX-PE1).
   - The hero is the most intense moment, and intensity only falls after it.
   - The biggest number on the page is "6,501" (RLHF annotations audited). It is set in mono in the middle of Research, next to a pill.
   - No full-bleed moment, no change in colour temperature, no scroll-linked sequence, no "aha".
   - The thesis "AI used fully leads to an amazing future" never appears.

6. **The ending deflates** (fails UX-PE2, UX-GG2, UX-SP1).
   - The page gets *longer* towards the end: For fun is 3,210 px at desktop and 37% of the phone page.
   - It is a stack of four containers:
     - the DecentralMem card with a stack table
     - a ruled "Lab notebook" card
     - a "From the workbench" project table that **lists BharatEdge-Eval a second time**
     - "More on GitHub"
   - Then a generic dark slab: "Building something with models in it? Let's talk." with three links, and a mono footer of degree names.
   - The last thing a reader sees is "B.Tech in Information Technology, Maharaja Agrasen Institute of Technology, 2018–22".
   - No callback to the bench, no future, no designed final moment.

7. **The message is defensive, not visionary** (fails the brief).
   - H1 "I make AI models dependable." The thesis "models change, the engineering around them holds". Vocabulary: guardrails, retry, fallback, no-go, bin, return chute.
   - The page is about AI *failing* and being caught.
   - The brief is optimism: AI used fully → an amazing future. v1 has no image of that future, and no "what this unlocks for people" anywhere.

8. **Box-and-pill chrome** (fails UX-CR1, UX-SI1).
   - At least seven bordered rounded containers: figure cards, metric tiles, DecentralMem card, lab-notebook card, chips, status pills ("Independent research · Paper in preparation", "Early release", "Phase 0 spike"), and the NeurIPS pill.
   - Everything is grouped, so grouping means nothing.
   - The chips look like buttons and aren't.

9. **Flat, low-contrast value range** (fails UX-VR1, UX-PR1).
   - Paper #f4f2ec, figure cards a shade lighter, grey line art, grey 12–13 px captions, and a muted teal used for *every* emphasis (numerals, eyebrows, metric values, links, pills).
   - Squinting at any screen gives one beige mass. Nothing is isolated, so nothing is remembered.
   - The only real contrast change is the dark contact slab, which arrives as an abrupt colour flip, not as an earned moment.

10. **Motion has no meaning** (fails UX-SA1 spirit; §4 R-M).
    - The only scroll motion is the same 12 px fade-up on every block. That is the default "AI-generated landing page" reveal.
    - It says nothing about time passing, models swapping or the future arriving.
    - In a full-page capture the Contact block came out empty, which suggests the content is gated on the reveal observer. This must be verified, and a capture or print must never miss content (UX-PE3).

11. **Jakob's and Fitts's slips in navigation** (fails UX-J3, UX-F1).
    - The nav reads `01 Field 2021 · 02 Research 2022–24 · 03 Work 2024–now · 04 For fun now` in mono. "Field" is a private metaphor: a recruiter doesn't know it means "first jobs".
    - The name and Contact links are 28 px tall.
    - The phone menu works, but the rail's year labels add a second line of mono noise.

12. **Hierarchy by size soup** (fails UX-CL1).
    - 16 font sizes, including a fluid 58.9 px H1 next to 72 px, 96 px and 48 px mono numerals.
    - Display type is Geist at every level, so headings, chapter titles and body differ only in size.
    - There is no typographic voice: Geist + Geist Mono is the default Next.js starter pairing, which is itself a slop marker in 2026.

### What v1 got right (keep)
- Facts come from the résumé with no inflation, and no phone number anywhere.
- Real outcome numbers exist (−40%, −30%, days → minutes, 6,501, NeurIPS 2024). They are the raw material for a peak.
- Accessible basics: skip link, `<details>` menu without JS, reduced-motion handling in `Reveal`, 13 px floor for text.
- The isometric object *idea* can be a narrator. It needs to become operable and change across the story (§4 R-S3).

---

## 4. Anti-slop rules

### 4.1 Banned patterns (any one fails review)

| ID | Banned | Why |
|---|---|---|
| B1 | The same section skeleton used for more than 2 consecutive story beats (eyebrow + numeral + H2 + figure card + caption, or any repeat) | Template tell (v1 #1) |
| B2 | Mono for anything that isn't code, a command, a file name or a data value. No mono eyebrows, nav, footers, figure stamps or chips. | v1 #2 |
| B3 | Uppercase letter-spaced eyebrows above every heading ("ROHAN PANT · ENGINEER", "TOOLBOX", "LAB NOTEBOOK") | Label-heavy slop |
| B4 | Numbered section labels (`01`, `02`…) as decoration | Chiang-template tell |
| B5 | Rounded bordered cards as the default container. More than 1 card style on the home page. Cards inside cards. | v1 #8 |
| B6 | Tech chips/pills (`Python` `NLP`) on the home page; skill grids or "Toolbox" lists of > 7 items | Résumé-as-content |
| B7 | Metric tiles in a 2×2 grid with label → big number → paragraph that repeats the label | Dashboard-slop |
| B8 | The same fade-up-on-enter on every block. Staggered "reveal" with no narrative reason. | Motion without meaning |
| B9 | Decorative figures that need a caption to explain them, or "Fig x.y" stamps with no referent in the text | v1 #3 |
| B10 | Generic AI-site visuals: purple/blue gradients, glowing orbs, particle networks, neural-net line art, sparkles ✦, glassmorphism, cursor-glow spotlights, bento grids, marquee logo strips, "✨ AI-powered" | 2024–26 AI aesthetic |
| B11 | Fake interfaces as the conceit: terminal prompts, fake OS windows, fake code editors, fake chat transcripts | Template genre (§1.13) |
| B12 | Résumé fine print (degrees, institution names, date ranges) as the last thing on the page | Weak end |
| B13 | Content duplicated across sections (a project listed twice) | Padding |
| B14 | Default type pairings: Geist/Geist Mono, Inter/JetBrains Mono, Space Grotesk, used as-is | Starter-kit tell |
| B15 | Copy tics: "I build X that Y", "Let's talk.", "Building something…?", "Passionate about", "Crafting", "Seamless", em-dash triads, "not just X, but Y" | LLM copy |
| B16 | Scrolljacking, smooth-scroll libraries that change wheel physics, horizontal pinned sections longer than 1 viewport | UX-J1 / UX-FL1 |
| B17 | Autoplay sound, or sound on by default | Postel / Jakob |
| B18 | Loaders or intro animations longer than 1 s before content | Doherty / Flow |

### 4.2 Required signals of craft (all must be present)

| ID | Signal | Concrete bar |
|---|---|---|
| R-T1 | **Custom typographic system** | A display face with character, plus a text face; optional mono only for data. A named scale of ≤ 6 steps with a ≥ 1.333 ratio at the top end; the display size at desktop ≥ 6× body. Defined roles: display, H2, body, caption, data. Tracking and leading set per role, not defaults. Numerals: tabular for data, old-style or proportional in prose. Documented in the spec as a table. |
| R-T2 | **Typography as image** | At least one beat where type *is* the visual: set at viewport scale, interacting with the figure or the grid. |
| R-G1 | **Intentional grid** | A 12-column grid with a stated baseline, plus **exactly 1–2 deliberate grid breaks**: full-bleed or off-grid, at the peak and/or the hero. Every break is listed in the spec with its reason. |
| R-G2 | **Phone has its own composition** | 390 px is designed, not stacked. At least the hero and the peak have phone-specific layouts (Lynn Fisher §1.10). |
| R-S1 | **One signature interaction** | A single interaction people would describe to a friend. Rules: it is tied to the thesis; it is operable by keyboard and touch; it has a visible affordance; it responds < 100 ms; it has a static fallback. Only one. Everything else is quiet. |
| R-S2 | **Meaningful motion** | Every animation answers "what changed in the story?" Motion map in the spec: trigger → what moves → narrative meaning → reduced-motion equivalent. Scroll-linked motion is tied to the passage of time or the AI "unlocking" something. Durations come from a token set (e.g. 120/240/480 ms) with named easings. |
| R-S3 | **The narrator object changes** | If a central object (the bench or a successor) is used, it visibly *changes state* across chapters: it grows, gains parts, runs faster, opens up. The reader sees progress and does not re-see the same drawing. |
| R-C1 | **Real content density** | Each case study has ≥ 400 words of specific narrative, ≥ 1 real artefact (diagram, screenshot, eval chart, code excerpt, paper figure) and ≥ 1 decision with its trade-off. The home page features ≤ 4 projects in depth rather than many shallowly. |
| R-C2 | **Specific nouns** | Every claim names a concrete thing: a model, a dataset, a number, a user. No adjectives standing in for evidence. |
| R-P1 | **A designed peak** | One moment at 55–80% of the scroll: the thesis ("AI used fully → an amazing future") made visible. It is the only full-bleed, highest-contrast, largest-type moment. It is ideally the signature interaction's payoff. |
| R-P2 | **A designed end** | The last viewport calls back to the opening (same object or line, now completed or transformed). It has one primary action (email) and one memorable closing line written by a human. Fine print goes into a small footer *below* that viewport. |
| R-A1 | **Sound decisions documented** | The spec states sound on or off, and why. If on: opt-in toggle, off by default, ≤ 3 sounds, respects `prefers-reduced-motion` and the mute state, ≤ 50 KB total. If off: one sentence on why. |
| R-A2 | **Cursor and focus decisions documented** | Native cursor unless a custom one has a narrative job. Focus ring designed: ≥ 2 px, ≥ 3:1 contrast, visible on every surface. |
| R-V1 | **Colour with a job** | ≤ 1 accent hue. The palette shifts temperature or value along the story (e.g. from cool past to warm future) rather than one flat beige. Every colour token has a stated role. |
| R-X1 | **Story-to-case-study continuity** | Clicking a project carries an element (title, figure, colour) into the case study via a shared-element or View Transition. Back returns to the same scroll position. |

---

## 5. Acceptance criteria

Each criterion is checked by an agent in Playwright (Chromium) at **1440×900** and **390×844** against the production build served from `out/`. "Lighthouse" means the Lighthouse CLI run on the static build with mobile emulation (Moto G Power, slow 4G) unless stated. All must pass.

### 5.1 Storytelling
| ID | Criterion | How to verify |
|---|---|---|
| S1 | The hero states who Rohan is and the thesis in ≤ 8 words of H1, plus ≤ 30 words of lead. The thesis is optimistic about AI's future, not only defensive. | Read `h1` and the first `p`; count words. |
| S2 | The story has ≥ 4 beats in chronological or causal order. Each beat has a one-line "turn" a reviewer can paraphrase. No two consecutive beats share a layout skeleton (B1). | Snapshot section structures; screenshot each. |
| S3 | Exactly one peak section at 55–80% of the document height that owns the page's largest font size and is the only full-bleed block. | `scrollHeight` and section offsets; `max(fontSize)` owner; check `width === innerWidth`. |
| S4 | The last viewport contains a callback to the hero object or line, one primary email action, and a closing line. No degree or institution text in it. | Scroll to bottom, screenshot, read the text. |
| S5 | ≥ 3 case-study pages exist at their own URLs. Each has the Situation → Tension → Decisions → Outcome → What it unlocks headings, ≥ 400 words, ≥ 1 artefact image or figure with alt text, and a "Next project" link. | Visit each route; snapshot the headings; count words. |
| S6 | Every fact traces to `docs/RP_resume_developer.pdf` or the repo READMEs. No phone number anywhere: HTML, metadata, JSON-LD, OG image. | `grep -rE '\+?\d[\d\s-]{8,}' out/` returns nothing phone-like; spot-check claims. |
| S7 | No banned pattern from §4.1. | Checklist pass with screenshots; script: % of mono text nodes ≤ 5% and only inside `code, kbd, samp, data, [data-mono]`. |

### 5.2 UX
| ID | Criterion | How to verify |
|---|---|---|
| U1 | All §2 rules pass. A failing rule ID blocks release. | Run the §2 tests. |
| U2 | Targets: every non-inline control is ≥ 44×44 at 390. Inline links have ≥ 24 px target height. | Script over `a, button, [role=button], summary`. |
| U3 | No scrolljacking: a wheel of 100 px moves `scrollY` 90–110 px everywhere, including the peak. | `page.mouse.wheel(0,100)` at 10 points. |
| U4 | Navigation: ≤ 5 top-level items, plain-word labels, visible on both widths (menu at 390). The current chapter is indicated (`aria-current`). | Snapshot. |
| U5 | The signature interaction is discoverable: a first-time agent triggers it within 1 attempt using only the visible hint. It is operable by keyboard (Tab + Enter/Space/arrows) and by touch tap or drag. | Keyboard-only run, then a tap run. |
| U6 | Case-study round trip: home → case study → back returns to the same scroll position (±50 px). Shared-element transition present when motion is allowed. | Record `scrollY` before and after `goBack()`. |

### 5.3 Accessibility (WCAG 2.2 AA)
| ID | Criterion | How to verify |
|---|---|---|
| A1 | axe-core: **0 serious or critical** violations on every route at both widths and in both colour schemes. | Inject axe and run `axe.run()`. |
| A2 | Contrast: body and UI text ≥ 4.5:1; large text ≥ 3:1; non-text UI and focus indicators ≥ 3:1 (1.4.3, 1.4.11). This includes text over figures and the peak. | axe, plus manual sampling of text over images and canvas. |
| A3 | Keyboard: every interactive element is reachable in DOM order. Focus is always visible and **never obscured** by the sticky header (2.4.11). No keyboard trap (2.1.2). A skip link is the first focusable element. | Tab through the page; screenshot focus at each stop; check the focus rect vs the header rect. |
| A4 | Target size ≥ 24×24 CSS px or spaced per 2.5.8. The project rule (U2) is stricter. | Script. |
| A5 | Every figure or canvas has a text alternative that carries the *same story point*, not "isometric illustration". Interactive figures expose state changes via `aria-live="polite"` (≤ 1 announcement per action). | Snapshot the accessibility tree; trigger the interaction; read the live region. |
| A6 | Heading outline: one `h1` per page, no skipped levels. Landmarks: `header`, `nav`, `main`, `footer`. `lang="en"`. | Snapshot. |
| A7 | Reflow at 320 px and zoom at 200% with no horizontal scroll and no lost content (1.4.10, 1.4.4). Text-spacing override (1.4.12) does not clip. | Resize to 320; set zoom; inject the text-spacing CSS; check `scrollWidth ≤ innerWidth`. |
| A8 | Content never depends on JS or the reveal: with JS disabled, all story text and links render, and figures show static stills. A full-page screenshot shows every section filled. | `javaScriptEnabled:false` context; full-page screenshot. |
| A9 | Motion that starts automatically and lasts > 5 s can be paused (2.2.2). Nothing flashes > 3×/s (2.3.1). | Watch for 10 s; find the pause control. |
| A10 | Sound (if any) is off by default and toggleable from the keyboard, and the toggle has an accessible name and state (`aria-pressed`). | Snapshot. |

### 5.4 Performance (Core Web Vitals, at the 75th percentile, mobile)
| ID | Criterion | How to verify |
|---|---|---|
| P1 | **LCP ≤ 2.5 s** (target ≤ 1.8 s) on Lighthouse mobile for `/` and each case study. The LCP element is text or a preloaded still, not a WebGL canvas. | Lighthouse JSON `largest-contentful-paint`. |
| P2 | **INP ≤ 200 ms** (target ≤ 100 ms) for the signature interaction, the menu and the case-study links. | Playwright + `web-vitals` `onINP` with `reportAllChanges`, after 10 interactions each. |
| P3 | **CLS ≤ 0.1** (target ≤ 0.02), including during font swap and the reveal. | Lighthouse plus a `PerformanceObserver('layout-shift')` during a full scroll. |
| P4 | Lighthouse Performance ≥ 90 mobile; Accessibility = 100; Best Practices ≥ 95; SEO ≥ 95. | Lighthouse CLI. |
| P5 | Budgets (compressed): initial JS ≤ 150 KB on `/`; fonts ≤ 2 families, ≤ 4 files, ≤ 120 KB, subset, `font-display: swap` with metric-matched fallbacks; any 3D/WebGL bundle loads after LCP and only on interaction or visibility; total `/` transfer ≤ 1 MB (excluding opt-in audio). | `browser_network_requests` summed by type. |
| P6 | Scroll smoothness: no long task > 50 ms during a scripted top-to-bottom scroll on 4× CPU throttling; the signature interaction holds ≥ 50 fps. | Performance trace with CPU throttling; check long tasks and frame times. |

### 5.5 Motion (reduced-motion parity)
| ID | Criterion | How to verify |
|---|---|---|
| M1 | Under `prefers-reduced-motion: reduce`, **every story beat and every state of the signature interaction is still reachable and understandable**. Motion is replaced by an instant state change, a crossfade ≤ 150 ms, or a static still, never removed along with its meaning. | `emulate_media reducedMotion:'reduce'`; walk the story; screenshot each beat; compare information against the motion version. |
| M2 | Under reduced motion: no parallax, no scroll-linked transforms, no auto-playing loops, no shared-element morphs. Transitions ≤ 150 ms opacity only. | Script: computed `transition-duration` and `animation-name` on all elements. Any non-opacity animation > 0 fails. |
| M3 | With motion allowed, every animation is listed in the motion map (R-S2) with a narrative reason. Durations come from the token set. No animation > 800 ms except the one peak sequence (≤ 2.5 s, interruptible). | Diff `document.getAnimations()` against the spec's motion map. |
| M4 | Off-screen animations pause (IntersectionObserver or `animation-play-state`), and a backgrounded tab stops the rAF loops. | Scroll a figure off-screen; `getAnimations()` play state; Page Visibility test. |
| M5 | Motion never blocks input: scroll, tab and click work during any animation. | Interact mid-animation. |

---

## Appendix: sources
- Awwwards portfolio category: https://www.awwwards.com/inspiration_search/winner_category_portfolio/
- Awwwards site pages: [Bruno's Portfolio](https://www.awwwards.com/sites/brunos-portfolio) · [Jesper Landberg](https://www.awwwards.com/sites/jesper-landberg-4) · [AW Portfolio](https://www.awwwards.com/sites/aw-portfolio) · [Elliott Mangham](https://www.awwwards.com/sites/elliott-mangham) · [Gianluca Gradogna](https://www.awwwards.com/sites/gianluca-gradogna-portfolio) · [Grégory Lallé](https://www.awwwards.com/sites/gregory-lalle-24) · [Olha Lazarieva](https://www.awwwards.com/sites/olha-lazarieva)
- Bruno Simon case study: https://www.awwwards.com/brunos-portfolio-case-study.html
- Laws of UX: https://lawsofux.com/
- NN/g: [Peak-End rule](https://www.nngroup.com/articles/peak-end-rule/) · [Touch target size](https://www.nngroup.com/articles/touch-target-size/)
- WCAG 2.2: https://www.w3.org/TR/WCAG22/ · Core Web Vitals thresholds: https://web.dev/articles/vitals
- The other sources are cited inline in §1.
