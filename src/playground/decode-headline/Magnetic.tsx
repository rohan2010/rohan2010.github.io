"use client";

import { useEffect, useRef, type ReactNode } from "react";

// Leans its child toward the cursor when the cursor comes within RADIUS of its centre, and
// springs back when it leaves. Transform only, on a damped spring, so it eases in and settles
// with a small overshoot instead of snapping. The wrapper never moves, so it's what gets
// measured. Off for touch screens and for reduced motion.

const RADIUS = 140;
// How far it leans, as a share of the cursor's offset, and how far the label leans on top.
const PULL = 0.32;
const LABEL = 0.18;
// Spring stiffness and damping per frame.
const K = 0.14;
const DAMP = 0.74;

export function Magnetic({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const wrap = ref.current!;
    const body = wrap.firstElementChild as HTMLElement | null;
    if (!body) return;
    const label = body.querySelector<HTMLElement>("[data-magnetic-label]");
    if (!matchMedia("(hover: hover) and (pointer: fine)").matches || matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let tx = 0;
    let ty = 0;
    let x = 0;
    let y = 0;
    let vx = 0;
    let vy = 0;
    let raf = 0;

    const tick = () => {
      vx = (vx + (tx - x) * K) * DAMP;
      vy = (vy + (ty - y) * K) * DAMP;
      x += vx;
      y += vy;
      body.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
      if (label) label.style.transform = `translate3d(${((x * LABEL) / PULL).toFixed(2)}px, ${((y * LABEL) / PULL).toFixed(2)}px, 0)`;
      // Park once it's at rest where it should be.
      if (Math.abs(tx - x) + Math.abs(ty - y) + Math.abs(vx) + Math.abs(vy) < 0.05) {
        raf = 0;
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    const wake = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };

    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" && e.pointerType !== "pen") return;
      const r = wrap.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      // Distance from the button's edge, so a wide button pulls from all along it.
      const ex = Math.max(0, Math.abs(dx) - r.width / 2);
      const ey = Math.max(0, Math.abs(dy) - r.height / 2);
      const d = Math.hypot(ex, ey);
      const f = d < RADIUS ? 1 - d / RADIUS : 0;
      const ntx = dx * PULL * f;
      const nty = dy * PULL * f;
      if (ntx === tx && nty === ty) return;
      tx = ntx;
      ty = nty;
      wake();
    };
    const leave = () => {
      tx = 0;
      ty = 0;
      wake();
    };

    addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", leave);
      body.style.transform = "";
      if (label) label.style.transform = "";
    };
  }, []);

  return (
    <span ref={ref} className={`dh-mag${className ? ` ${className}` : ""}`}>
      {children}
    </span>
  );
}
