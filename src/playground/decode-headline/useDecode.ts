"use client";

import { useCallback, useEffect, useRef, type RefObject } from "react";

// Decodes a headline drawn by DecodeText: every character shows a mono glyph that changes a
// few times a second, then settles on its real letter, left to right. One rAF loop for all of
// them, writing straight to the DOM, so React renders the headline once. The server renders the
// finished text; scrambling only starts after mount, once the headline is in view.

export type DecodeOptions = {
  // Glyphs to cycle through while scrambling.
  glyphs?: string;
  // ms between one character settling and the next.
  stagger?: number;
  // ms each glyph is shown before it changes.
  swap?: number;
  // ms of scrambling before the first character settles.
  hold?: number;
  // Extra pause before the accent word starts to settle.
  beat?: number;
  // Called once every character has settled.
  onDone?: () => void;
};

export const GLYPHS = "#%&*+=/<>?0123456789abcdefhkmnrsuvxz";

// A small hash, so the glyph a character shows at a given swap is the same every time for one
// run: no Math.random per frame, nothing that differs between server and client.
const hash = (a: number, b: number, c: number) => {
  let h = (a * 374761393 + b * 668265263 + c * 2246822519) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return (h ^ (h >>> 16)) >>> 0;
};

export function useDecode(ref: RefObject<HTMLElement | null>, { glyphs = GLYPHS, stagger = 34, swap = 60, hold = 380, beat = 280, onDone }: DecodeOptions = {}) {
  const replayRef = useRef<() => void>(() => {});
  const done = useRef(onDone);
  useEffect(() => {
    done.current = onDone;
  });

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      done.current?.();
      return;
    }
    const cells = Array.from(root.querySelectorAll<HTMLElement>("[data-k]"));
    // When each character settles: the plain ones in reading order, the accent a beat after.
    const plain = cells.filter((c) => !c.dataset.accent).length;
    const at = cells.map((c) => {
      const k = Number(c.dataset.k);
      return c.dataset.accent ? hold + plain * stagger + beat + (k - plain) * stagger * 1.6 : hold + k * stagger;
    });
    const end = Math.max(...at);
    // What each overlay shows now, so a frame only touches the cells that changed.
    const shown = cells.map(() => "");
    // Whether each cell is settled; true to start, since the server drew the finished text.
    const set = cells.map(() => true);
    let raf = 0;
    let start = 0;
    let run = 0;

    const frame = (t: number) => {
      for (let i = 0; i < cells.length; i++) {
        const settled = t >= at[i];
        if (settled !== set[i]) {
          set[i] = settled;
          cells[i].classList.toggle("is-scr", !settled);
        }
        const g = settled ? "" : glyphs[hash(i, Math.floor(t / swap), run) % glyphs.length];
        if (g !== shown[i]) {
          shown[i] = g;
          (cells[i].firstElementChild as HTMLElement).textContent = g;
        }
      }
    };

    const tick = (now: number) => {
      if (!start) start = now;
      const t = now - start;
      frame(t);
      if (t < end) raf = requestAnimationFrame(tick);
      else {
        raf = 0;
        root.dataset.state = "done";
        done.current?.();
      }
    };

    const play = () => {
      cancelAnimationFrame(raf);
      run++;
      start = 0;
      root.dataset.state = "run";
      frame(0);
      raf = requestAnimationFrame(tick);
    };

    // Armed: scrambled and still until it's on screen. Off screen, nobody sees this frame.
    root.dataset.state = "run";
    frame(0);
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        play();
      },
      { threshold: 0.5 },
    );
    io.observe(root);
    replayRef.current = play;

    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      replayRef.current = () => {};
      // Leave the finished text behind, as the server drew it.
      cells.forEach((c) => {
        c.classList.remove("is-scr");
        (c.firstElementChild as HTMLElement).textContent = "";
      });
      delete root.dataset.state;
    };
  }, [ref, glyphs, stagger, swap, hold, beat]);

  return useCallback(() => replayRef.current(), []);
}
