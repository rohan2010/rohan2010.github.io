"use client";

import { useEffect, useRef, useState } from "react";
import { docs, type Doc, type Step } from "./data";
import "./toy.css";

type Status = "waiting" | "running" | "escaped" | "dead";
type FieldState = "checking" | "ok" | "bad" | "fixed";
type Line = { tone: "head" | "attempt" | "tool" | "ok" | "fail" | "fix" | "ask" | "escaped" | "dead"; text: string; detail?: string };

const STEP_MS = 750;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function Toy() {
  const [status, setStatus] = useState<Record<string, Status>>(() => Object.fromEntries(docs.map((d) => [d.id, "waiting"])));
  const [active, setActive] = useState<Doc | null>(null);
  const [fields, setFields] = useState<Record<string, FieldState>>({});
  const [values, setValues] = useState<Record<string, string>>({});
  const [lines, setLines] = useState<Line[]>([]);
  const [question, setQuestion] = useState<Extract<Step, { kind: "ask" }> | null>(null);
  const [runs, setRuns] = useState(0);
  const [escapes, setEscapes] = useState(0);
  const [over, setOver] = useState(false);
  const answer = useRef<((yes: boolean) => void) | null>(null);
  const token = useRef(0);
  const logEnd = useRef<HTMLLIElement>(null);
  const agent = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEnd.current?.scrollIntoView({ block: "nearest" });
  }, [lines, question]);

  const busy = active !== null && status[active.id] === "running";
  const say = (line: Line) => setLines((l) => [...l, line]);

  async function run(doc: Doc) {
    if (busy || status[doc.id] !== "waiting") return;
    const me = ++token.current;
    const alive = () => token.current === me;
    const runNo = runs + 1;

    setRuns(runNo);
    setActive(doc);
    setFields({});
    setValues({});
    setStatus((s) => ({ ...s, [doc.id]: "running" }));
    setLines([{ tone: "head", text: `RUN #${runNo}`, detail: doc.name }]);
    // On phones the agent sits below the pile: bring it into view.
    agent.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });

    for (const [i, attempt] of doc.attempts.entries()) {
      await sleep(STEP_MS / 2);
      if (!alive()) return;
      say({ tone: "attempt", text: `Attempt ${i + 1}` });
      setFields((f) => Object.fromEntries(Object.entries(f).map(([k, v]) => [k, v === "bad" ? "checking" : v])));

      for (const step of attempt) {
        if ("field" in step && step.field && step.kind !== "fix") setFields((f) => ({ ...f, [step.field!]: "checking" }));
        await sleep(STEP_MS);
        if (!alive()) return;

        if (step.kind === "tool") say({ tone: "tool", text: `${step.tool}()`, detail: step.say });
        if (step.kind === "ok") {
          say({ tone: "ok", text: step.say });
          if (step.field) setFields((f) => ({ ...f, [step.field!]: "ok" }));
        }
        if (step.kind === "fail") {
          say({ tone: "fail", text: step.say, detail: "died" });
          if (step.field) setFields((f) => ({ ...f, [step.field!]: "bad" }));
        }
        if (step.kind === "fix") {
          say({ tone: "fix", text: step.say, detail: step.value });
          setValues((v) => ({ ...v, [step.field]: step.value }));
          setFields((f) => ({ ...f, [step.field]: "fixed" }));
        }
        if (step.kind === "ask") {
          say({ tone: "ask", text: step.say });
          setQuestion(step);
          const yes = await new Promise<boolean>((resolve) => (answer.current = resolve));
          if (!alive()) return;
          setQuestion(null);
          say({ tone: yes ? "ok" : "fail", text: yes ? `Human: “${step.yes}”` : `Human: “${step.no}”` });
          setFields((f) => ({ ...f, signature: yes ? "ok" : "bad" }));
          await sleep(STEP_MS);
          if (!alive()) return;
          return finish(doc, yes, i + 1);
        }
      }
    }
    await sleep(STEP_MS);
    if (!alive()) return;
    finish(doc, doc.end === "escaped", doc.attempts.length);
  }

  function finish(doc: Doc, escaped: boolean, attempts: number) {
    const tries = `${attempts} attempt${attempts > 1 ? "s" : ""}`;
    if (escaped) {
      say({ tone: "escaped", text: "ESCAPED", detail: `routed to ${doc.route} · ${tries}` });
      setEscapes((e) => e + 1);
    } else {
      say({ tone: "dead", text: "RUN OVER", detail: doc.deathNote ?? "" });
    }
    setStatus((s) => {
      const next = { ...s, [doc.id]: escaped ? "escaped" : "dead" } as Record<string, Status>;
      if (Object.values(next).every((v) => v !== "waiting" && v !== "running")) setOver(true);
      return next;
    });
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
    setFields({});
    setValues({});
    setLines([]);
    setQuestion(null);
    setRuns(0);
    setEscapes(0);
    setOver(false);
  }

  return (
    <div className="toy">
      <div className="toy-desk" aria-label="Documents to check">
        <p className="toy-hint">{busy ? "Agent is busy…" : "Drag a document onto the agent, or tap it."}</p>
        <ul className="toy-pile">
          {docs.map((d) => (
            <li key={d.id}>
              <button
                type="button"
                className={`toy-card is-${status[d.id]}`}
                draggable={!busy && status[d.id] === "waiting"}
                disabled={busy || status[d.id] !== "waiting"}
                onDragStart={(e) => e.dataTransfer.setData("text/plain", d.id)}
                onClick={() => run(d)}
              >
                <span className="toy-card-name">{d.name}</span>
                <span className="toy-card-kind">{d.kind}</span>
                {status[d.id] === "escaped" && <span className="toy-stamp ok">Escaped</span>}
                {status[d.id] === "dead" && <span className="toy-stamp bad">Rejected</span>}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div
        ref={agent}
        className={`toy-agent${busy ? " is-busy" : ""}`}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const doc = docs.find((d) => d.id === e.dataTransfer.getData("text/plain"));
          if (doc) run(doc);
        }}
      >
        <div className="toy-agent-head">
          <strong>agent</strong>
          <span>
            runs {runs} · escapes {escapes}
          </span>
        </div>

        {active ? (
          <div className={`toy-doc${active.blurry ? " is-blurry" : ""}`}>
            <p className="toy-doc-kind">{active.kind}</p>
            <dl>
              {active.fields.map((f) => (
                <div key={f.key} className={`toy-field ${fields[f.key] ? `is-${fields[f.key]}` : ""}`}>
                  <dt>{f.label}</dt>
                  <dd>{values[f.key] ?? (f.value || "—")}</dd>
                </div>
              ))}
            </dl>
          </div>
        ) : (
          <p className="toy-empty">Drop a document here.</p>
        )}

        <ol className="toy-log" aria-live="polite">
          {lines.map((l, i) => (
            <li key={i} className={`tone-${l.tone}`}>
              {l.text}
              {l.detail && <span> {l.tone === "tool" ? `— ${l.detail}` : l.tone === "fail" ? `(${l.detail})` : l.detail}</span>}
            </li>
          ))}
          {question && (
            <li className="toy-ask">
              <button type="button" onClick={() => reply(true)}>
                {question.yes}
              </button>
              <button type="button" onClick={() => reply(false)}>
                {question.no}
              </button>
            </li>
          )}
          <li ref={logEnd} aria-hidden="true" />
        </ol>

        {over && (
          <div className="toy-over">
            <p>
              {escapes === docs.length
                ? "Every run escaped. Suspicious, but the seller is live."
                : `${escapes} of ${docs.length} escaped. Seller gets a polite to-do list instead of a 3-day wait.`}
            </p>
            <button type="button" onClick={reset}>
              New run
            </button>
          </div>
        )}
      </div>

      <p className="toy-note">A toy. The documents and steps are made up.</p>
    </div>
  );
}
