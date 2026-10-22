import { Plate } from "@/components/iso/react/draw";
import { BenchArt } from "./art";
import { REST, readoutOf } from "./model";
import "./bench.css";

export const BENCH_KEYS = [
  { mark: "raised", label: "the seated model (raised)" },
  { mark: "lit", label: "the output being checked (lit)" },
  { mark: "dotted", label: "the retry path (dotted)" },
] as const;

export const BENCH_CAPTION =
  "A test bench where the model is the swappable part: four cartridges (Claude, GPT-4o, Gemini and a local LLM) share one memory cabinet, and every output card goes through a go/no-go gauge before it ships. The tour fails one card in three on purpose to show the retry path.";

// The card alone. The hero places the legend itself, so on a phone it can
// follow the lead instead of sitting between the bench and the words.
export function BenchFigure() {
  return (
    <Plate
      fig="Fig 1"
      title="The model bench"
      hint={
        <>
          <span className="bench-hint-wide">Pick a cartridge ← →, Space to run</span>
          <span className="bench-hint-narrow">Tap a cartridge</span>
        </>
      }
      readout={readoutOf(REST)}
    >
      <BenchArt />
    </Plate>
  );
}

// The kit's legend markup (Plate's figcaption), set apart from the card.
function Swatch({ mark }: { mark: (typeof BENCH_KEYS)[number]["mark"] }) {
  if (mark === "dotted") {
    return (
      <svg className="iso-swatch" data-mark={mark} viewBox="0 0 16 10" aria-hidden="true" focusable="false">
        <path d="M1.5 5h13" />
      </svg>
    );
  }
  return (
    <svg className="iso-swatch" data-mark={mark} viewBox="0 0 16 10" aria-hidden="true" focusable="false">
      <path d="M2 4.5 8 1.5 14 4.5 14 6 8 9 2 6Z" />
      <path className="iso-swatch-crease" d="M2 4.5 8 7.5 14 4.5" />
    </svg>
  );
}

export function BenchLegend() {
  return (
    <div className="iso-legend bench-legend">
      <span className="iso-keys">
        {BENCH_KEYS.map((key) => (
          <span className="iso-key" key={key.label}>
            <Swatch mark={key.mark} />
            {key.label}
          </span>
        ))}
      </span>
      <p className="iso-caption">{BENCH_CAPTION}</p>
    </div>
  );
}
