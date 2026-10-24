# Interactive desk + rohanOS

Decided 2026-10-25. Builds on `home-plan.md` (the desk). Retro OS in the **System 7** style
(1-bit black and white, so it matches the monochrome drawing). Four projects at launch.

## Adding a project = adding a folder
```
src/content/projects/<slug>/
  project.json   name, one line, year, status, links { code?, paper? }, demo?, design, caseStudy?
  README.md      what opens in the OS and on the desk's paper preview
```
The desk's folder stack and the OS desktop are both generated from this folder list. Nothing else
changes when a project is added. Files that a project doesn't have are simply not shown.

Launch set: **onboarding-agent** (demo = the toy, case study exists), **bloomscroll** (code),
**value-imprint** (paper link), **decentralmem** (code private).

## The desk (step A)
- Hover any object: it lifts a few px, its shadow grows, and a small label appears.
- Keyboard: every object is focusable in a sensible order; Enter opens it.
- Click:
  | Object | Opens |
  |---|---|
  | Monitor | **Zoom into rohanOS** |
  | Folders | A paper preview on the desk: the folder opens and shows that project's README, with a link to "open on the computer" |
  | Photo | About me (Chicago caption) |
  | Keyboard | Skills |
  | Controller | "Currently: losing to Hades" |
  | Sticky note | Email, LinkedIn, GitHub |
  | Clipboard | Résumé |
  | Tickets | How I got here |
  | Plant | It perks up. That's all |
- Below the desk: the plain list of everything, for recruiters and screen readers.

## rohanOS (step B)
- **Entering:** the page zooms toward the monitor's screen, then the OS fills the viewport, seen
  straight on. A "↩ Stand up" button and Esc go back to the desk.
- **Look:** System 7: menu bar (rohanOS · File · View · Special), 1-bit dithered desktop pattern,
  pixel folder icons, windows with striped title bars and close boxes, Chicago-like pixel font
  for chrome, a readable font for content.
- **Desktop:** one folder icon per project, plus "About Rohan" and a Trash can.
- **Project window:** lists its files: `README.md` · `code ↗` · `system design` · `demo` ·
  `case study ↗`, only those that exist.
  - README.md opens in a text window (rendered Markdown).
  - code ↗ opens GitHub in a new tab.
  - system design opens a diagram window (nodes and arrows from `project.json`).
  - demo opens the playable demo in a window (the toy for onboarding-agent).
  - case study ↗ goes to `/work/<slug>/`.
- Windows can be dragged, focused and closed. On phones, one window at a time, full screen.
- Deep links: `/#os/<slug>` opens the OS at that project, so links can be shared.

## Order of work (show Rohan after each)
1. **A:** desk hover, click and labels, paper previews and the plain list.
2. **B1:** the content folders and rohanOS (desktop, project windows, README).
3. **B2:** system design windows and the demo window.
4. Polish: zoom transition, sounds off by default, phone, reduced motion, keyboard.
