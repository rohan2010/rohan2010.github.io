"use client";

import * as React from "react";
import { gsap, ScrollTrigger, useGSAP, MOTION, PHONE, REDUCE } from "./gsap";
import { SceneContext, type SceneContextValue } from "./scene-context";

/** Live `prefers-reduced-motion: reduce`. false on the server and the first client render. */
export function useReducedMotion(): boolean {
  return React.useSyncExternalStore(
    (changed) => {
      const mq = window.matchMedia(REDUCE);
      mq.addEventListener("change", changed);
      return () => mq.removeEventListener("change", changed);
    },
    () => window.matchMedia(REDUCE).matches,
    () => false,
  );
}

/** The enclosing <Scene>: its id, years, era, layout and the section's ref. Throws outside a Scene. */
export function useScene(): SceneContextValue {
  const scene = React.useContext(SceneContext);
  if (!scene) throw new Error("useScene() must be used inside <Scene>");
  return scene;
}

export interface ScrubOptions {
  /**
   * Pin the trigger while it scrubs. "desktop" pins at ≥ 768 px only (phones
   * scroll through); "always" pins on phones too (scene 4 only, per concepts §4).
   * Pins use pinType "transform" (set as a default). Keep fixed UI out of pinned elements (G3).
   */
  pin?: false | "desktop" | "always";
  /** ScrollTrigger start. Default "top top" when pinned, else "top 80%". */
  start?: string;
  /** ScrollTrigger end on desktop. Default "+=150%" when pinned (≤ 1.5 screens), else "bottom 20%". */
  end?: string;
  /** End on phones when pinned. Default "+=100%". */
  phoneEnd?: string;
  /** true = locked to scroll (Lenis supplies the smoothing). A number adds catch-up seconds. Default true. */
  scrub?: boolean | number;
  /** Element to trigger (and pin). Default: the scene's <section>. */
  trigger?: React.RefObject<HTMLElement | null>;
  /** Progress to show under reduced motion (no pin, no scrub). Default 1: the end state. */
  reducedProgress?: number;
}

/**
 * Scroll-scrub inside a <Scene>. Calls onProgress(p), p ∈ [0, 1], on every
 * scroll update and on refresh. Under reduced motion there is no pin and no
 * scrub: onProgress(reducedProgress) is called once (and again if the setting
 * flips). Everything is reverted on unmount and on route change.
 *
 * onProgress runs every frame: write attributes/styles on refs, never setState.
 */
export function useScrub(onProgress: (progress: number) => void, options: ScrubOptions = {}) {
  const scene = useScene();
  const latest = React.useRef(onProgress);
  React.useLayoutEffect(() => {
    latest.current = onProgress;
  });
  const { pin = false, start, end, phoneEnd = "+=100%", scrub = true, trigger, reducedProgress = 1 } = options;

  useGSAP(
    () => {
      const element = trigger?.current ?? scene.element();
      if (!element) return;
      const mm = gsap.matchMedia();
      mm.add({ motion: MOTION, reduce: REDUCE, phone: PHONE }, (context) => {
        const { motion, phone } = context.conditions as { motion: boolean; reduce: boolean; phone: boolean };
        if (!motion) {
          latest.current(reducedProgress);
          return;
        }
        const pinned = pin === "always" || (pin === "desktop" && !phone);
        ScrollTrigger.create({
          trigger: element,
          start: start ?? (pinned ? "top top" : "top 80%"),
          end: pinned ? (phone ? phoneEnd : (end ?? "+=150%")) : (end ?? "bottom 20%"),
          pin: pinned,
          pinType: "transform",
          scrub,
          onUpdate: (self) => latest.current(self.progress),
          onRefresh: (self) => latest.current(self.progress),
        });
      });
      return () => mm.revert();
    },
    { dependencies: [pin, start, end, phoneEnd, scrub, reducedProgress], revertOnUpdate: true },
  );
}
