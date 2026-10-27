"use client";

import { useEffect, useRef, useState } from "react";
import { docs, type Doc, type Step } from "./review-data";
import { Screen, useSim, type SimStep } from "./Screen";
import "./review.css";

// The seller onboarding agent, playable: pick an upload and the agent reads it, validates each
// field, retries a failed check, and routes it on or back. Auto works through the pile itself
// and answers the human-in-the-loop question; Step leaves every choice to the visitor.

type Status = "waiting" | "running" | "cleared" | "sent-back";
type FieldState = "checking" | "ok" | "bad" | "fixed";
type Line = { tone: "head" | "attempt" | "tool" | "ok" | "fail" | "fix" | "ask" | "cleared" | "sent-back"; text: string; detail?: string };

const STEPS: SimStep[] = [
  { id: "upload", label: "Seller uploads", note: "KYC, tax and legal" },
  { id: "read", label: "Read the document", note: "a tool-calling node" },
  { id: "check", label: "Validate fields", note: "against the rules" },
  { id: "route", label: "Route", note: "picks the next step" },
  { id: "retry", label: "Retry", note: "when a check fails" },
  { id: "live", label: "Seller live", note: "minutes, not days" },
];
const READ_TOOLS = new Set(["read_document", "enhance_image", "search_other_docs"]);
const STEP_MS = 800;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function ReviewSim() {
  const sim = useSim();
  const [status, setStatus] = useState<Record<string, Status>>(() => Object.fromEntries(docs.map((d) => [d.id, "waiting"])));
  const [active, setActive] = useState<Doc | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [stage, setStage] = useState<string | null>(null);
  const [trail, setTrail] = useState<string[]>([]);
  const [fields, setFields] = useState<Record<string, FieldState>>({});
  const [values, setValues] = useState<Record<string, string>>({});
  const [lines, setLines] = useState<Line[]>([]);
  const [question, setQuestion] = useState<Extract<Step, { kind: "ask" }> | null>(null);
  const answer = useRef<((yes: boolean) => void) | null>(null);
  const token = useRef(0);
  const log = useRef<HTMLOListElement>(null);

  // Keep the newest line in view by scrolling the console itself, never the page.
  useEffect(() => {
    if (log.current) log.current.scrollTop = log.current.scrollHeight;
  }, [lines, question]);

  const busy = active !== null && status[active.id] === "running";
  const finished = docs.filter((d) => status[d.id] === "cleared" || status[d.id] === "sent-back").length;
  const cleared = docs.filter((d) => status[d.id] === "cleared").length;
  const over = finished === docs.length;
  const nextDoc = docs.find((d) => status[d.id] === "waiting");

  const say = (line: Line) => setLines((l) => [...l, line]);
  const at = (id: string) => {
    setStage(id);
    setTrail((t) => (t.includes(id) ? t : [...t, id]));
  };

  async function run(doc: Doc) {
    if (busy || status[doc.id] !== "waiting") return;
    const me = ++token.current;
    const alive = () => token.current === me;

    setActive(doc);
    setFields({});
    setValues({});
    setTrail([]);
    setAttempt(1);
    at("upload");
    setStatus((s) => ({ ...s, [doc.id]: "running" }));
    setLines([{ tone: "head", text: `review #${finished + 1}`, detail: doc.name }]);

    for (const [i, steps] of doc.attempts.entries()) {
      await sleep(STEP_MS / 2);
      if (!alive()) return;
      setAttempt(i + 1);
      if (i > 0) at("retry");
      say({ tone: "attempt", text: `attempt ${i + 1}` });
      setFields((f) => Object.fromEntries(Object.entries(f).map(([k, v]) => [k, v === "bad" ? "checking" : v])));

      for (const step of steps) {
        if ("field" in step && step.field && step.kind !== "fix") setFields((f) => ({ ...f, [step.field!]: "checking" }));
        await sleep(STEP_MS);
        if (!alive()) return;

        if (step.kind === "tool") {
          at(step.tool === "ask_human" ? "route" : READ_TOOLS.has(step.tool) ? "read" : "check");
          say({ tone: "tool", text: `${step.tool}()`, detail: step.say });
        }
        if (step.kind === "ok") {
          at("check");
          say({ tone: "ok", text: step.say });
          if (step.field) setFields((f) => ({ ...f, [step.field!]: "ok" }));
        }
        if (step.kind === "fail") {
          at("check");
          say({ tone: "fail", text: step.say });
          if (step.field) setFields((f) => ({ ...f, [step.field!]: "bad" }));
        }
        if (step.kind === "fix") {
          say({ tone: "fix", text: step.say, detail: step.value });
          setValues((v) => ({ ...v, [step.field]: step.value }));
          setFields((f) => ({ ...f, [step.field]: "fixed" }));
        }
        if (step.kind === "ask") {
          at("route");
          say({ tone: "ask", text: step.say });
          setQuestion(step);
          const yes = await new Promise<boolean>((resolve) => (answer.current = resolve));
          if (!alive()) return;
          setQuestion(null);
          say({ tone: yes ? "ok" : "fail", text: `human: “${yes ? step.yes : step.no}”` });
          setFields((f) => ({ ...f, signature: yes ? "ok" : "bad" }));
          await sleep(STEP_MS);
          if (!alive()) return;
          return finish(doc, yes, i + 1);
        }
      }
    }
    await sleep(STEP_MS);
    if (!alive()) return;
    finish(doc, doc.end === "cleared", doc.attempts.length);
  }

  function finish(doc: Doc, ok: boolean, attempts: number) {
    const tries = `${attempts} attempt${attempts > 1 ? "s" : ""}`;
    at(ok ? "live" : "route");
    say(ok ? { tone: "cleared", text: "CLEARED", detail: `routed to ${doc.route} · ${tries}` } : { tone: "sent-back", text: "SENT BACK", detail: doc.backNote ?? "" });
    setStatus((s) => ({ ...s, [doc.id]: ok ? "cleared" : "sent-back" }));
  }

  function reply(yes: boolean) {
    answer.current?.(yes);
    answer.current = null;
  }

  function reset() {
    token.current++;
    answer.current = null;
    setStatus(Object.fromEntries(docs.map((d) => [d.id, "waiting"])));
    setActive(null);
    setAttempt(0);
    setStage(null);
    setTrail([]);
    setFields({});
    setValues({});
    setLines([]);
    setQuestion(null);
  }

  // Auto: work through the pile, answer the human's question, then start over.
  useEffect(() => {
    if (!sim.live) return;
    let t: ReturnType<typeof setTimeout> | undefined;
    if (question) t = setTimeout(() => reply(true), 2600);
    else if (over) t = setTimeout(reset, 6000);
    else if (!busy && nextDoc) t = setTimeout(() => run(nextDoc), active ? 1600 : 900);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sim.live, question, over, busy, nextDoc]);

  const pick = (doc: Doc) => {
    sim.setAuto(false);
    run(doc);
  };

  const statusText = question
    ? sim.auto
      ? "Waiting for a human. Auto answers in a moment"
      : "Waiting for a human: your call"
    : busy && active
      ? `Reviewing ${active.name} · attempt ${attempt}`
      : over
        ? `${cleared} of ${docs.length} cleared. The seller gets a short to-do list instead of a 3-day wait.`
        : finished
          ? `${finished} of ${docs.length} reviewed. ${sim.auto ? "Next one coming up" : "Pick the next upload"}`
          : sim.auto
            ? "Starting the review…"
            : "Pick an upload to review";

  return (
    <Screen
      {...sim}
      title="Review Simulator"
      app="Seller onboarding agent"
      steps={STEPS}
      active={stage}
      done={trail.filter((s) => s !== stage)}
      status={statusText}
      progress={(finished + (busy ? 0.5 : 0)) / docs.length}
      onNext={nextDoc && !busy ? () => run(nextDoc) : undefined}
      onReplay={reset}
      note="Sample documents, made up. The checks, retries and routing follow the production agent."
    >
      <div className="rv">
        <div className="rv-inbox sim-pane">
          <p className="sim-label">Uploads · Meera’s Pickles</p>
          <ul>
            {docs.map((d) => {
              const s = status[d.id];
              return (
                <li key={d.id}>
                  <button
                    type="button"
                    className={`rv-file is-${s}${active?.id === d.id ? " is-open" : ""}`}
                    disabled={busy || s !== "waiting"}
                    draggable={!busy && s === "waiting"}
                    onDragStart={(e) => e.dataTransfer.setData("text/plain", d.id)}
                    onClick={() => pick(d)}
                  >
                    <FileIcon kind={d.name.endsWith(".pdf") ? "pdf" : "img"} />
                    <span className="rv-file-text">
                      <span className="rv-file-name">{d.name}</span>
                      <span className="rv-file-kind">{d.kind}</span>
                    </span>
                    <span className={`sim-pill ${s === "cleared" ? "is-ok" : s === "sent-back" ? "is-warn" : s === "running" ? "is-busy" : ""}`}>
                      {s === "waiting" ? "Queued" : s === "running" ? "Reviewing" : s === "cleared" ? "Cleared" : "Sent back"}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          <p className="rv-hint">{busy ? "The agent is working…" : over ? "All reviewed." : "Tap an upload, or drag it onto the document."}</p>
        </div>

        <div
          className="rv-work"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const doc = docs.find((d) => d.id === e.dataTransfer.getData("text/plain"));
            if (doc) pick(doc);
          }}
        >
          <div className={`rv-sheet sim-pane${active?.blurry ? " is-blurry" : ""}`}>
            {active ? (
              <>
                <div className="rv-sheet-head">
                  <span>{active.kind}</span>
                  <span className="rv-sheet-name">{active.name}</span>
                </div>
                <dl>
                  {active.fields.map((f) => (
                    <div key={f.key} className={`rv-field${fields[f.key] ? ` is-${fields[f.key]}` : ""}`}>
                      <dt>{f.label}</dt>
                      <dd>{values[f.key] ?? (f.value || "—")}</dd>
                      <span className="rv-mark" aria-hidden="true">
                        {fields[f.key] === "ok" ? "✓" : fields[f.key] === "bad" ? "✕" : fields[f.key] === "fixed" ? "↻" : fields[f.key] === "checking" ? "…" : ""}
                      </span>
                    </div>
                  ))}
                </dl>
              </>
            ) : (
              <p className="rv-empty">No document open. Drop an upload here.</p>
            )}
          </div>

          <div className="sim-console rv-console">
            <div className="sim-console-head">
              <strong>agent.log</strong>
              <span>
                {finished} reviewed · {cleared} cleared
              </span>
            </div>
            <ol ref={log} aria-live="polite">
              {lines.map((l, i) => (
                <li key={i} className={`rv-line tone-${l.tone}`}>
                  <span className="rv-glyph" aria-hidden="true">
                    {{ head: "▸", attempt: "", tool: "→", ok: "✓", fail: "✕", fix: "↻", ask: "?", cleared: "●", "sent-back": "●" }[l.tone]}
                  </span>
                  <span>
                    {l.text}
                    {l.detail && <em>{l.tone === "tool" ? ` ${l.detail}` : ` ${l.detail}`}</em>}
                  </span>
                </li>
              ))}
              {question && (
                <li className="rv-ask">
                  <button type="button" onClick={() => reply(true)}>
                    {question.yes}
                  </button>
                  <button type="button" onClick={() => reply(false)}>
                    {question.no}
                  </button>
                </li>
              )}
              {!lines.length && <li className="rv-line tone-attempt">waiting for an upload…</li>}
            </ol>
          </div>
        </div>
      </div>
    </Screen>
  );
}

function FileIcon({ kind }: { kind: "pdf" | "img" }) {
  return (
    <svg className="rv-icon" viewBox="0 0 28 34" aria-hidden="true">
      <path d="M3 1.5h15l7 7v23a1.5 1.5 0 0 1-1.5 1.5h-20A1.5 1.5 0 0 1 2 31.5V3A1.5 1.5 0 0 1 3.5 1.5Z" className="rv-icon-page" />
      <path d="M18 1.5v6a1 1 0 0 0 1 1h6" className="rv-icon-fold" />
      <rect x="5" y="20" width="18" height="8" rx="2" className={`rv-icon-tag is-${kind}`} />
      <text x="14" y="26.2" textAnchor="middle" className="rv-icon-text">
        {kind === "pdf" ? "PDF" : "JPG"}
      </text>
    </svg>
  );
}
