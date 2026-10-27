"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import "./decode.css";

// The obvious version, kept to show the difference: it rewrites the heading's text with random
// characters on a timer, one timer per letter to settle it. The line reflows on every tick, a
// screen reader gets the gibberish, it plays on mount whether you can see it or not, and the
// button just sits there.

const TEXT = "Every meeting ends with a decision.";
const SUB = "Notes, owners and deadlines, written up before you're back at your desk.";
const GLYPHS = "#%&*+=/<>?0123456789ABCDEFHKMNRSUVXZ";

export function Naive() {
  const [text, setText] = useState(TEXT);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const run = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current.length = 0;
    let settled = 0;
    const scramble = setInterval(() => {
      setText(Array.from(TEXT, (c, i) => (i < settled || c === " " ? c : GLYPHS[Math.floor(Math.random() * GLYPHS.length)])).join(""));
    }, 40);
    timers.current.push(scramble);
    Array.from(TEXT).forEach((_, i) => {
      timers.current.push(
        setTimeout(
          () => {
            settled = i + 1;
            if (i === TEXT.length - 1) {
              clearInterval(scramble);
              setText(TEXT);
            }
          },
          400 + i * 45,
        ),
      );
    });
  }, []);

  useEffect(() => {
    const list = timers.current;
    const t = setTimeout(run, 0);
    return () => {
      clearTimeout(t);
      // Interval and timeout ids share one pool, so clearTimeout clears both.
      list.forEach(clearTimeout);
    };
  }, [run]);

  return (
    <section className="dh" aria-label="Example hero, naive version">
      <p className="dh-kicker">Minutes · for teams</p>
      <h2 className="dh-h1">{text}</h2>
      <p className="dh-sub">{SUB}</p>
      <div className="dh-actions">
        <a className="dh-cta" href="#" onClick={(e) => e.preventDefault()}>
          Try it free
        </a>
        <span className="dh-note">No card needed</span>
      </div>
      <button type="button" className="dh-replay" onClick={run}>
        Replay
      </button>
    </section>
  );
}
