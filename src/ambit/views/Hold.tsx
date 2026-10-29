"use client";

import { useEffect, useRef, useState } from "react";

// Hold to act: the ceremony for things that can't be undone (plans/ambit.md §2, "how reversible
// an action is decides how much ceremony it gets"). A click is enough to merge or to hold a
// slot; sending in your voice or deploying to production takes a held press. Letting go early
// does nothing. Keyboard: hold Enter or Space.

const MS = 1100;

export function Hold({ label, holding = "Keep holding…", note, onDone }: { label: string; holding?: string; note?: string; onDone: () => void }) {
  const [p, setP] = useState(0);
  const [gaveUp, setGaveUp] = useState(false);
  const start = useRef<number | null>(null);
  const raf = useRef(0);
  const done = useRef(onDone);
  useEffect(() => {
    done.current = onDone;
  }, [onDone]);
  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  const go = () => {
    if (start.current !== null) return;
    setGaveUp(false);
    start.current = performance.now();
    const step = (now: number) => {
      const k = Math.min(1, (now - start.current!) / MS);
      setP(k);
      if (k >= 1) {
        start.current = null;
        done.current();
        return;
      }
      raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
  };
  const stop = () => {
    if (start.current === null) return;
    cancelAnimationFrame(raf.current);
    start.current = null;
    setGaveUp(p > 0.05);
    setP(0);
  };

  return (
    <span className="am-hold-wrap">
      <button
        type="button"
        className={`am-btn is-main am-hold${p > 0 ? " is-holding" : ""}`}
        style={{ "--p": p } as React.CSSProperties}
        aria-label={`${label}. Press and hold.`}
        onPointerDown={(e) => {
          // Capture keeps the hold if the finger drifts off the button; some pointers can't be captured.
          try {
            e.currentTarget.setPointerCapture(e.pointerId);
          } catch {}
          go();
        }}
        onPointerUp={stop}
        onPointerCancel={stop}
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && !e.repeat) {
            e.preventDefault();
            go();
          }
        }}
        onKeyUp={(e) => (e.key === "Enter" || e.key === " ") && stop()}
        onContextMenu={(e) => e.preventDefault()}
      >
        <i aria-hidden="true" />
        <span>{p > 0 ? holding : label}</span>
      </button>
      <small className="am-hold-note" aria-live="polite">
        {gaveUp ? "Let go early. Nothing happened." : note}
      </small>
    </span>
  );
}
