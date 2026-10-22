"use client";

import * as React from "react";

// One tiny observer for the whole page. Blocks marked `data-reveal` fade up
// 12px the first time they enter the viewport. Nothing is hidden until this
// runs (the hidden state keys off `html[data-reveal-ready]`), and anything
// already on screen is marked shown first, so there is no flash.
export function Reveal() {
  React.useEffect(() => {
    const root = document.documentElement;
    const blocks = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const show = (node: HTMLElement) => {
      node.dataset.shown = "";
    };
    // Detail figures run their one CSS motion only while they are on screen.
    const details = Array.from(document.querySelectorAll<HTMLElement>("[data-detail]"));
    const watch =
      "IntersectionObserver" in window
        ? new IntersectionObserver((entries) => {
            for (const entry of entries) {
              const node = entry.target as HTMLElement;
              if (entry.isIntersecting) node.dataset.inview = "";
              else delete node.dataset.inview;
            }
          })
        : null;
    details.forEach((node) => watch?.observe(node));
    if (still || !("IntersectionObserver" in window)) {
      blocks.forEach(show);
      return () => watch?.disconnect();
    }
    const height = window.innerHeight;
    for (const node of blocks) {
      const box = node.getBoundingClientRect();
      if (box.top < height && box.bottom > 0) show(node);
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          show(entry.target as HTMLElement);
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    blocks.filter((node) => !("shown" in node.dataset)).forEach((node) => observer.observe(node));
    root.dataset.revealReady = "";

    // The phone menu is a <details>; close it after a jump so it doesn't cover the page.
    const menu = document.querySelector<HTMLDetailsElement>(".topbar-menu");
    const close = (event: Event) => {
      if (menu && (event.target as Element).closest("a")) menu.open = false;
    };
    menu?.addEventListener("click", close);
    return () => {
      observer.disconnect();
      watch?.disconnect();
      menu?.removeEventListener("click", close);
    };
  }, []);
  return null;
}
