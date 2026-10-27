import type { ComponentType } from "react";
import { BrassRing } from "./brass-ring/BrassRing";
import { Naive as BrassNaive } from "./brass-ring/Naive";
import { DecodeHeadline } from "./decode-headline/DecodeHeadline";
import { Naive as DecodeNaive } from "./decode-headline/Naive";
import { DotGrid } from "./dot-grid/DotGrid";
import { Naive as GridNaive } from "./dot-grid/Naive";
import { DotTerrain } from "./dot-terrain/DotTerrain";
import { LivingPaper } from "./living-paper/LivingPaper";
import { Naive as PaperNaive } from "./living-paper/Naive";
import { Naive as SpotlightNaive } from "./spotlight-cards/Naive";
import { SpotlightCards } from "./spotlight-cards/SpotlightCards";

// Each Playground item's running preview, keyed by its folder in src/content/playground/.
// `before` is an earlier or naive version, when showing it teaches something; `label` names
// its tab (default "My first try").
type Before = { Preview: ComponentType; note: string; label?: string };

export const PREVIEWS: Record<string, { now: ComponentType; before?: Before }> = {
  "dot-terrain": { now: DotTerrain },
  "dot-grid": {
    now: DotGrid,
    before: {
      Preview: GridNaive,
      label: "The obvious version",
      note: "A grid of a few thousand spans, each growing on hover. Only the dot under the cursor reacts, there's no trail, and at rest it's dead.",
    },
  },
  "brass-ring": {
    now: BrassRing,
    before: {
      Preview: BrassNaive,
      label: "The obvious version",
      note: "Metal with nothing around it to reflect. Same ring, same colour, one light and an ambient.",
    },
  },
  "living-paper": {
    now: LivingPaper,
    before: {
      Preview: PaperNaive,
      label: "The obvious version",
      note: "Full resolution, no grain, stretched noise, colours not encoded, and nothing keeps the text clear.",
    },
  },
  "spotlight-cards": {
    now: SpotlightCards,
    before: {
      Preview: SpotlightNaive,
      label: "The obvious version",
      note: "Each card keeps the pointer in React state, so every move re-renders it. The glow is a box-shadow halo, the tilt snaps, and the light drops out in the gaps between cards.",
    },
  },
  "decode-headline": {
    now: DecodeHeadline,
    before: {
      Preview: DecodeNaive,
      label: "The obvious version",
      note: "The heading's own text is scrambled on a timer. Watch the line rewrap as it runs; a screen reader would read the gibberish.",
    },
  },
};
