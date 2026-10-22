"use client";

// The one place GSAP is imported and its plugins registered (tech-motion.md §3.2).
// Import gsap, ScrollTrigger, SplitText and useGSAP from "@/lib/motion", never
// from "gsap" directly, so registration and defaults always apply.

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);
  // The iOS URL bar collapsing must not refresh and jump (tech-motion §6).
  ScrollTrigger.config({ ignoreMobileResize: true });
  // Pins under Lenis: transform, not fixed (G3: CLS 1.09 → 0).
  ScrollTrigger.defaults({ pinType: "transform" });
}

export { gsap, ScrollTrigger, SplitText, useGSAP };

/** Media queries for gsap.matchMedia(). One reduced-motion query everywhere. */
export const REDUCE = "(prefers-reduced-motion: reduce)";
export const MOTION = "(prefers-reduced-motion: no-preference)";
export const PHONE = "(max-width: 767px)";
export const DESKTOP = "(min-width: 768px)";
