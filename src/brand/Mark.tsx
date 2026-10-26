// The mark: an R set in 5×7 square pixels, the same squares as the hero's dither grid, with the
// last pixel of the leg lit in brass: the step that finishes the job. It is the favicon
// (src/app/icon.svg) drawn from the scheme's tokens; on hover the pixels light in a wave.
const BITMAP = ["11110", "10001", "10001", "11110", "10100", "10010", "10001"];
export const PIXELS = BITMAP.flatMap((row, r) => [...row].flatMap((on, c) => (on === "1" ? [{ r, c, last: r === 6 && c === 4 }] : [])));

export function Mark({ size = 28 }: { size?: number }) {
  return (
    <svg className="mark" width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="7" fill="var(--brand)" />
      {PIXELS.map(({ r, c, last }) => (
        <rect
          key={`${r}-${c}`}
          className={last ? "mark-px is-last" : "mark-px"}
          x={8.6 + c * 3.2}
          y={5.4 + r * 3.2}
          width="2.6"
          height="2.6"
          rx="0.4"
          style={{ "--i": r + c } as React.CSSProperties}
        />
      ))}
    </svg>
  );
}
