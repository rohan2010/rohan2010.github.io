"use client";

import { useState } from "react";
import { PREVIEWS } from "./previews";

// The running component, with a switch to an earlier or naive version when there is one.
export function Preview({ slug }: { slug: string }) {
  const { now: Now, before } = PREVIEWS[slug];
  const [showBefore, setShowBefore] = useState(false);

  return (
    <div className="pg-preview">
      {before && (
        <div className="pg-switch" role="group" aria-label="Version">
          <button type="button" aria-pressed={!showBefore} onClick={() => setShowBefore(false)}>
            Now
          </button>
          <button type="button" aria-pressed={showBefore} onClick={() => setShowBefore(true)}>
            {before.label ?? "My first try"}
          </button>
        </div>
      )}
      {showBefore && before ? (
        <div className="pg-before">
          <before.Preview />
          <p className="pg-before-note">{before.note}</p>
        </div>
      ) : (
        <Now />
      )}
    </div>
  );
}
