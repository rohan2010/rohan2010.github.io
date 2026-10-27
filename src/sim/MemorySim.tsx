"use client";

import { Screen, useSim, useTimeline, type SimStep } from "./Screen";
import "./memory.css";

// DecentralMem, playable: Monday's chat writes two decisions to project memory and ends.
// Thursday's chat starts empty, asks, and gets the constraint back. It follows the repo's own
// cross-session test. The conversation and similarity scores are made up for the demo.

const STEPS: SimStep[] = [
  { id: "client", label: "Claude, over MCP", note: "Desktop or Claude Code" },
  { id: "mcp", label: "MCP server", note: "write and search; key checked" },
  { id: "pg", label: "PostgreSQL", note: "the record, written first" },
  { id: "emb", label: "Embedding service", note: "self-hosted FastAPI" },
  { id: "qd", label: "Qdrant", note: "vectors, one project at a time" },
  { id: "cwm", label: "Context budget", note: "trims results to fit" },
];
const MEMORY = [
  { type: "constraint", text: "Auth must use JWT tokens. No server sessions.", score: 0.83 },
  { type: "decision", text: "API stays REST, versioned under /v1.", score: 0.31 },
];
const BUDGET = 80_000; // 40% of Claude's 200K context

// Frame by frame: the step that's working and what the status bar says.
const FRAMES: { step: string; status: string }[] = [
  { step: "client", status: "Monday. A decision comes up in chat." },
  { step: "mcp", status: "Claude calls the write tool. The API key is checked first." },
  { step: "pg", status: "PostgreSQL stores the record. If this fails, the write fails." },
  { step: "emb", status: "The self-hosted embedding service turns it into 768 numbers." },
  { step: "qd", status: "Qdrant indexes the vector, filed under this project only." },
  { step: "pg", status: "A second decision goes in the same way." },
  { step: "client", status: "The chat ends. Its history is gone; the memory isn’t." },
  { step: "client", status: "Thursday. A new chat that knows nothing yet." },
  { step: "emb", status: "Claude calls the search tool. The question is embedded." },
  { step: "qd", status: "Qdrant finds the nearest memories in this project." },
  { step: "pg", status: "The full records are loaded from PostgreSQL." },
  { step: "cwm", status: "They fit the context budget, so nothing is cut: pass “full”." },
  { step: "client", status: "Claude answers from Monday’s memory." },
];
const DELAYS = [2200, 2000, 1900, 1900, 1900, 2200, 2400, 2200, 2000, 2200, 1800, 2400, 6000] as const;

export function MemorySim() {
  const sim = useSim();
  const tl = useTimeline(DELAYS, sim.live);
  const i = tl.i;
  const frame = FRAMES[i];
  const seen = new Set(FRAMES.slice(0, i).map((f) => f.step));
  seen.delete(frame.step);

  const rows = i >= 5 ? 2 : i >= 2 ? 1 : 0;
  const vectors = i >= 5 ? 2 : i >= 4 ? 1 : 0;
  const ended = i >= 6;
  const searching = i >= 8;
  const used = i >= 11 ? 64 : 0;

  return (
    <Screen
      {...sim}
      title="Memory Simulator"
      app="DecentralMem"
      steps={STEPS}
      active={frame.step}
      done={[...seen]}
      status={frame.status}
      progress={i / (FRAMES.length - 1)}
      onNext={tl.last ? undefined : tl.next}
      onBack={i > 0 ? tl.back : undefined}
      onReplay={tl.replay}
      note="The conversation and the similarity scores are made up. The flow (write, end the session, search from a fresh one) is the repo’s own cross-session test."
    >
      <div className="mm">
        <div className="mm-chats">
          <section className={`mm-chat sim-pane${ended ? " is-ended" : ""}`} aria-label="Session A">
            <header>
              <strong>Session A</strong>
              <span>Monday</span>
              {ended && <span className="sim-pill">Ended</span>}
            </header>
            <div className="mm-thread">
              <p className="mm-msg is-you">Let’s lock it in: auth must use JWT tokens. No server sessions.</p>
              {i >= 1 && (
                <p className="mm-tool">
                  maml_write_context <span>type: constraint</span>
                  <em>{i >= 4 ? "✓ stored · indexed" : i >= 2 ? "✓ stored" : "key ok…"}</em>
                </p>
              )}
              {i >= 5 && (
                <>
                  <p className="mm-msg is-you">And the API stays REST, versioned under /v1.</p>
                  <p className="mm-tool">
                    maml_write_context <span>type: decision</span>
                    <em>✓ stored · indexed</em>
                  </p>
                </>
              )}
            </div>
          </section>

          <section className={`mm-chat sim-pane${i < 7 ? " is-pending" : ""}`} aria-label="Session B">
            <header>
              <strong>Session B</strong>
              <span>Thursday · new chat</span>
            </header>
            <div className="mm-thread">
              {i < 7 ? (
                <p className="mm-empty">No history.</p>
              ) : (
                <>
                  <p className="mm-msg is-you">What auth approach did we decide on?</p>
                  {searching && (
                    <p className="mm-tool">
                      maml_search_context <span>“auth approach”</span>
                      <em>{i >= 11 ? `✓ ${MEMORY.length} results · full` : "searching…"}</em>
                    </p>
                  )}
                  {i >= 12 && (
                    <p className="mm-msg is-ai">
                      You decided auth must use <b>JWT tokens</b>, with no server sessions. That’s a constraint saved in Monday’s session.
                    </p>
                  )}
                </>
              )}
            </div>
          </section>
        </div>

        <div className="mm-store">
          <div className={`mm-panel sim-pane${frame.step === "pg" ? " is-on" : ""}`}>
            <p className="sim-label">PostgreSQL · the record</p>
            <table>
              <thead>
                <tr>
                  <th>type</th>
                  <th>content</th>
                  <th>index</th>
                </tr>
              </thead>
              <tbody>
                {MEMORY.slice(0, rows).map((m, n) => (
                  <tr key={m.type} className={i === 10 ? "is-hit" : undefined}>
                    <td>
                      <span className="mm-type">{m.type}</span>
                    </td>
                    <td>{m.text}</td>
                    <td>{vectors > n ? "indexed" : "pending"}</td>
                  </tr>
                ))}
                {!rows && (
                  <tr>
                    <td colSpan={3} className="mm-none">
                      empty
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className={`mm-panel sim-pane${frame.step === "qd" || frame.step === "emb" ? " is-on" : ""}`}>
            <p className="sim-label">Qdrant · project vectors</p>
            <div className="mm-vectors">
              {Array.from({ length: 2 }, (_, n) => (
                <span key={n} className={`mm-dot${vectors > n ? " is-in" : ""}${i >= 9 && n === 0 ? " is-near" : ""}`} style={{ left: `${[34, 72][n]}%`, top: `${[38, 62][n]}%` }} />
              ))}
              {searching && <span className="mm-dot is-query" style={{ left: "40%", top: "48%" }} />}
              {i >= 9 && (
                <svg className="mm-link" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                  <line x1="40" y1="48" x2="34" y2="38" />
                </svg>
              )}
            </div>
            {i >= 9 && (
              <ul className="mm-hits">
                {MEMORY.map((m) => (
                  <li key={m.type}>
                    <span className="mm-type">{m.type}</span>
                    <b>{m.score.toFixed(2)}</b>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className={`mm-panel sim-pane${frame.step === "cwm" ? " is-on" : ""}`}>
            <p className="sim-label">Context budget · Claude</p>
            <div className="mm-budget">
              <span style={{ width: `${Math.max(used ? 1.5 : 0, (used / BUDGET) * 100)}%` }} />
            </div>
            <p className="mm-budget-text">
              <b>{used}</b> of {BUDGET.toLocaleString("en-US")} tokens · pass <b>{used ? "full" : "–"}</b>
            </p>
          </div>
        </div>
      </div>
    </Screen>
  );
}
