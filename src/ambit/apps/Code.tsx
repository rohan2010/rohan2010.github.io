import { useState } from "react";
import { useComputer } from "../store";

// Code (Developer module): your pull requests. Ambit's PR is marked as its own; merging it
// goes through the same approval as anything else that teammates will see. Your own PRs you
// merge by hand.

export function Code() {
  const { state, act } = useComputer();
  const { prs, main } = state.dev;
  const [at, setAt] = useState(prs.find((p) => p.state === "open")?.n ?? prs[0]?.n);
  const pr = prs.find((p) => p.n === at);
  const task = state.tasks.find((t) => t.module === "developer" && t.state === "needs" && t.steps[t.at].tool === "code.merge");
  const waits = pr && task?.steps[task.at].do?.kind === "merge" && (task.steps[task.at].do as { pr: number }).pr === pr.n;

  return (
    <div className="am-mail am-code">
      <nav className="am-mail-bar" aria-label="Repository">
        <span className="am-mono am-code-repo">ana/invoices</span>
        <span className={`am-chip is-${main.checks}`}>
          main · {main.sha} · {main.checks === "passing" ? "checks pass" : "checks failing"}
        </span>
      </nav>
      <ul className="am-mail-list">
        {prs.map((p) => (
          <li key={p.n}>
            <button className={p.n === at ? "is-at" : ""} onClick={() => setAt(p.n)}>
              <span className="am-mail-from">
                #{p.n} {p.state === "merged" ? "· merged" : ""}
                <time>{p.when}</time>
              </span>
              <span className={`am-mail-subj${p.by === "ambit" ? " am-ink" : ""}`}>{p.title}</span>
              <small className={`am-tag${p.by === "ambit" ? " is-draft" : ""}`}>{p.by === "ambit" ? "opened by Ambit" : "yours"}</small>
            </button>
          </li>
        ))}
      </ul>
      {pr ? (
        <article className="am-mail-read">
          <h3 className={pr.by === "ambit" ? "am-ink" : ""}>
            #{pr.n} {pr.title}
          </h3>
          <p className="am-mono">
            {pr.branch} → {pr.into} · {pr.state} · checks {pr.checks}
          </p>
          <p className={`am-mail-body${pr.by === "ambit" ? " am-ink" : ""}`}>{pr.body}</p>
          {pr.diff.map((d) => (
            <figure key={d.file} className="am-diff">
              <figcaption className="am-mono">{d.file}</figcaption>
              <pre>
                {d.minus.map((l) => (
                  <span key={`-${l}`} className="is-minus">
                    {`- ${l}\n`}
                  </span>
                ))}
                {d.plus.map((l) => (
                  <span key={`+${l}`} className="is-plus">
                    {`+ ${l}\n`}
                  </span>
                ))}
              </pre>
            </figure>
          ))}
          <div className="am-actions">
            {pr.state === "open" && pr.by === "you" && (
              <button className="am-btn" onClick={() => act({ type: "dev.merge", n: pr.n })}>
                Merge
              </button>
            )}
            {pr.state === "open" && waits && task && (
              <>
                <button className="am-btn is-main" onClick={() => act({ type: "task.approve", id: task.id })}>
                  Merge #{pr.n}
                </button>
                <span className="am-plan-note">Ambit asked first: teammates see a merge.</span>
              </>
            )}
            {pr.state === "open" && pr.by === "ambit" && !waits && <span className="am-plan-note">Ambit is still checking this. It asks before merging.</span>}
          </div>
        </article>
      ) : (
        <article className="am-mail-read am-empty">No pull requests.</article>
      )}
    </div>
  );
}
