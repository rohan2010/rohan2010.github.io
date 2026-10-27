"use client";

import { Screen, useSim, useTimeline, type SimStep } from "./Screen";
import "./cascade.css";

// bloomScroll's idea, playable: a feed is settled by the cheapest stage that is sure. Rules,
// then on-device embeddings (a similarity score against what you came for), then a local
// model; if the model gives no answer, the tile stays. The feed, scores and verdicts are made up.

type Stage = "rules" | "embed" | "model" | "open";
type Tile = { title: string; by: string; length: string; stage: Stage; keep: boolean; why: string; score?: number };

const INTENT = "learning Rust";
const FEED: Tile[] = [
  { title: "Rust ownership in 10 minutes", by: "Ferris Explains", length: "10:12", stage: "rules", keep: true, why: "Exact topic match" },
  { title: "Celebrity breakup: what really happened", by: "Tea Daily", length: "14:40", stage: "rules", keep: false, why: "Blocked: gossip" },
  { title: "Borrow checker errors, explained slowly", by: "Compile Time", length: "22:05", stage: "embed", keep: true, why: "Close to what you came for", score: 0.71 },
  { title: "I tried every energy drink so you don't have to", by: "Sip Lab", length: "17:31", stage: "embed", keep: false, why: "Far from what you came for", score: 0.08 },
  { title: "Async programming with Tokio", by: "Systems Hour", length: "41:18", stage: "embed", keep: true, why: "Close to what you came for", score: 0.64 },
  { title: "Morning routine of a millionaire", by: "Hustle FM", length: "9:02", stage: "embed", keep: false, why: "Far from what you came for", score: 0.05 },
  { title: "Rust: our biggest base raid yet", by: "Raid Night", length: "28:44", stage: "model", keep: false, why: "Rust the game, not the language" },
  { title: "Why your code is slow: memory layout", by: "Cache Lines", length: "19:57", stage: "model", keep: true, why: "Relevant to a systems language" },
  { title: "How rust forms on iron", by: "Kitchen Chemistry", length: "6:23", stage: "model", keep: false, why: "Chemistry, not programming" },
  { title: "Building a tiny game engine from scratch", by: "Pixel Forge", length: "1:02:10", stage: "model", keep: true, why: "A Rust project walkthrough" },
  { title: "Top 10 cats vs cucumbers", by: "Purrfect", length: "8:15", stage: "rules", keep: false, why: "Blocked: pets and pranks" },
  { title: "Live: three hours of lofi coding", by: "Night Shift", length: "LIVE", stage: "open", keep: true, why: "No answer, so it stays" },
];
const STAGES: { id: Stage; label: string; note: string }[] = [
  { id: "rules", label: "Rules", note: "instant" },
  { id: "embed", label: "Embeddings", note: "on your device" },
  { id: "model", label: "Local model", note: "the unclear few" },
  { id: "open", label: "Fail open", note: "no answer: show it" },
];
const STEPS: SimStep[] = [
  { id: "feed", label: "YouTube feed", note: "title + channel per tile" },
  { id: "rules", label: "Corrections + rules", note: "your labels, keywords" },
  { id: "embed", label: "MiniLM embeddings", note: "in the browser" },
  { id: "llm", label: "Local model", note: "unclear few; silent = show" },
  { id: "hide", label: "Keep or dissolve", note: "Show / Hide corrects it" },
];
// Frame i: 0 the raw feed, 1–4 one stage each, 5 the settled feed.
const DELAYS = [1600, 1500, 1700, 1900, 1400, 6000] as const;
const FRAME_STEP = ["feed", "rules", "embed", "llm", "llm", "hide"];

export function CascadeSim() {
  const sim = useSim();
  const tl = useTimeline(DELAYS, sim.live);
  const done = Math.min(tl.i - 1, STAGES.length - 1); // index of the last finished stage

  const stageAt = (stage: Stage) => STAGES.findIndex((s) => s.id === stage);
  const count = (i: number) => FEED.filter((t) => stageAt(t.stage) === i).length;
  const settled = FEED.filter((t) => stageAt(t.stage) <= done).length;
  const hidden = FEED.filter((t) => stageAt(t.stage) <= done && !t.keep).length;
  const stepIndex = STEPS.findIndex((s) => s.id === FRAME_STEP[tl.i]);

  const status =
    tl.i === 0
      ? `A feed of ${FEED.length} videos. Nothing judged yet.`
      : tl.last
        ? `${settled} of ${FEED.length} settled on this computer, ${hidden} dissolved. Nothing left the machine.`
        : `${STAGES[done].label}: ${count(done)} decided · ${FEED.length - settled} still open`;

  return (
    <Screen
      {...sim}
      title="Cascade Simulator"
      app="bloomScroll"
      steps={STEPS}
      active={FRAME_STEP[tl.i]}
      done={STEPS.slice(0, stepIndex).map((s) => s.id)}
      status={status}
      progress={tl.i / (DELAYS.length - 1)}
      onNext={tl.last ? undefined : tl.next}
      onBack={tl.i > 0 ? tl.back : undefined}
      onReplay={tl.replay}
      note="A made-up feed for someone learning Rust. The titles, scores and verdicts are invented; the real extension runs on YouTube."
    >
      <div className="cs">
        <div className="cs-top">
          <div className="cs-search" role="img" aria-label={`I came for: ${INTENT}`}>
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <circle cx="7" cy="7" r="4.5" />
              <path d="m10.5 10.5 3 3" />
            </svg>
            <span>I came for</span>
            <strong>{INTENT}</strong>
          </div>
          <span className="cs-badge">
            <i aria-hidden="true" /> bloomScroll on
          </span>
        </div>

        <ol className="cs-stages" aria-label="Stages">
          {STAGES.map((s, i) => (
            <li key={s.id} className={i <= done ? "is-done" : i === done + 1 && tl.i > 0 && !tl.last ? "is-next" : ""}>
              <strong>{s.label}</strong>
              <span>{s.note}</span>
              <b>{i <= done ? count(i) : "·"}</b>
            </li>
          ))}
        </ol>

        <ul className="cs-feed" aria-live="polite">
          {FEED.map((t, n) => {
            const at = stageAt(t.stage);
            const decided = at <= done;
            const fresh = decided && at === done && !tl.last;
            const state = !decided ? "is-waiting" : t.keep ? "is-kept" : "is-hidden";
            return (
              <li key={t.title} className={`cs-tile ${state}${fresh ? " is-fresh" : ""}`}>
                <div className={`cs-thumb tone-${n % 4}`} aria-hidden="true">
                  <span className="cs-len">{t.length}</span>
                  {decided && <span className="cs-verdict">{t.keep ? "Kept" : "Hidden"}</span>}
                </div>
                <p className="cs-title">{t.title}</p>
                <p className="cs-by">{t.by}</p>
                <p className="cs-why">
                  {decided ? (
                    <>
                      <b>{STAGES[at].label}</b>
                      {t.score !== undefined && ` · ${t.score.toFixed(2)}`} · {t.why}
                    </>
                  ) : (
                    " "
                  )}
                </p>
              </li>
            );
          })}
        </ul>
      </div>
    </Screen>
  );
}
