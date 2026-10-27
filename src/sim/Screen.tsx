"use client";

import { useEffect, useState, type ReactNode } from "react";
import "./screen.css";

// The screen every project demo runs in: a Mac-style window on a small desktop. The sidebar
// lists how the project works and lights the step that's running; the status bar carries
// progress and the controls. Auto plays the demo once it's on screen, Step hands it over.

export type SimStep = { id: string; label: string; note?: string };

/** Auto/Step mode plus whether the screen is in view. `live` is when a demo should play itself. */
export function useSim() {
  const [el, attach] = useState<HTMLDivElement | null>(null);
  const [auto, setAuto] = useState(true);
  const [seen, setSeen] = useState(false);

  // Reduced motion: start by hand. Set once on mount, after the server render.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) setAuto(false);
  }, []);

  useEffect(() => {
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setSeen(e.isIntersecting), { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, [el]);

  return { attach, auto, setAuto, live: auto && seen };
}

/** A scripted demo: frame i waits delays[i] ms, then moves on, looping. Only runs while live. */
export function useTimeline(delays: readonly number[], live: boolean) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (!live) return;
    const t = setTimeout(() => setI((n) => (n + 1) % delays.length), delays[i]);
    return () => clearTimeout(t);
  }, [i, live, delays]);
  return {
    i,
    go: setI,
    next: () => setI((n) => Math.min(n + 1, delays.length - 1)),
    back: () => setI((n) => Math.max(n - 1, 0)),
    replay: () => setI(0),
    last: i === delays.length - 1,
  };
}

type Props = ReturnType<typeof useSim> & {
  title: string;
  app: string;
  steps: SimStep[];
  active?: string | null;
  done?: readonly string[];
  status: ReactNode;
  progress: number;
  onReplay: () => void;
  onNext?: () => void;
  onBack?: () => void;
  note?: string;
  children: ReactNode;
};

export function Screen({ attach, auto, setAuto, live, title, app, steps, active, done = [], status, progress, onReplay, onNext, onBack, note, children }: Props) {
  return (
    <div ref={attach} className="sim">
      <div className="sim-desktop">
        <div className="sim-window" role="group" aria-label={`${title}, a demo of ${app}`}>
          <div className="sim-bar">
            <span className="sim-lights" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            <p className="sim-title">
              <strong>{title}</strong>
              <span>{app}</span>
            </p>
            <div className="sim-mode" role="group" aria-label="Playback">
              <button type="button" aria-pressed={auto} onClick={() => setAuto(true)}>
                Auto
              </button>
              <button type="button" aria-pressed={!auto} onClick={() => setAuto(false)}>
                Step
              </button>
            </div>
          </div>

          <div className="sim-body">
            <nav className="sim-side" aria-label="How it works">
              <p className="sim-side-head">How it works</p>
              <ol>
                {steps.map((s, n) => {
                  const state = s.id === active ? "is-active" : done.includes(s.id) ? "is-done" : "";
                  return (
                    <li key={s.id} className={state} aria-current={s.id === active ? "step" : undefined}>
                      <span className="sim-step-n" aria-hidden="true">
                        {state === "is-done" ? "✓" : n + 1}
                      </span>
                      <span className="sim-step-text">
                        {s.label}
                        {s.note && <small>{s.note}</small>}
                      </span>
                    </li>
                  );
                })}
              </ol>
            </nav>
            <div className="sim-main">{children}</div>
          </div>

          <div className="sim-status">
            <div className="sim-progress" aria-hidden="true">
              <span style={{ width: `${Math.round(Math.min(1, Math.max(0, progress)) * 100)}%` }} />
            </div>
            <p className="sim-status-text" aria-live="polite">
              {live && <span className="sim-live" aria-hidden="true" />}
              {status}
            </p>
            <div className="sim-controls">
              {!auto && onBack && (
                <button type="button" onClick={onBack}>
                  ‹ Back
                </button>
              )}
              {!auto && onNext && (
                <button type="button" className="is-primary" onClick={onNext}>
                  Next ›
                </button>
              )}
              <button type="button" onClick={onReplay}>
                ↺ Replay
              </button>
            </div>
          </div>
        </div>
      </div>
      {note && <p className="sim-note">{note}</p>}
    </div>
  );
}
