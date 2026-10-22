import type * as React from "react";
import { FIRST, pos, ticks } from "./scale";
import { RulerLive } from "./RulerLive";

// The year ruler (MASTER §4). Lead-owned. Rendered once, on the home page,
// before <main>. aria-hidden: the years live in the scene headings.
// - Desktop (≥ 768): a fixed 72 px gutter, 1843 at the top, the scale
//   stretching toward 2026, then blank paper.
// - Phone: a sticky odometer strip at the top with a page-progress line.
// It is driven by the registered scenes ([data-scene] sections) and drives
// --era on <html>. Static ticks render on the server; RulerLive moves the pointer.

const TICKS = ticks();
const DIGITS = "0123456789".split("");

export function Ruler() {
  const first = String(FIRST).split("");
  return (
    <>
      <div className="ruler" aria-hidden="true" data-ruler="">
        <div className="ruler-track" data-ruler-track="">
          {TICKS.map((tick) => (
            <span
              key={tick.year}
              className="ruler-tick"
              data-major={tick.major ? "" : undefined}
              style={{ top: `${(tick.at * 100).toFixed(3)}%` }}
            >
              {tick.label ? <span className="ruler-label t-year">{tick.label}</span> : null}
            </span>
          ))}
          <span className="ruler-blank" style={{ top: `${(pos(2026.5) * 100).toFixed(3)}%` }} />
          <span className="ruler-span" data-ruler-span="" />
          <span className="ruler-pointer" data-ruler-pointer="">
            <span className="ruler-pointer-year t-year" data-ruler-year="">
              {FIRST}
            </span>
          </span>
        </div>
      </div>
      <div className="strip" aria-hidden="true" data-strip="">
        <span className="odometer t-year" data-odometer="">
          {first.map((digit, index) => (
            <span key={index} className="odo-digit">
              <span className="odo-reel" style={{ "--d": Number(digit) } as React.CSSProperties}>
                {DIGITS.map((d) => (
                  <span key={d}>{d}</span>
                ))}
              </span>
            </span>
          ))}
        </span>
        <span className="strip-label t-year" data-strip-label="">
          {FIRST}
        </span>
        <span className="strip-progress">
          <span className="strip-bar" data-strip-bar="" />
        </span>
      </div>
      <RulerLive />
    </>
  );
}
