"use client";

import * as React from "react";
import { gsap, MOTION, REDUCE, useGSAP, useReducedMotion, useScene, useScrub } from "@/lib/motion";

// EXAMPLE client leaf (lead-owned reference, not rendered).
// 1. useScrub: scroll progress → one custom property. Pin/scrub only when motion is allowed.
// 2. useGSAP + gsap.matchMedia: a time-based, once-only event, with a static
//    end state under reduced motion. Everything is reverted on unmount.
// 3. useScene / useReducedMotion: read the scene and the setting when render needs them.
export function ExampleProgressBar() {
  const bar = React.useRef<HTMLSpanElement>(null);
  const scene = useScene();
  const reduced = useReducedMotion();

  useScrub((p) => bar.current?.style.setProperty("--p", p.toFixed(4)));

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION, () => {
        gsap.from(bar.current, { autoAlpha: 0, duration: 0.32, ease: "power2.out", scrollTrigger: { trigger: scene.element(), start: "top 70%", once: true } });
      });
      mm.add(REDUCE, () => gsap.set(bar.current, { autoAlpha: 1 }));
    },
    { scope: bar },
  );

  return (
    <span
      ref={bar}
      aria-hidden="true"
      data-reduced={reduced ? "" : undefined}
      style={{ display: "block", height: 2, background: "var(--accent)", transformOrigin: "left", transform: "scaleX(var(--p, 1))" }}
    />
  );
}
