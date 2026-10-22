// The accelerating year scale (concepts.md §1: "the scale opens up as the
// present nears"). Pure: used by the server-rendered ticks and the live pointer.
//
// pos(year) ∈ [0, 1] down the ruler. 1843 → 0, 2026 → SCALE_END, and the rest
// (SCALE_END → 1) is blank paper: the visitor's year.

export const FIRST = 1843;
export const LAST = 2026;
export const SCALE_END = 0.86;
const PIVOT = LAST + 1.5; // log distance to just past the present
const SPAN = Math.log(PIVOT - FIRST) - Math.log(PIVOT - LAST);

export function pos(year: number): number {
  if (year <= FIRST) return 0;
  if (year <= LAST) return ((Math.log(PIVOT - FIRST) - Math.log(PIVOT - year)) / SPAN) * SCALE_END;
  // Past the present: one more year is a short step into the blank.
  return Math.min(1, SCALE_END + (year - LAST) * 0.06);
}

export interface Tick {
  year: number;
  at: number;
  major: boolean;
  label?: string;
}

/** Labelled years on the ruler. Spaced so labels never collide at 600 px tall. */
export const LABELS = [1843, 1890, 1950, 1989, 2017, 2022, 2026];

/**
 * Ticks: each tick stands for less time as the present nears (decades, then
 * 5 years, years, then quarters of a year) while the scale itself stretches,
 * so the last decade takes as much ruler as the first century.
 */
export function ticks(): Tick[] {
  const out: Tick[] = [];
  const add = (year: number) => out.push({ year, at: pos(year), major: LABELS.includes(year), label: LABELS.includes(year) ? String(year) : undefined });
  for (let y = 1850; y < 1950; y += 10) add(y);
  for (let y = 1950; y < 1990; y += 5) add(y);
  for (let y = 1990; y < 2017; y += 1) add(y);
  for (let y = 2017; y <= LAST; y += 0.25) add(y);
  for (const y of LABELS) if (!out.some((t) => t.year === y)) add(y);
  return out.sort((a, b) => a.at - b.at);
}
