"use client";

import { Screen, useSim, useTimeline, type SimStep } from "./Screen";
import "./values.css";

// Value Imprint, playable: the classifier reads a preference and scores it against the seven
// values, a person checks one it got wrong, then the audit across three datasets. The sample
// conversations and their scores are made up; every dataset figure is from the paper.

const VALUES = [
  "Information Seeking",
  "Wisdom & Knowledge",
  "Duty & Accountability",
  "Civility & Tolerance",
  "Empathy & Helpfulness",
  "Well-being & Peace",
  "Justice & Human/Animal Rights",
] as const;

type Example = { prompt: string; reply: string; scores: number[]; human?: number };
const EXAMPLES: Example[] = [
  {
    prompt: "How much water should I carry on a six-hour hike?",
    reply: "Plan on about half a litre to a litre an hour, more in heat. For six hours that’s three to six litres, or less if there’s water on the trail to filter.",
    scores: [0.62, 0.21, 0.02, 0.01, 0.04, 0.09, 0.01],
  },
  {
    prompt: "My dog died yesterday and I can’t focus at work.",
    reply: "I’m sorry. Losing a dog is losing family, and it’s normal for focus to go. If you can, tell your manager and take the small tasks today.",
    scores: [0.06, 0.05, 0.02, 0.04, 0.58, 0.24, 0.01],
  },
  {
    prompt: "My landlord kept my whole deposit for normal wear and tear. Is that allowed?",
    reply: "In many places it isn’t: deductions are usually limited to damage beyond normal use. Ask for an itemised list, and check your local tenant rules.",
    scores: [0.44, 0.12, 0.07, 0.02, 0.03, 0.01, 0.31],
    human: 6,
  },
];
// From the paper (Obi et al., NeurIPS 2024): most and least common value in each dataset.
const AUDIT = [
  { name: "WebGPT Comparisons", size: "19,578 preferences", top: 78.17, low: 0.04 },
  { name: "Alpaca GPT-4-LLM", size: "52,002 preferences", top: 66.56, low: 0.17 },
  { name: "hh-rlhf · chosen", size: "338,704, both halves", top: 33.84, low: 1.76 },
  { name: "hh-rlhf · rejected", size: "", top: 33.71, low: 1.76 },
];

const STEPS: SimStep[] = [
  { id: "lit", label: "Ethics literature", note: "9 journals" },
  { id: "tax", label: "Values taxonomy", note: "7 values" },
  { id: "ann", label: "Hand labels", note: "6,501 preferences" },
  { id: "clf", label: "RoBERTa classifier", note: "trained on the labels" },
  { id: "audit", label: "Label 3 datasets", note: "hh-rlhf, WebGPT, Alpaca" },
  { id: "check", label: "Human check", note: "500 labels, 84% right" },
];

// Each frame: which example (or the audit), whether it's scored, whether a person has checked it.
type Frame = { view: "classify"; ex: number; scored: boolean; checked?: boolean; step: string; status: string } | { view: "audit"; summary?: boolean; step: string; status: string };
const FRAMES: Frame[] = [
  { view: "classify", ex: 0, scored: false, step: "ann", status: "The classifier learned the seven values from 6,501 preferences labelled by hand." },
  { view: "classify", ex: 0, scored: true, step: "clf", status: "Scored: mostly Information Seeking." },
  { view: "classify", ex: 1, scored: false, step: "clf", status: "Next preference…" },
  { view: "classify", ex: 1, scored: true, step: "clf", status: "Scored: Empathy & Helpfulness." },
  { view: "classify", ex: 2, scored: false, step: "clf", status: "Next preference…" },
  { view: "classify", ex: 2, scored: true, step: "clf", status: "Scored: Information Seeking, with Justice close behind." },
  { view: "classify", ex: 2, scored: true, checked: true, step: "check", status: "A person disagrees: this one is about Justice & Rights." },
  { view: "audit", step: "audit", status: "The classifier labels three datasets in full: over 400,000 preferences." },
  { view: "audit", summary: true, step: "check", status: "Justice & Rights is the least common value in every dataset." },
];
const DELAYS = [2600, 3200, 1400, 3000, 1400, 3000, 3800, 4200, 6500] as const;

export function ValuesSim() {
  const sim = useSim();
  const tl = useTimeline(DELAYS, sim.live);
  const frame = FRAMES[tl.i];
  const stepIndex = STEPS.findIndex((s) => s.id === frame.step);

  return (
    <Screen
      {...sim}
      title="Values Audit Simulator"
      app="Value Imprint"
      steps={STEPS}
      active={frame.step}
      done={STEPS.slice(0, stepIndex)
        .map((s) => s.id)
        .filter((id) => id !== "audit" || frame.view === "audit")}
      status={frame.status}
      progress={tl.i / (FRAMES.length - 1)}
      onNext={tl.last ? undefined : tl.next}
      onBack={tl.i > 0 ? tl.back : undefined}
      onReplay={tl.replay}
      note="The three sample conversations and their scores are made up. The dataset figures are from the paper (Obi et al., NeurIPS 2024)."
    >
      <div className="va">
        <div className="va-tabs" role="tablist" aria-label="View">
          {EXAMPLES.map((_, n) => {
            const on = frame.view === "classify" && frame.ex === n;
            return (
              <button
                key={n}
                type="button"
                role="tab"
                aria-selected={on}
                onClick={() => {
                  sim.setAuto(false);
                  tl.go(FRAMES.findIndex((f) => f.view === "classify" && f.ex === n && f.scored));
                }}
              >
                Preference {n + 1}
              </button>
            );
          })}
          <button
            type="button"
            role="tab"
            aria-selected={frame.view === "audit"}
            onClick={() => {
              sim.setAuto(false);
              tl.go(FRAMES.length - 1);
            }}
          >
            Dataset audit
          </button>
        </div>

        {frame.view === "classify" ? <Classify key={frame.ex} ex={EXAMPLES[frame.ex]} scored={frame.scored} checked={!!frame.checked} /> : <Audit summary={!!frame.summary} />}
      </div>
    </Screen>
  );
}

function Classify({ ex, scored, checked }: { ex: Example; scored: boolean; checked: boolean }) {
  const top = ex.scores.indexOf(Math.max(...ex.scores));
  return (
    <div className="va-classify">
      <div className="va-chat sim-pane">
        <p className="sim-label">A preference, the chosen reply</p>
        <p className="va-msg is-human">
          <span>Human</span>
          {ex.prompt}
        </p>
        <p className="va-msg is-ai">
          <span>Assistant</span>
          {ex.reply}
        </p>
      </div>

      <div className="va-scores sim-pane">
        <p className="sim-label">RoBERTa · value scores</p>
        <ul>
          {VALUES.map((v, n) => {
            const s = scored ? ex.scores[n] : 0;
            const cls = [scored && n === top ? "is-top" : "", checked && n === ex.human ? "is-human" : "", checked && n === top ? "is-wrong" : ""].join(" ");
            return (
              <li key={v} className={cls}>
                <span className="va-name">{v}</span>
                <span className="va-bar">
                  <i style={{ width: `${s * 100}%` }} />
                </span>
                <span className="va-pct">{scored ? `${Math.round(s * 100)}%` : "–"}</span>
              </li>
            );
          })}
        </ul>
        <p className={`va-result${checked ? " is-checked" : ""}`}>
          {!scored ? (
            <span className="sim-pill is-busy">Reading…</span>
          ) : checked && ex.human !== undefined ? (
            <>
              <span className="sim-pill is-warn">Human check</span> Classifier said <s>{VALUES[top]}</s>, a person labels it <b>{VALUES[ex.human]}</b>
            </>
          ) : (
            <>
              <span className="sim-pill is-ok">Dominant value</span> <b>{VALUES[top]}</b>
            </>
          )}
        </p>
      </div>
    </div>
  );
}

function Audit({ summary }: { summary: boolean }) {
  return (
    <div className="va-audit sim-pane">
      <div className="va-audit-head">
        <span>Dataset</span>
        <span>Wisdom &amp; Knowledge · most common</span>
        <span>Justice &amp; Rights · least common</span>
      </div>
      <ul>
        {AUDIT.map((d) => (
          <li key={d.name}>
            <span className="va-ds">
              {d.name}
              {d.size && <small>{d.size}</small>}
            </span>
            <span className="va-col" data-k="Wisdom">
              <span className="va-bar is-big">
                <i style={{ width: `${d.top}%` }} />
              </span>
              <b>{d.top.toFixed(2)}%</b>
            </span>
            <span className="va-col" data-k="Justice">
              <span className="va-bar is-big is-low">
                <i style={{ width: `${Math.max(d.low, 0.6)}%` }} />
              </span>
              <b>{d.low.toFixed(2)}%</b>
            </span>
          </li>
        ))}
      </ul>
      <div className={`va-findings${summary ? " is-on" : ""}`}>
        <p>
          <b>84%</b> of 500 classifier labels were right when people checked them by hand.
        </p>
        <p>
          Chosen and rejected replies in hh-rlhf carry <b>almost the same mix</b> of values.
        </p>
      </div>
    </div>
  );
}
