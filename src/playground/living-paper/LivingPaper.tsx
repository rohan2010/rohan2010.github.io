"use client";

import { useEffect, useRef } from "react";
import { mountPaper } from "./paper";
import "./living-paper.css";

// A hero whose background moves like ink in water: a fragment shader on a three.js plane,
// mostly paper, with tobacco ink pooling at the edges and a thin brass vein running through it.
// The cursor is a soft lens that bends the flow and warms it. The words are real DOM over an
// aria-hidden canvas, and the shader keeps quiet where they sit. The copy is made up.

export function PaperStage({ naive = false }: { naive?: boolean }) {
  const stage = useRef<HTMLDivElement>(null);
  const holder = useRef<HTMLDivElement>(null);
  const copy = useRef<HTMLDivElement>(null);

  // Everything browser-only happens here, after mount, so the server render is just the markup.
  useEffect(() => mountPaper(stage.current!, holder.current!, copy.current!, naive), [naive]);

  return (
    <div className={naive ? "lp lp-naive" : "lp"} ref={stage}>
      <div className="lp-gl" ref={holder} aria-hidden="true" />
      <div className="lp-copy" ref={copy}>
        <p className="lp-title">
          Plan the week on one quiet <em>page</em>
        </p>
        <p className="lp-sub">Tasks, notes and meetings in one calm view that keeps up with your day.</p>
        <button type="button" className="lp-cta">
          Start for free
        </button>
      </div>
    </div>
  );
}

export function LivingPaper() {
  return <PaperStage />;
}
