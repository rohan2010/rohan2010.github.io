# Home page plan: "Rohan's desk"

Decided 2026-10-25: concept **Your desk**; style **isometric, crafted** (SVG, using the `anatomy`
skill); audience **recruiters and engineers equally**. Real objects only: **controller / Steam Deck,
mechanical keyboard, a plant** (confirm). No drink on the desk unless Rohan says what it is.

## The idea
The home page is Rohan's desk, drawn as a precise isometric model. Every object is a way in: hover
lifts it and shows a label, click opens it. Underneath sits the same content as a plain list, so a
recruiter can skip the desk entirely and still get everything in 10 seconds.

## What a visitor sees (first screen)
- Top left: **Rohan Pant** · Full-stack + AI engineer · Delhi · open to roles.
- The one-liner: "I build AI that does paperwork so humans don't have to. I've mostly spent the
  free time on Steam."
- The desk, large, filling most of the screen.
- Bottom: a quiet "or skip the desk ↓" link to the list.

## Objects → content
| Object | Hover label | Click opens |
|---|---|---|
| **Monitor** (the toy agent idling on screen, log lines ticking) | "Seller onboarding agent: play it" | `/work/onboarding-agent/` |
| **Photo pinned** to a corkboard or propped up (the Chicago lakefront photo) | "Hi, that's me" | Short about: Delhi, Purdue M.S. in HCI, 3+ years, what I like building |
| **Folders**, one per project, labelled on the tabs | "Value Imprint · NeurIPS 2024", "DecentralMem", "bloomScroll" | Their case studies (or a short card until each is written) |
| **Clipboard** with a résumé | "Résumé" | The phone-free résumé PDF (once Rohan provides one) |
| **Mechanical keyboard** | "Skills" | The stack, grouped (agents & LLM ops, full-stack, data & infra) |
| **Controller / Steam Deck** | "Currently: losing to Hades" | A tiny "now playing" card. Later, optionally real Steam data via a scheduled GitHub Action |
| **Sticky note** on the monitor | "Say hi" | Email, LinkedIn, GitHub |
| **Plant** | Just a plant. Clicking waters it | Purely for delight |
| **Stack of tickets / boarding passes** | "How I got here" | Short trail: MAIT Delhi → CONCOR → Let's Dunch (remote, Dubai) → Purdue → day job → now |

## The plain list (below the desk; also what phones lead with)
Name, line, then: Work (4 lines with links) · How I got here (one line each) · Skills · Contact.
It's the accessible version too: screen readers, keyboard users and JS-off all get this.

## Phone
The full desk is too small to click at 390px. On phones: a cropped close-up of the desk as a header
image (not interactive), then the plain list. (Decide after seeing it; maybe the objects can stack.)

## Motion (small, physical, never decorative)
Objects lift a few pixels with a shadow on hover. The monitor's log ticks slowly. Clicking the plant
makes it perk up. Nothing moves on its own beyond that; reduced motion turns it all off.

## Build order (show Rohan after each)
1. **Draw the desk** with all objects, static, no interaction. Rohan checks it looks like *his* desk.
2. Hover + click wiring, the panels/links, the plain list.
3. Phone layout, reduced motion, keyboard, light/dark. Check in a real browser.
4. Match the case-study page's look to the desk.

## Needs from Rohan
- [ ] The "something else" on your desk: is it a plant, or something else?
- [ ] Controller or Steam Deck, and roughly what colour?
- [ ] Your keyboard: brand/colour, or just "a mechanical keyboard"?
- [ ] A phone-free résumé PDF for the clipboard (optional; it can link to LinkedIn until then).
- [ ] Is the photo from Chicago? (For the hover label or a caption.)
