"use client";

import type Lenis from "lenis";
import { REDUCE } from "./gsap";

// The Lenis instance lives here so any client module can reach it without a
// context. MotionProvider sets it; nothing else should.
let current: Lenis | null = null;

export const getLenis = () => current;
export const setLenis = (lenis: Lenis | null) => {
  current = lenis;
};

export interface ScrollToOptions {
  /** px added to the target position (negative = stop above it) */
  offset?: number;
  /** jump without animating */
  immediate?: boolean;
}

/**
 * Programmatic scroll. ALWAYS use this, never window.scrollTo: with Lenis
 * running, a native scroll is pulled back to Lenis's own target (G4).
 * Accepts a y position, a selector ("#memory") or an element.
 * Under reduced motion (no Lenis) it jumps.
 */
export function scrollTo(target: number | string | HTMLElement, { offset = 0, immediate = false }: ScrollToOptions = {}) {
  if (typeof window === "undefined") return;
  if (current) {
    current.scrollTo(target, { offset, immediate, force: true });
    return;
  }
  const jump = immediate || window.matchMedia(REDUCE).matches;
  const behavior: ScrollBehavior = jump ? "instant" : "smooth";
  if (typeof target === "number") {
    window.scrollTo({ top: target + offset, behavior });
    return;
  }
  const element = typeof target === "string" ? document.querySelector<HTMLElement>(target) : target;
  if (!element) return;
  if (offset === 0) {
    element.scrollIntoView({ behavior, block: "start" }); // honours scroll-padding-top
    return;
  }
  window.scrollTo({ top: element.getBoundingClientRect().top + window.scrollY + offset, behavior });
}
