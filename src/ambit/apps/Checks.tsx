import { useState } from "react";
import { useComputer } from "../store";

// Checks (Developer module): CI runs, newest first. Ambit may re-run a check; it can't mark
// one as passed. A real failure fails again until the fix is in.

export function Checks() {
  const { state, act } = useComputer();
  const runs = state.dev.runs;
  const [at, setAt] = useState(runs[0]?.id);
  const r = runs.find((x) => x.id === at) ?? runs[0];

  return (
    <div className="am-mail am-checks">
      <nav className="am-mail-bar" aria-label="Checks">
        <span className="am-mono am-code-repo">ana/invoices</span>
        <span className={`am-chip is-${state.dev.main.checks}`}>main {state.dev.main.checks === "passing" ? "passes" : "is failing"}</span>
      </nav>
      <ul className="am-mail-list">
        {runs.map((x) => (
          <li key={x.id}>
            <button className={x.id === r?.id ? "is-at" : ""} onClick={() => setAt(x.id)}>
              <span className="am-mail-from">
                <span>
                  <i className={`am-dot is-${x.state}`} aria-hidden="true" /> {x.target} · {x.name}
                </span>
                <time>{x.when}</time>
              </span>
              <span className="am-mail-subj">
                {x.state} · {x.by === "ambit" ? "run by Ambit" : x.by === "you" ? "run by you" : "scheduled"}
              </span>
            </button>
          </li>
        ))}
      </ul>
      {r && (
        <article className="am-mail-read">
          <h3>
            {r.target} · {r.name}
          </h3>
          <p className="am-mono">
            {r.state} at {r.when}
          </p>
          <pre className="am-log">{r.log}</pre>
          <div className="am-actions">
            <button className="am-btn" onClick={() => act({ type: "dev.rerun", id: r.id })}>
              Re-run
            </button>
          </div>
        </article>
      )}
    </div>
  );
}
