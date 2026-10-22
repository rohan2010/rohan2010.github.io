import type { SceneId, SceneMeta } from "./schema";

// The scene registry (MASTER §2). Page order, years, era and layout for each
// scene. Lead-owned: the ruler, the --era drift and scene 1's map read this.

export const scenes = [
  { id: "objection", n: 0, title: "The objection", year: 1843, yearTo: null, yearLabel: "1843", era: 0, beat: "curiosity", layout: "statement", owner: "1A" },
  { id: "ruler", n: 1, title: "180 years of helpful machines", year: 1843, yearTo: 2026, yearLabel: "1843 → 2026", era: 0.06, beat: "momentum", layout: "map", owner: "1A" },
  { id: "handwriting", n: 2, title: "Reading handwriting", year: 1989, yearTo: 2021, yearLabel: "1989 ↔ 2021", era: 0.2, beat: "recognition", layout: "split", owner: "1A" },
  { id: "collaborative", n: 3, title: "Collaborative", year: 1992, yearTo: 2021, yearLabel: "1992 ↔ 2021", era: 0.32, beat: "warmth", layout: "sheet", owner: "1A" },
  { id: "taught", n: 4, title: "What are they taught?", year: 1890, yearTo: 2024, yearLabel: "1890 ↔ 2024", era: 0.45, beat: "tension", layout: "centered", owner: "1B", work: "value-imprint" },
  { id: "act", n: 5, title: "Machines that act", year: 2023, yearTo: 2026, yearLabel: "2023 ↔ now", toLabel: "now", era: 0.65, beat: "peak", layout: "peak", owner: "1B" },
  { id: "memory", n: 6, title: "Memory that travels", year: 2024, yearTo: 2026, yearLabel: "2024 ↔ now", toLabel: "now", era: 0.82, beat: "delight", layout: "card", owner: "1C", work: "decentralmem" },
  { id: "everyone", n: 7, title: "Next, for everyone", year: 2026, yearTo: 2027, yearLabel: "next", toLabel: "next", era: 0.94, beat: "hope", layout: "solo", owner: "1C", work: "bharat-edge" },
  { id: "your-year", n: 8, title: "Your year", year: 2027, yearTo: null, yearLabel: "2027", era: 1, beat: "invitation", layout: "closing", owner: "1C" },
] as const satisfies readonly SceneMeta[];

export const sceneById = (id: SceneId): SceneMeta => {
  const scene = scenes.find((s) => s.id === id);
  if (!scene) throw new Error(`Unknown scene id "${id}"`);
  return scene;
};

/** First and last years on the ruler's scale; past LAST_YEAR the ruler is blank paper. */
export const FIRST_YEAR = 1843;
export const LAST_YEAR = 2026;

// Build-time guards: order, monotone era, no two adjacent scenes share a layout
// (craft-bar B1 / UX-SI2), exactly one peak.
scenes.forEach((scene, index) => {
  if (scene.n !== index) throw new Error(`scenes.ts: ${scene.id} has n=${scene.n}, expected ${index}`);
  const prev = scenes[index - 1];
  if (prev && prev.layout === scene.layout) throw new Error(`scenes.ts: ${prev.id} and ${scene.id} share layout "${scene.layout}"`);
  if (prev && prev.era > scene.era) throw new Error(`scenes.ts: --era must not fall (${prev.id} → ${scene.id})`);
});
if (scenes.filter((s) => s.layout === "peak").length !== 1) throw new Error("scenes.ts: exactly one peak layout");
