import { useComputer } from "../store";
import { Hold } from "../views/Hold";

// Deploys (Developer module): what's on staging and production, and what was there before.
// Staging Ambit may deploy and tell you; production it always asks about first.

export function Deploys() {
  const { state, act } = useComputer();
  const { main, deploys, history } = state.dev;
  const task = state.tasks.find((t) => t.module === "developer" && t.state === "needs" && t.steps[t.at].tool === "deploy.production");

  return (
    <div className="am-pad am-deploys">
      <p className="am-mono am-deploys-main">
        main · {main.sha} · {main.what} · {main.checks === "passing" ? "checks pass" : "checks failing"}
      </p>
      <div className="am-envs">
        {deploys.map((d) => (
          <section key={d.env} className="am-env">
            <h4>{d.env}</h4>
            <p className="am-env-sha">
              {d.sha}
              {d.sha === main.sha ? <small> · up to date</small> : <small> · behind main</small>}
            </p>
            <p className={d.by === "ambit" ? "am-ink" : ""}>{d.what}</p>
            <p className="am-mono am-env-when">
              {d.when} · {d.by === "ambit" ? "by Ambit" : "by you"}
            </p>
            {d.sha !== main.sha && (
              <div className="am-actions">
                {d.env === "production" && task ? (
                  <Hold label="Hold to deploy" note="Customers see it at once." onDone={() => act({ type: "task.approve", id: task.id })} />
                ) : (
                  <button className="am-btn" onClick={() => act({ type: "dev.deploy", env: d.env })}>
                    Deploy main yourself
                  </button>
                )}
              </div>
            )}
            {d.sha !== main.sha && main.checks === "failing" && <p className="am-env-warn">Main’s checks are failing. You can still deploy; Ambit wouldn’t.</p>}
          </section>
        ))}
      </div>
      {history.length > 0 && (
        <>
          <h4 className="am-deploys-h">Before</h4>
          <ul className="am-list">
            {history.map((d, i) => (
              <li key={i}>
                <span>
                  {d.env} was {d.sha}: {d.what}
                </span>
                <small>
                  {d.when} · {d.by === "ambit" ? "by Ambit" : "by you"}
                </small>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
