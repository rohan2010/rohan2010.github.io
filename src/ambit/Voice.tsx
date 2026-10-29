"use client";

import { useEffect, useRef, useState } from "react";
import { statusLine } from "./AmbitOS";
import { Mark } from "./icons";
import { SAYS } from "./seed";
import { TOOLS } from "./guard";
import { useComputer } from "./store";
import { Hold } from "./views/Hold";
import { useToday } from "./Today";

// The voice surface (plans/ambit.md §9): what Ambit is like with no screen to speak of, on
// earbuds or a phone. You type or tap; Ambit's replies are scripted captions, read out by the
// blob. No microphone, no speech API.

type Mood = "idle" | "listening" | "working" | "speaking" | "needs";
type Topic = keyof typeof SAYS;

const ASK: { topic: Topic; label: string }[] = [
  { topic: "needs", label: "What needs me?" },
  { topic: "done", label: "What did you do?" },
  { topic: "declined", label: "What did you decline?" },
];

function topicOf(text: string): Topic {
  const t = text.toLowerCase();
  if (/need|wait|decide|me\b|urgent/.test(t)) return "needs";
  if (/declin|refus|didn|block|won/.test(t)) return "declined";
  if (/did|done|overnight|night|happen/.test(t)) return "done";
  return "unknown";
}

export function Voice({ counts, onDesktop, onExit }: { counts: { working: number; needs: number }; onDesktop: () => void; onExit?: () => void }) {
  const { state, act } = useComputer();
  const needs = useToday().filter((i) => i.section === "needs");
  const [said, setSaid] = useState<{ topic: Topic; words: number }>({ topic: "morning", words: 0 });
  const [typing, setTyping] = useState("");
  const [later, setLater] = useState(false);
  // What needs you is read from Today as it stands, not from a script. Spoken, two is plenty;
  // the rest are on the cards.
  const live = needs.length ? `${needs.length === 1 ? "One thing needs" : `${["Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"][needs.length - 2] ?? needs.length} things need`} you. ${needs
        .slice(0, 2)
        .map((i) => i.title)
        .join(" ")}${needs.length > 2 ? ` And ${needs.length - 2} more, below.` : ""}` : "Nothing needs you right now.";
  const words = (said.topic === "needs" ? live : SAYS[said.topic]).split(" ");
  const speaking = said.words < words.length;
  const cards = said.topic === "needs" && !speaking && !later;
  const mood: Mood = typing ? "listening" : speaking ? "speaking" : said.topic === "needs" && !later ? "needs" : "idle";

  // Captions arrive a word at a time, at an unhurried speaking pace.
  useEffect(() => {
    if (!speaking) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t = window.setTimeout(() => setSaid((s) => ({ ...s, words: reduced ? words.length : s.words + 1 })), said.words === 0 ? 500 : 230);
    return () => window.clearTimeout(t);
  }, [said, speaking, words.length]);

  const say = (topic: Topic) => {
    setLater(false);
    setSaid({ topic, words: 0 });
  };

  return (
    <div className={`am-voice${cards ? " has-cards" : ""}`}>
      <header>
        <span className={`am-status is-${counts.needs ? "needs" : "working"}`}>
          <i aria-hidden="true" />
          {statusLine(counts)}
        </span>
      </header>

      <Blob mood={mood} />

      <p className="am-caption" aria-live="polite">
        {words.map((w, n) => (
          <span key={n} className={n < said.words ? "is-said" : ""}>
            {w}{" "}
          </span>
        ))}
      </p>

      {cards && (
        <div className="am-voice-cards">
          {needs.map((i) => (
            <div key={i.id} className="am-voice-card">
              <p>
                <em>{i.kind}</em> <span className="am-ink">{i.title}</span>
              </p>
              {i.mailId && <p className="am-voice-draft">“{state.mail.find((m) => m.id === i.mailId)?.body}”</p>}
              {i.proposal ? (
                <div className="am-voice-btns">
                  <button onClick={() => act({ type: "proposal.accept", id: i.proposal!.id })}>Yes</button>
                  <button onClick={() => act({ type: "proposal.dismiss", id: i.proposal!.id })}>No</button>
                </div>
              ) : i.task?.steps[i.task.at]?.handover ? (
                <div className="am-voice-btns">
                  <button onClick={onDesktop}>Take over on desktop</button>
                  <button onClick={() => act({ type: "task.stop", id: i.task!.id })}>Stop it</button>
                </div>
              ) : i.task && !i.mailId && i.task.steps[i.task.at].cta ? (
                <div className="am-voice-btns">
                  {TOOLS[i.task.steps[i.task.at].tool].reversible ? (
                    <button onClick={() => act({ type: "task.approve", id: i.task!.id })}>{i.task.steps[i.task.at].cta}</button>
                  ) : (
                    <Hold label={`Hold: ${i.task.steps[i.task.at].cta}`} onDone={() => act({ type: "task.approve", id: i.task!.id })} />
                  )}
                  {i.task.steps[i.task.at].skip ? <button onClick={() => act({ type: "task.skip", id: i.task!.id })}>{i.task.steps[i.task.at].skip}</button> : <button onClick={onDesktop}>Look on desktop</button>}
                </div>
              ) : i.mailId ? (
                <div className="am-voice-btns">
                  <Hold label="Hold to send" holding="Sending…" onDone={() => act({ type: "draft.send", id: i.mailId! })} />
                  <button onClick={onDesktop}>Edit on desktop</button>
                </div>
              ) : (
                <p className="am-mono">Too big for earbuds. It waits for a screen.</p>
              )}
            </div>
          ))}
          <div className="am-voice-btns">
            <button onClick={onDesktop}>Open on desktop</button>
            <button onClick={() => setLater(true)}>Not now</button>
          </div>
        </div>
      )}

      <div className="am-voice-ask">
        <div className="am-chips">
          {ASK.map((a) => (
            <button key={a.topic} onClick={() => say(a.topic)}>
              {a.label}
            </button>
          ))}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (typing.trim()) say(topicOf(typing));
            setTyping("");
          }}
        >
          <input value={typing} onChange={(e) => setTyping(e.target.value)} placeholder="Type to Ambit" aria-label="Type to Ambit" />
          <button type="submit" aria-label="Send">
            ↑
          </button>
        </form>
        <p className="am-voice-foot">
          <Mark /> Ambit OS · a made-up week, scripted, no microphone ·{" "}
          <button className="am-link" onClick={onDesktop}>
            Open the desktop
          </button>
          {onExit && (
            <>
              {" · "}
              <button className="am-link" onClick={onExit}>
                Stand up
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}

// The blob: a closed curve through points on a circle, each pushed in and out by slow noise.
// How far and how fast they move is the mood. Only the path changes per frame; the glow
// behind it is a plain gradient that never repaints, so it stays cheap on phones.
const MOOD: Record<Mood, { amp: number; speed: number; scale: number }> = {
  idle: { amp: 0.045, speed: 0.35, scale: 0.92 },
  listening: { amp: 0.09, speed: 1.1, scale: 1 },
  working: { amp: 0.06, speed: 0.6, scale: 0.96 },
  speaking: { amp: 0.11, speed: 1.6, scale: 1.02 },
  needs: { amp: 0.05, speed: 0.4, scale: 0.94 },
};
const N = 9;

function Blob({ mood }: { mood: Mood }) {
  const path = useRef<SVGPathElement>(null);
  const live = useRef(MOOD[mood]);
  const target = useRef(MOOD[mood]);
  useEffect(() => {
    target.current = MOOD[mood];
  }, [mood]);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let t = 0;
    let last = performance.now();
    const seeds = Array.from({ length: N }, (_, i) => i * 1.7 + 0.3);
    const draw = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      // Ease between moods, so a change of state never jumps.
      const k = 1 - Math.pow(0.02, dt);
      const l = live.current;
      const g = target.current;
      live.current = { amp: l.amp + (g.amp - l.amp) * k, speed: l.speed + (g.speed - l.speed) * k, scale: l.scale + (g.scale - l.scale) * k };
      t += dt * live.current.speed;
      const r = 70 * live.current.scale;
      const pts = seeds.map((s, i) => {
        const a = (i / N) * Math.PI * 2;
        const wobble = Math.sin(t * 1.3 + s) * 0.6 + Math.sin(t * 0.7 + s * 2.1) * 0.4;
        const rr = r * (1 + live.current.amp * wobble);
        return [100 + Math.cos(a) * rr, 100 + Math.sin(a) * rr];
      });
      const d = smooth(pts);
      path.current?.setAttribute("d", d);
      if (!reduced) raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className={`am-blob is-${mood}`} aria-hidden="true">
      <svg viewBox="0 0 200 200">
        <defs>
          <radialGradient id="am-blob-fill" cx="38%" cy="32%" r="75%">
            <stop offset="0" style={{ stopColor: "color-mix(in oklab, var(--signal), white 45%)" }} />
            <stop offset="0.55" style={{ stopColor: "var(--signal)" }} />
            <stop offset="1" style={{ stopColor: "color-mix(in oklab, var(--signal), var(--deep) 55%)" }} />
          </radialGradient>
        </defs>
        <path ref={path} fill="url(#am-blob-fill)" />
        <circle className="am-blob-ring" cx="100" cy="100" r="92" />
      </svg>
    </div>
  );
}

/** A smooth closed path through the points (Catmull-Rom, turned into cubic Béziers). */
function smooth(p: number[][]) {
  const n = p.length;
  let d = `M${p[0][0].toFixed(1)},${p[0][1].toFixed(1)}`;
  for (let i = 0; i < n; i++) {
    const p0 = p[(i - 1 + n) % n];
    const p1 = p[i];
    const p2 = p[(i + 1) % n];
    const p3 = p[(i + 2) % n];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return d + "Z";
}
