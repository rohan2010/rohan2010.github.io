import { useState } from "react";
import { useComputer } from "../store";

// Activity (plans/ambit.md §7.6): everything that happened, newest first, by Ambit or by you.
// Revert one thing, a whole task, or everything since a point. What can't be undone says why.

type Who = "all" | "ambit" | "you";

export function Activity({ target }: { target?: string }) {
  const { state, act } = useComputer();
  const [who, setWho] = useState<Who>("all");
  const [task, setTask] = useState<string | undefined>(target);
  const list = state.activity.filter((e) => (who === "all" || e.by === who) && (!task || e.task === task));
  const t = task && state.tasks.find((x) => x.id === task);
  const since = (n: number) => state.activity.filter((e) => e.n >= n && e.undo && !e.reverted).map((e) => e.id);

  return (
    <div className="am-activity">
      <nav className="am-mail-bar" aria-label="Filter">
        {(["all", "ambit", "you"] as Who[]).map((w) => (
          <button key={w} className={who === w ? "is-at" : ""} onClick={() => setWho(w)}>
            {w === "all" ? "Everything" : w === "ambit" ? "By Ambit" : "By you"}
          </button>
        ))}
        {t && (
          <button className="am-btn" onClick={() => setTask(undefined)}>
            Only “{t.titles.working.replace(/\.$/, "")}” ×
          </button>
        )}
      </nav>
      {t && list.some((e) => e.undo && !e.reverted) && (
        <div className="am-activity-task">
          <span>Undo everything this task did that can be undone.</span>
          <button className="am-btn is-main" onClick={() => act({ type: "revert", ids: list.filter((e) => e.undo && !e.reverted).map((e) => e.id) })}>
            Revert the task
          </button>
        </div>
      )}
      {!list.length && <p className="am-pad am-empty">Nothing yet. Everything Ambit or you do from now on is listed here, with a way back.</p>}
      <ol className="am-timeline">
        {list.map((e) => (
          <li key={e.id} className={`${e.reverted ? "is-reverted" : ""} is-${e.by}`}>
            <time className="am-mono">{e.at}</time>
            <div>
              {e.lines.map((l, i) => (
                <p key={i}>
                  <small className={`am-tag${l.by === "ambit" ? " is-draft" : ""}`}>{l.by === "ambit" ? "Ambit" : "you"}</small> <span className={l.by === "ambit" ? "am-ink" : ""}>{l.what}</span>
                </p>
              ))}
              {e.reverted && <p className="am-mono am-timeline-note">Reverted</p>}
              {!e.reverted && e.cant && <p className="am-mono am-timeline-note">Can’t be undone · {e.cant}</p>}
              {!e.reverted && e.warn && <p className="am-mono am-timeline-note">{e.warn}</p>}
              {!e.reverted && e.undo && (
                <div className="am-actions">
                  <button className="am-btn" onClick={() => act({ type: "revert", ids: [e.id] })}>
                    Revert
                  </button>
                  {since(e.n).length > 1 && (
                    <button className="am-btn is-quiet" onClick={() => act({ type: "revert", ids: since(e.n) })}>
                      Revert this and everything after ({since(e.n).length})
                    </button>
                  )}
                </div>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
