"use client";

import { useEffect, useRef } from "react";
import { CARDS } from "./cards";
import "./spotlight.css";

// A bento grid of features lit by the cursor. One pointer listener on the grid writes the
// pointer's position as two CSS variables, at most once a frame; each card already knows its own
// offset inside the grid (written on resize), so CSS works out where the light falls on it and
// on its border. The card under the pointer tilts a few degrees. React renders once and never
// hears about the mouse. With no hover (a phone), the card crossing the middle of the screen
// holds a slow light of its own instead.

// Most a card tilts, in degrees, at its edges.
const TILT = 3;

export function SpotlightCards() {
  const grid = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = grid.current!;
    const cards = Array.from(el.querySelectorAll<HTMLElement>(".sc-card"));
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const hover = matchMedia("(hover: hover) and (pointer: fine)").matches;

    if (!hover) {
      // Touch: light whichever card is crossing the middle band of the viewport.
      el.dataset.touch = "";
      const io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (e.isIntersecting) (e.target as HTMLElement).dataset.lit = "";
            else delete (e.target as HTMLElement).dataset.lit;
          }
        },
        { rootMargin: "-35% 0px -35% 0px" },
      );
      cards.forEach((c) => io.observe(c));
      return () => io.disconnect();
    }

    // Each card's box inside the grid, read on resize, not per event. offsetLeft/Top ignore
    // transforms, so a tilted card still reports where it really sits.
    let boxes: { el: HTMLElement; l: number; t: number; w: number; h: number }[] = [];
    const measure = () => {
      boxes = cards.map((c) => {
        const b = { el: c, l: c.offsetLeft, t: c.offsetTop, w: c.offsetWidth, h: c.offsetHeight };
        c.style.setProperty("--ox", `${b.l}px`);
        c.style.setProperty("--oy", `${b.t}px`);
        return b;
      });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);

    let raf = 0;
    let cx = 0;
    let cy = 0;
    let hot: HTMLElement | null = null;

    const untilt = (c: HTMLElement) => {
      c.style.setProperty("--rx", "0deg");
      c.style.setProperty("--ry", "0deg");
    };

    const frame = () => {
      raf = 0;
      // One read per frame: where the grid is now (the page may have scrolled).
      const r = el.getBoundingClientRect();
      const x = cx - r.left;
      const y = cy - r.top;
      el.style.setProperty("--x", `${x}px`);
      el.style.setProperty("--y", `${y}px`);
      if (reduced) return;
      const b = boxes.find((b) => x >= b.l && x < b.l + b.w && y >= b.t && y < b.t + b.h);
      if (hot && hot !== b?.el) untilt(hot);
      hot = b?.el ?? null;
      if (!b) return;
      // -0.5..0.5 across the card; the near edge dips toward the pointer.
      const u = (x - b.l) / b.w - 0.5;
      const v = (y - b.t) / b.h - 0.5;
      b.el.style.setProperty("--ry", `${(u * 2 * TILT).toFixed(2)}deg`);
      b.el.style.setProperty("--rx", `${(-v * 2 * TILT).toFixed(2)}deg`);
    };

    const move = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      cx = e.clientX;
      cy = e.clientY;
      el.dataset.on = "";
      if (!raf) raf = requestAnimationFrame(frame);
    };
    const leave = () => {
      delete el.dataset.on;
      if (hot) untilt(hot);
      hot = null;
    };

    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    };
  }, []);

  return (
    <section className="sc" aria-labelledby="sc-title">
      <header className="sc-head">
        <p className="sc-kicker">Features</p>
        <h2 id="sc-title">
          Everything in one <em>quiet</em> place
        </h2>
        <p className="sc-sub">A notes app that stays out of the way. Five things it does well.</p>
      </header>
      <div className="sc-grid" ref={grid}>
        {CARDS.map((c) => (
          // Sample links: they'd go to each feature's page. Here they only show the focus light.
          <a key={c.id} href={`#${c.id}`} className={`sc-card sc-${c.size}`} onClick={(e) => e.preventDefault()}>
            {c.art}
            <span className="sc-text">
              <span className="sc-title">{c.title}</span>
              <span className="sc-copy">{c.copy}</span>
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}
