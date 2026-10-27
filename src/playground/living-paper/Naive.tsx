"use client";

import { PaperStage } from "./LivingPaper";

// The obvious version, same shader and copy: full resolution at the device's density, no cap on
// the frame rate, six octaves, plain uv so the noise stretches with the stage, raw seconds for
// time, linear colours written out without encoding (darker than the page around it), no grain,
// no calm patch behind the words, and a lens that snaps to the pointer.
export function Naive() {
  return <PaperStage naive />;
}
