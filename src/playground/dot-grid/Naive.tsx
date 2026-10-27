"use client";

import "./dot-grid.css";

// The same hero the obvious way: a CSS grid of a few thousand spans, each growing on :hover.
// Only the one dot under the cursor reacts, there's no trail, and at rest nothing moves.

const COLS = 72;
const ROWS = 38;

export function Naive() {
  return (
    <div className="dg">
      <div className="dg-naive" aria-hidden="true">
        {Array.from({ length: COLS * ROWS }, (_, i) => (
          <span key={i} />
        ))}
      </div>
      <div className="dg-copy">
        <p className="dg-kicker">Field notes · for researchers</p>
        <p className="dg-title">
          Every interview, sorted before you’re <em>home</em>.
        </p>
        <p className="dg-sub">Record the call. The quotes, themes and follow-ups are waiting when you open your laptop.</p>
        <p className="dg-actions">
          <button type="button" className="btn">
            Start a study
          </button>
          <span>{(COLS * ROWS).toLocaleString("en-GB")} DOM nodes</span>
        </p>
      </div>
    </div>
  );
}
