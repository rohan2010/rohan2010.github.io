"use client";

import { DitherGrid } from "@/home/DitherGrid";
import "./dot-grid.css";

// The home page's dot grid in a box of its own: the same component, with the scroll fade off,
// under a sample hero. The copy is made up.
export function DotGrid() {
  return (
    <div className="dg">
      <DitherGrid fadeOnScroll={false} className="dg-canvas" />
      <div className="dg-copy">
        <p className="dg-kicker">Field notes · for researchers</p>
        {/* A p, not an h1: the page around the preview has its own. On a real page it's the h1. */}
        <p className="dg-title">
          Every interview, sorted before you’re <em>home</em>.
        </p>
        <p className="dg-sub">Record the call. The quotes, themes and follow-ups are waiting when you open your laptop.</p>
        <p className="dg-actions">
          <button type="button" className="btn">
            Start a study
          </button>
          <span className="dg-hint">Move your cursor over the grid</span>
        </p>
      </div>
    </div>
  );
}
