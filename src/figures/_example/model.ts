// The figure's pure model: progress → pose and readout. No DOM. Imported by the
// client component, and by the server for the resting readout.

/** Feed fraction for scroll progress p: the card starts moving at 15%, lands at 85%. */
export function feedAt(progress: number) {
  const t = Math.min(1, Math.max(0, (progress - 0.15) / 0.7));
  return t * t * (3 - 2 * t); // smoothstep: the card eases off the stack and onto the tray
}

export function readoutOf(progress: number) {
  const f = feedAt(progress);
  if (f <= 0) return "card 1 · in the hopper";
  if (f >= 1) return "card 1 · on the tray";
  return `card 1 · feeding ${Math.round(f * 100)}%`;
}
