"use client";

import { useEffect, useRef } from "react";

// A Bayer-dithered grid of small square cells behind the hero, after "Dither Grid" by Vikers on
// 21st.dev, in the identity's colours. At rest every cell is a pencil dot, like dot-grid paper,
// strongest toward the desk's corner. The cursor warms it: dots near the pointer grow into soft
// brass squares and cool back to dots as it moves on. It fades on scroll.

const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((n) => (n + 0.5) / 16);
const CELL = 16;
// Cell size as a share of the pitch: at rest, and fully warmed.
const REST = 0.16;
const HOT = 0.78;
// How far the dots' falloff reaches from its corner, as a share of the stage diagonal, and how
// strong the dots stay past it.
const REACH = 0.9;
const FLOOR = 0.3;
// Cursor glow radius in px, how much heat a frame adds, and how fast it cools.
const RADIUS = 150;
const GAIN = 0.16;
const COOL = 0.955;

// Tints, all laid over paper at low alpha so nothing reads darker than a pencil wash.
const BASE = { token: "--ink", alpha: 0.24 };
const WARM: { token: string; alpha: number }[] = [
  { token: "--signal", alpha: 0.14 },
  { token: "--signal", alpha: 0.28 },
  { token: "--signal", alpha: 0.44 },
];

export function DitherGrid() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = matchMedia("(pointer: fine)").matches;
    let base = "";
    let warm: string[] = [];
    let w = 0;
    let h = 0;
    let cols = 0;
    let rows = 0;
    let rest = new Float32Array(0);
    let heat = new Float32Array(0);
    let raf = 0;
    let lastDraw = -1;
    // Pointer in canvas space; null when it's off the stage.
    let px: number | null = null;
    let py = 0;
    let moved = false;

    const read = () => {
      const css = getComputedStyle(canvas);
      base = css.getPropertyValue(BASE.token).trim();
      warm = WARM.map((s) => css.getPropertyValue(s.token).trim());
    };
    const size = () => {
      const r = canvas.getBoundingClientRect();
      const dpr = Math.min(devicePixelRatio, 2);
      w = r.width;
      h = r.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(w / CELL);
      rows = Math.ceil(h / CELL);
      heat = new Float32Array(cols * rows);
      // The dots: strength falling off from just past the bottom-right corner.
      rest = new Float32Array(cols * rows);
      const diag = Math.hypot(w, h);
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const d = Math.hypot(w * 1.04 - (x + 0.5) * CELL, h * 1.08 - (y + 0.5) * CELL) / diag;
          const s = Math.max(0, 1 - d / REACH);
          rest[y * cols + x] = FLOOR + (1 - FLOOR) * s * s;
        }
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const k = y * cols + x;
          const t = heat[k];
          const b = BAYER[(y % 4) * 4 + (x % 4)];
          // Heat steps through the tints by the same Bayer threshold, so the glow dithers too.
          const level = t > 0.04 ? Math.min(WARM.length - 1, Math.floor(t * WARM.length + b - 0.5)) : -1;
          const side = CELL * (REST + (HOT - REST) * Math.min(1, t * 1.4));
          const o = (CELL - side) / 2;
          if (level < 0) {
            ctx.globalAlpha = BASE.alpha * rest[k];
            ctx.fillStyle = base;
          } else {
            ctx.globalAlpha = WARM[level].alpha * Math.min(1, t * 2.2);
            ctx.fillStyle = warm[level];
          }
          ctx.fillRect(x * CELL + o, y * CELL + o, side, side);
        }
      }
      ctx.globalAlpha = 1;
    };

    // Adds heat around the pointer and cools everything; returns whether anything is still warm.
    const step = () => {
      let warmLeft = false;
      for (let k = 0; k < heat.length; k++) {
        heat[k] *= COOL;
        if (heat[k] < 0.01) heat[k] = 0;
        else warmLeft = true;
      }
      if (px !== null && moved) {
        const r = Math.ceil(RADIUS / CELL);
        const cx = Math.floor(px / CELL);
        const cy = Math.floor(py / CELL);
        for (let y = Math.max(0, cy - r); y <= Math.min(rows - 1, cy + r); y++) {
          for (let x = Math.max(0, cx - r); x <= Math.min(cols - 1, cx + r); x++) {
            const d = Math.hypot((x + 0.5) * CELL - px, (y + 0.5) * CELL - py) / RADIUS;
            if (d >= 1) continue;
            const k = y * cols + x;
            heat[k] = Math.min(1, heat[k] + GAIN * (1 - d * d) * (1 - d * d));
          }
        }
        warmLeft = true;
      }
      moved = false;
      return warmLeft;
    };

    // Runs only while the field is warm, then parks until the pointer moves again.
    const tick = (now: number) => {
      raf = 0;
      const fade = Math.max(0, 1 - scrollY / (innerHeight * 0.5));
      canvas.style.opacity = String(fade);
      if (now - lastDraw >= 16) {
        lastDraw = now;
        const warmLeft = step();
        draw();
        if (!warmLeft) return;
      }
      raf = requestAnimationFrame(tick);
    };
    const wake = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };

    const move = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      if (x < -RADIUS || y < -RADIUS || x > w + RADIUS || y > h + RADIUS) {
        px = null;
        return;
      }
      px = x;
      py = y;
      moved = true;
      wake();
    };
    const leave = () => {
      px = null;
    };
    const scroll = () => {
      canvas.style.opacity = String(Math.max(0, 1 - scrollY / (innerHeight * 0.5)));
    };

    read();
    size();
    draw();
    scroll();
    const resize = () => {
      size();
      draw();
    };
    addEventListener("resize", resize);
    addEventListener("scroll", scroll, { passive: true });
    if (fine && !reduced) {
      addEventListener("pointermove", move, { passive: true });
      document.documentElement.addEventListener("pointerleave", leave);
    }
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("resize", resize);
      removeEventListener("scroll", scroll);
      removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", leave);
    };
  }, []);

  return <canvas className="dither" ref={ref} aria-hidden="true" />;
}
