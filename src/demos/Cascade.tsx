"use client";

import { useEffect, useRef, useState } from "react";
import "./cascade.css";

// bloomScroll's idea, playable: a feed is settled by the cheapest stage that is
// sure. Rules, then on-device embeddings (a similarity score against what you
// came for), then a local model; if the model gives no answer, the tile stays.
// The feed, scores and verdicts are made up for the demo.

type Stage = "rules" | "embed" | "model" | "open";
type Tile = { title: string; by: string; stage: Stage; keep: boolean; why: string; score?: number };

const INTENT = "learning Rust";
const FEED: Tile[] = [
  { title: "Rust ownership in 10 minutes", by: "Ferris Explains", stage: "rules", keep: true, why: "Exact topic match" },
  { title: "Celebrity breakup: what really happened", by: "Tea Daily", stage: "rules", keep: false, why: "Blocked category: gossip" },
  { title: "Borrow checker errors, explained slowly", by: "Compile Time", stage: "embed", keep: true, why: "Close to what you came for", score: 0.71 },
  { title: "I tried every energy drink so you don't have to", by: "Sip Lab", stage: "embed", keep: false, why: "Far from what you came for", score: 0.08 },
  { title: "Async programming with Tokio", by: "Systems Hour", stage: "embed", keep: true, why: "Close to what you came for", score: 0.64 },
  { title: "Morning routine of a millionaire", by: "Hustle FM", stage: "embed", keep: false, why: "Far from what you came for", score: 0.05 },
  { title: "Rust: our biggest base raid yet", by: "Raid Night", stage: "model", keep: false, why: "Rust the video game, not the language" },
  { title: "Why your code is slow: memory layout", by: "Cache Lines", stage: "model", keep: true, why: "Relevant to learning a systems language" },
  { title: "How rust forms on iron", by: "Kitchen Chemistry", stage: "model", keep: false, why: "Chemistry, not programming" },
  { title: "Building a tiny game engine from scratch", by: "Pixel Forge", stage: "model", keep: true, why: "A Rust project walkthrough" },
  { title: "Top 10 cats vs cucumbers", by: "Purrfect", stage: "rules", keep: false, why: "Blocked category: pets and pranks" },
  { title: "Live: three hours of lofi coding", by: "Night Shift", stage: "open", keep: true, why: "No answer from the model, so it stays" },
];
const STAGES: { id: Stage; label: string; note: string }[] = [
  { id: "rules", label: "Rules", note: "instant" },
  { id: "embed", label: "Embeddings", note: "on your device" },
  { id: "model", label: "Local model", note: "the unclear few" },
  { id: "open", label: "Fail open", note: "no answer: show it" },
];
const STEP_MS = 1100;

export function Cascade() {
  const [done, setDone] = useState(-1); // index of the last finished stage
  const [running, setRunning] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const run = () => {
    timers.current.forEach(clearTimeout);
    setDone(-1);
    setRunning(true);
    STAGES.forEach((_, i) => timers.current.push(setTimeout(() => setDone(i), (i + 1) * STEP_MS)));
    timers.current.push(setTimeout(() => setRunning(false), STAGES.length * STEP_MS + 100));
  };

  const decidedBy = (stage: Stage) => STAGES.findIndex((s) => s.id === stage);
  const count = (i: number) => FEED.filter((t) => decidedBy(t.stage) === i).length;
  const settled = FEED.filter((t) => decidedBy(t.stage) <= done).length;
  const hidden = FEED.filter((t) => decidedBy(t.stage) <= done && !t.keep).length;

  return (
    <div className="cascade">
      <div className="cascade-bar">
        <p>
          I came for: <strong>{INTENT}</strong>
        </p>
        <button type="button" onClick={run} disabled={running}>
          {done < 0 ? "Run the cascade" : running ? "Running…" : "Run it again"}
        </button>
      </div>

      <ol className="cascade-stages" aria-label="Stages">
        {STAGES.map((s, i) => (
          <li key={s.id} className={i <= done ? "is-done" : i === done + 1 && running ? "is-active" : ""}>
            <strong>{s.label}</strong>
            <span>{s.note}</span>
            <span className="cascade-count">{i <= done ? `${count(i)} decided` : "·"}</span>
          </li>
        ))}
      </ol>

      <ul className="cascade-feed" aria-live="polite">
        {FEED.map((t) => {
          const at = decidedBy(t.stage);
          const decided = at <= done;
          const state = !decided ? "is-waiting" : t.keep ? "is-kept" : "is-dissolved";
          return (
            <li key={t.title} className={`cascade-tile ${state}`}>
              <div className="cascade-thumb" aria-hidden="true" />
              <p className="cascade-title">{t.title}</p>
              <p className="cascade-by">{t.by}</p>
              {decided && (
                <p className="cascade-why">
                  {STAGES[at].label}
                  {t.score !== undefined ? ` (similarity ${t.score.toFixed(2)})` : ""}: {t.why}
                </p>
              )}
            </li>
          );
        })}
      </ul>

      <p className="cascade-foot">
        {done < 0
          ? "Twelve videos from a made-up feed. Press run to watch which stage settles each one."
          : `${settled} of ${FEED.length} settled on this computer, ${hidden} dissolved. Nothing left the machine.`}
      </p>
    </div>
  );
}
