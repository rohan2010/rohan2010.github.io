"use client";

import * as React from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { usePathname } from "next/navigation";
import { gsap, ScrollTrigger, REDUCE } from "./gsap";
import { getLenis, scrollTo, setLenis } from "./lenis";

// Rendered once in the root layout, so it survives navigations
// (tech-motion.md §3.5–3.6, §9). Owns:
// - Lenis on GSAP's ticker (one loop for Lenis and ScrollTrigger),
// - live reduced motion: no Lenis at all under `reduce`, rebuilt when it flips,
// - route changes: top of the new page (or its #hash), ScrollTrigger.refresh(),
//   and on Back/Forward the scroll position the visitor left (craft-bar U6).

const positions = new Map<string, number>();
let popped = false;
let routeChanged: () => void = () => {};

export function MotionProvider() {
  const pathname = usePathname();
  const first = React.useRef(true);

  React.useEffect(() => {
    const root = document.documentElement;
    const mq = window.matchMedia(REDUCE);
    let tick: ((time: number) => void) | null = null;

    const start = () => {
      if (getLenis() || mq.matches) return;
      const lenis = new Lenis({ autoRaf: false, anchors: true, lerp: 0.1 });
      lenis.on("scroll", ScrollTrigger.update);
      tick = (time) => lenis.raf(time * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
      setLenis(lenis);
    };
    const stop = () => {
      if (tick) gsap.ticker.remove(tick);
      tick = null;
      getLenis()?.destroy();
      setLenis(null);
      gsap.ticker.lagSmoothing(500, 33);
    };
    const mark = () => root.setAttribute("data-motion", mq.matches ? "reduced" : "smooth");
    const onChange = () => {
      if (mq.matches) stop();
      else start();
      mark();
      ScrollTrigger.refresh();
    };

    // Our own scroll restoration: the browser's would fight Lenis and the pins.
    // Positions are snapshotted when a link is clicked (before the route
    // changes) and on Back/Forward, never from scroll events fired mid-navigation.
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    let lastPath = window.location.pathname;
    let lastY = window.scrollY;
    const track = () => {
      if (window.location.pathname === lastPath) lastY = window.scrollY;
    };
    const onClick = (event: MouseEvent) => {
      const link = (event.target as Element | null)?.closest?.("a[href]");
      if (link) positions.set(window.location.pathname, window.scrollY);
    };
    const onPop = () => {
      positions.set(lastPath, lastY);
      popped = true;
    };
    const follow = () => {
      lastPath = window.location.pathname;
      lastY = window.scrollY;
    };
    routeChanged = follow;

    start();
    mark();
    mq.addEventListener("change", onChange);
    window.addEventListener("scroll", track, { passive: true });
    window.addEventListener("click", onClick, true);
    window.addEventListener("popstate", onPop);
    // Fonts change line breaks and so every trigger's position.
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
    return () => {
      mq.removeEventListener("change", onChange);
      window.removeEventListener("scroll", track);
      window.removeEventListener("click", onClick, true);
      window.removeEventListener("popstate", onPop);
      stop();
    };
  }, []);

  React.useEffect(() => {
    if (first.current) {
      first.current = false; // the first load keeps the browser's own #hash jump
      return;
    }
    const back = popped;
    popped = false;
    const target = back ? (positions.get(pathname) ?? 0) : 0;
    const hash = back ? "" : window.location.hash;
    scrollTo(0, { immediate: true });
    // The new page's triggers were created in its own useGSAP (a layout
    // effect) before this frame, so the refresh measures the final layout.
    const id = requestAnimationFrame(() => {
      ScrollTrigger.refresh();
      getLenis()?.resize();
      if (hash && document.querySelector(hash)) scrollTo(hash, { immediate: true });
      else if (target) scrollTo(target, { immediate: true });
      routeChanged();
    });
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  return null;
}
