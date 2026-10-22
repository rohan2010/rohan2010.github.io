// The content contract for v2 "Rhymes". Every workstream imports its types
// from here. Lead-owned: ask the lead before changing a type.
//
// Truth rules (MASTER §2):
// - Every history claim is a Source in src/content/sources.ts, cited by id.
// - Every Rohan claim comes from the résumé or the code, as the dossiers record it.
// - Never invent text to fill a field. A field that Rohan must supply is `null`
//   and its section is hidden until he does (WorkPage.learned).

/* ---------- Scenes (home page) ---------- */

/** Ids of the nine home-page scenes, in page order. Also their DOM anchors. */
export const SCENE_IDS = [
  "objection",
  "ruler",
  "handwriting",
  "collaborative",
  "taught",
  "act",
  "memory",
  "everyone",
  "your-year",
] as const;
export type SceneId = (typeof SCENE_IDS)[number];

/** The narrative beat of a scene (concepts.md §2). */
export type Beat = "curiosity" | "momentum" | "recognition" | "warmth" | "tension" | "peak" | "delight" | "hope" | "invitation";

/**
 * Layout variants. Each is a different composition on the 12-column grid, so
 * adjacent scenes never share one (enforced in src/content/scenes.ts).
 * - `statement`     type is the image: one large line, set left (scene 0)
 * - `map`           narrow text + a list of rows across the grid (scene 1)
 * - `split`         figure left (cols 1–7), text right (cols 8–12) (scene 2)
 * - `sheet`         one wide sheet across the grid, text set beside it below (scene 3)
 * - `centered`      a centred figure over a centred column of text; the pinnable one (scene 4)
 * - `peak`          full-bleed, the page's largest type; only one per page (scene 5)
 * - `card`          figure card left (cols 1–8), narrow note column right (scene 6)
 * - `solo`          one small object in empty space, text offset right (scene 7)
 * - `closing`       the ending: card across, then one column of actions (scene 8)
 */
export type SceneLayout = "statement" | "map" | "split" | "sheet" | "centered" | "peak" | "card" | "solo" | "closing";

export interface SceneMeta {
  id: SceneId;
  /** 0–8, page order */
  n: number;
  /** Short plain title (also used in scene 1's map and as the section's accessible name fallback) */
  title: string;
  /** The historical year the scene opens on (the ruler's start for this scene) */
  year: number;
  /** The year it rhymes forward to; null when the scene is one moment */
  yearTo: number | null;
  /** How the years are written for people: "1989 ↔ 2021", "2023 ↔ now", "next" */
  yearLabel: string;
  /** Ruler/odometer text override for yearTo (e.g. "now", "next"); defaults to the number */
  toLabel?: string;
  /** --era at the top of this scene (0 = sepia 1843, 1 = teal present). Monotone down the page. */
  era: number;
  beat: Beat;
  layout: SceneLayout;
  /** Owning workstream (MASTER §6) */
  owner: "1A" | "1B" | "1C";
  /** The project page this scene links to, if any ("How it's built →") */
  work?: WorkSlug;
}

/* ---------- Sources (history facts) ---------- */

export interface Source {
  /** stable id, cited from scenes and work pages: `sources.lovelace-note-g` */
  id: string;
  /** the claim exactly as the page may state it */
  claim: string;
  /** human-readable citation */
  source: string;
  url: string;
  /** checked with a web search on `checked`; false = do not state it as written */
  verified: boolean;
  checked: string;
  /** caveats, wording limits, what NOT to say */
  note?: string;
}

/* ---------- Work pages (/work/<slug>/) ---------- */

/** Slugs that have a full page. Add a slug here and a file in src/content/work/. */
export type WorkSlug = "bloomscroll" | "conductor" | "decentralmem" | "value-imprint" | "bharat-edge";

/** Paragraphs of prose. Case-study paragraphs ≤ 90 words each (craft-bar UX-CH1). */
export type Prose = string[];

export interface Ancestor {
  /** year of the historical rhyme */
  year: number;
  /** 3–4 sentences: what the rhyme was and what changed since */
  text: string;
  /** Source ids from src/content/sources.ts backing every claim in `text` */
  sources: string[];
}

export interface Decision {
  /** the fork, as a question: "Where does the truth live?" */
  fork: string;
  /** the path taken (drawn solid) */
  taken: string;
  /** the path not taken (drawn dotted) */
  notTaken: string;
  /** why, with the trade-off */
  why: string;
}

export interface ArchNode {
  id: string;
  label: string;
  /** its job in one line */
  job: string;
  /** what crosses it (shown when the layer is opened) */
  detail?: string;
  /** layer order for the exploded view, 0 = top */
  layer?: number;
  /** honest build state from the dossier; "stub" nodes must say so on the page */
  state?: "done" | "stub" | "external";
}

export interface ArchEdge {
  from: string;
  to: string;
  label?: string;
}

export interface Architecture {
  nodes: ArchNode[];
  edges: ArchEdge[];
}

/** A stated outcome. `value` only when the source states a number. */
export interface Outcome {
  value?: string;
  text: string;
}

export interface WorkLink {
  label: string;
  href: string;
  kind: "code" | "paper" | "live" | "other";
}

export interface WorkPage {
  slug: WorkSlug;
  title: string;
  /** one plain-language sentence: what it does for a person (UX-T1) */
  oneLine: string;
  /** "Personal project", "Team paper, 2nd of 5 authors" … */
  role: string;
  /** "2024–now" */
  dates: string;
  /** the year it sits at on the ruler (mini ruler, next/prev order) */
  year: number;
  /** the home scene it continues, for the View Transition back */
  scene?: SceneId;
  ancestor: Ancestor;
  situation: Prose;
  tension: Prose;
  decisions: Decision[];
  architecture: Architecture;
  /** Rohan's words only. null = section hidden. Never fill with invented text. */
  learned: string[] | null;
  outcome: Outcome[];
  /** what it unlocks next (the future beat of the arc) */
  unlocks: Prose;
  /** honest status in plain words: "Phase 0 spike, no live run yet" */
  status: string;
  links: WorkLink[];
}

/** Archive entries on /work/: résumé-only or team projects, no full page. */
export interface ArchiveEntry {
  name: string;
  year: string;
  line: string;
  /** e.g. "Team project" */
  credit?: string;
  href?: string;
}
