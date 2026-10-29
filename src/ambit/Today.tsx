import { useEffect, useRef, useState } from "react";
import type { AppId } from "./AmbitOS";
import { Draft } from "./Draft";
import { LEVEL_WORDS, TOOLS } from "./guard";
import { Glyph, type AppIcon } from "./icons";
import { Hold } from "./views/Hold";
import { TaskView } from "./views/TaskView";
import { RENT, type Decision, type Proposal } from "./knows";
import { DONE_TOTAL, ITEMS, NOW, type Item, type Section } from "./seed";
import { useComputer } from "./store";
import { decisionFor, kindOf, type Kind, type Task } from "./tasks";

// Today: the home window. Four sections in a fixed order, so you always know where to look.
// Ambit's sentences are in its ink (brass); everything around them is yours.

const SECTIONS: { id: Section; label: string; mark: string }[] = [
  { id: "needs", label: "Needs you", mark: "◆" },
  { id: "working", label: "Working", mark: "◌" },
  { id: "done", label: "Done", mark: "✓" },
  { id: "declined", label: "Declined", mark: "⊘" },
];
const STEP_MARK = { done: "✓", now: "◌", next: "○" };
// Each kind of task has its own mark, so rows differ before you open them.
const KIND_GLYPH: Record<Kind, AppIcon> = { code: "branch", mail: "mail", schedule: "calendar", files: "files", web: "web" };

export type Row = Item & { task?: Task; mailId?: string; decision?: Decision; proposal?: Proposal };

/** Today as it stands: Ambit's live tasks, then what it did before you sat down. */
export function useToday(): Row[] {
  const { state } = useComputer();
  const on = (m?: string) => !m || state.modules.includes(m);
  const tasks: Row[] = state.tasks.filter((t) => on(t.module)).map((t) => {
    const section: Section = t.state === "needs" ? "needs" : t.state === "working" ? "working" : t.state === "declined" ? "declined" : "done";
    const title =
      t.undone ? `You undid this: ${t.titles.working[0].toLowerCase()}${t.titles.working.slice(1, -1)}. It’s all back as it was.` : t.state === "working" ? t.titles.working : t.state === "needs" ? (t.steps[t.at].waiting ?? t.titles.needs) : t.state === "declined" ? (t.titles.declined ?? `Stopped before: ${t.steps[t.at].text[0].toLowerCase()}${t.steps[t.at].text.slice(1)}.`) : t.outcome === "dropped" ? (t.titles.dropped ?? t.titles.done) : t.outcome === "byHand" ? (t.titles.byHand ?? t.titles.done) : t.titles.done;
    const now = t.steps[Math.min(t.at, t.steps.length - 1)];
    // A draft to review only while the step waiting is the one that sends it.
    const review = t.state === "needs" && now?.tool === "mail.send" ? t.draftId : undefined;
    return {
      id: t.id,
      section,
      kind: t.state === "needs" && review ? "Draft" : "Task",
      title,
      meta: t.state === "working" ? `${t.at} of ${t.steps.length}` : t.state === "needs" ? "ready" : undefined,
      why: t.why,
      check: t.stopped?.check ?? (t.state === "done" ? "finished inside the plan" : decisionFor(t, t.at, state, NOW.time).check),
      module: t.module as Item["module"],
      sources: t.sources,
      task: t,
      mailId: review ? t.draftId : undefined,
      open: review ? { app: "mail", target: review } : now?.tool.startsWith("files") ? { app: "files", target: "Downloads" } : t.module ? { app: now?.tool.startsWith("deploy") ? "deploys" : "code" } : undefined,
    };
  });
  const proposals: Row[] = state.proposals
    .filter((p) => on(p.module))
    .map((p) => ({ id: p.id, section: "needs", kind: "Proposal", title: p.text, why: p.why, check: "your call · nothing changes until you say yes", sources: [], proposal: p }));
  // Requests refused inside another agent's messages: listed under Declined, so the attempt is visible.
  const refused: Row[] = state.tasks.flatMap((t) =>
    (t.exchange ?? [])
      .filter((m) => m.refused)
      .map((m, n) => ({ id: `${t.id}-refused-${n}`, section: "declined" as const, title: m.refused!, why: `${m.who} wrote: “${m.text}”`, check: "hard limit · content can’t give orders", sources: [`The exchange in “${t.titles.working.replace(/\.$/, "")}”`] })),
  );
  const before: Row[] = ITEMS.filter((i) => on(i.module)).map((i) => {
    const chosen = i.id === RENT.id && state.decisions[RENT.id];
    if (chosen) {
      const pos = RENT.positions.find((p) => p.id === chosen)!;
      return { ...i, section: "done" as const, kind: undefined, meta: "by you", title: `You chose: ${pos.label.toLowerCase()}. Your answer to Mark is drafted.`, why: "It was your call. I laid out both sides and drafted what you chose.", check: "you · decided" };
    }
    if (i.id === RENT.id) return { ...i, decision: RENT };
    const m = i.answers && state.mail.find((x) => x.id === i.answers);
    return m && !m.tag ? { ...i, section: "done" as const, title: i.doneTitle ?? i.title, kind: undefined, meta: "by you", why: "You did this one by hand.", check: "you · by hand" } : i;
  });
  // Proposals can wait, so they come after anything that needs a decision today.
  return [...tasks, ...refused, ...before, ...proposals];
}

export function Today({ open, onOpen, onApp }: { open: string | null; onOpen: (id: string, section: Section) => void; onApp: (id: AppId, target?: string) => void }) {
  const { state } = useComputer();
  const rows = useToday();
  const needs = rows.filter((i) => i.section === "needs").length;
  const declined = rows.filter((i) => i.section === "declined").length;
  const extra = rows.filter((r) => r.section === "done").length - ITEMS.filter((i) => i.section === "done").length;
  return (
    <div className="am-today">
      <p className="am-today-hello">
        Thursday morning. <span className="am-ink">{needs ? `${needs === 1 ? "One thing needs" : `${count(needs)} things need`} you.` : "Nothing needs you."} I declined {count(declined).toLowerCase()}.</span>
      </p>
      {SECTIONS.map((s) => {
        const here = rows.filter((i) => i.section === s.id);
        const total = s.id === "done" ? DONE_TOTAL + extra : here.length;
        return (
          <section key={s.id} className={`am-sec is-${s.id}`} aria-label={s.label}>
            <h3>
              {s.id === "working" && state.paused ? "Paused" : s.label}
              <span>{total}</span>
            </h3>
            <ul>
              {here.map((i) => (
                <Line key={i.id} item={i} mark={s.id === "working" && state.paused ? "‖" : s.mark} open={open === i.id} onToggle={() => onOpen(i.id, s.id)} onApp={onApp} />
              ))}
            </ul>
            {s.id === "done" && <p className="am-more">and {total - here.length} smaller things, in Activity</p>}
            {!here.length && s.id !== "done" && <p className="am-more">Nothing.</p>}
          </section>
        );
      })}
    </div>
  );
}

/** A step the guard asked about that isn't an email: say what it will do, then approve or stop. */
function Approve({ task: t }: { task: Task }) {
  const { state, act } = useComputer();
  const st = t.steps[t.at];
  const d = t.stopped ?? decisionFor(t, t.at, state, NOW.time);
  return (
    <div className="am-draft am-approve">
      <p className="am-mono am-draft-to">Waiting for you · {d.check}</p>
      <p className="am-draft-body">
        <span className="am-ink">Next: {st.text[0].toLowerCase() + st.text.slice(1)}.</span>
      </p>
      <footer>Nothing happens until you approve. After this I carry on with the plan, and ask again before anything else that can’t be undone.</footer>
      <div className="am-actions">
        {TOOLS[st.tool].reversible ? (
          <button className="am-btn is-main" onClick={() => act({ type: "task.approve", id: t.id })}>
            {st.cta ?? "Approve"}
          </button>
        ) : (
          <Hold label={`Hold to ${(st.cta ?? "approve").toLowerCase()}`} holding="Keep holding…" note="This one can’t be undone." onDone={() => act({ type: "task.approve", id: t.id })} />
        )}
        {st.skip && (
          <button className="am-btn" onClick={() => act({ type: "task.skip", id: t.id })}>
            {st.skip}
          </button>
        )}
        <button className="am-btn is-quiet" onClick={() => act({ type: "task.stop", id: t.id })}>
          Stop the task
        </button>
      </div>
    </div>
  );
}

/** A step Ambit may never do (paying): it stops, and the task is yours on its desktop. */
function Handover({ task: t, onApp }: { task: Task; onApp: (id: AppId, target?: string) => void }) {
  const { act } = useComputer();
  return (
    <div className="am-draft am-approve">
      <p className="am-mono am-draft-to">Stopped · {t.stopped?.check}</p>
      <p className="am-draft-body">
        <span className="am-ink">I filled the form on my desktop and stopped before {t.steps[t.at].text[0].toLowerCase() + t.steps[t.at].text.slice(1)}. I don’t pay; you can.</span>
      </p>
      <div className="am-actions">
        <button
          className="am-btn is-main"
          onClick={() => {
            if (!t.held) act({ type: "task.takeover", id: t.id });
            onApp("desk");
          }}
        >
          {t.held ? "You have control: open Ambit’s desktop" : "Take over on Ambit’s desktop"}
        </button>
        <button className="am-btn is-quiet" onClick={() => act({ type: "task.stop", id: t.id })}>
          Stop the task
        </button>
      </div>
    </div>
  );
}

/** For anything a task did that can be undone: undo it all, or see it step by step in Activity. */
function Undo({ task: t, onApp }: { task: Task; onApp: (id: AppId, target?: string) => void }) {
  const { state, act } = useComputer();
  const can = state.activity.filter((e) => e.task === t.id && e.undo && !e.reverted);
  if (!can.length && !t.undone) return null;
  return (
    <div className="am-actions am-undo">
      {can.length > 0 && (
        <button className="am-btn" onClick={() => act({ type: "revert", ids: can.map((e) => e.id) })}>
          Undo what this did
        </button>
      )}
      <button className="am-link" onClick={() => onApp("activity", t.id)}>
        See it in Activity →
      </button>
    </div>
  );
}

/** A decision that's yours: positions side by side, each arguing its case. No recommendation. */
function Choose({ decision: d }: { decision: Decision }) {
  const { act } = useComputer();
  const [rule, setRule] = useState(false);
  return (
    <div className="am-decide">
      <p className="am-decide-lede">
        <span className="am-ink">This one’s yours. Each side argues its case; I don’t pick.</span> Decide by {d.by}.
      </p>
      <div className="am-positions">
        {d.positions.map((p) => (
          <section key={p.id} className="am-position">
            <h4>{p.label}</h4>
            <ul>
              {p.pros.map((x) => (
                <li key={x.text} className="is-pro">
                  <span aria-label="for">+</span> {x.text}
                  {x.source && <small>{x.source}</small>}
                </li>
              ))}
              {p.cons.map((x) => (
                <li key={x.text} className="is-con">
                  <span aria-label="against">−</span> {x.text}
                  {x.source && <small>{x.source}</small>}
                </li>
              ))}
            </ul>
            <p className="am-mono am-position-rev">Reversible: no</p>
            <button className="am-btn" onClick={() => act({ type: "decision.choose", id: d.id, pos: p.id, rule })}>
              Choose: {p.label.toLowerCase()}
            </button>
          </section>
        ))}
      </div>
      <label className="am-check">
        <input type="checkbox" checked={rule} onChange={(e) => setRule(e.target.checked)} /> Make my choice a rule for next time
      </label>
      <p className="am-mono am-decide-after">Choosing drafts a reply to Mark. You still read it before it goes.</p>
    </div>
  );
}

function Propose({ proposal: p, onApp }: { proposal: Proposal; onApp: (id: AppId, target?: string) => void }) {
  const { act } = useComputer();
  return (
    <div className="am-actions am-propose">
      <button
        className="am-btn is-main"
        onClick={() => {
          act({ type: "proposal.accept", id: p.id });
          if (p.kind === "skill") onApp("notes");
        }}
      >
        {p.yes}
      </button>
      <button className="am-btn" onClick={() => act({ type: "proposal.dismiss", id: p.id })}>
        {p.no}
      </button>
    </div>
  );
}

const count = (n: number) => ["None", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"][n] ?? String(n);

function Line({ item: i, mark, open, onToggle, onApp }: { item: Row; mark: string; open: boolean; onToggle: () => void; onApp: (id: AppId, target?: string) => void }) {
  const { state } = useComputer();
  const row = useRef<HTMLLIElement>(null);
  // An item opened from elsewhere (⌘K, the status item) may be below the fold.
  useEffect(() => {
    if (open) row.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [open]);
  const t = i.task;
  return (
    <li ref={row} className={`am-row${open ? " is-open" : ""}`}>
      <button className="am-row-head" aria-expanded={open} onClick={onToggle}>
        <span className={`am-row-mark${t ? ` is-kind is-${kindOf(t)}` : ""}`} aria-hidden="true">
          {t ? <Glyph name={KIND_GLYPH[kindOf(t)]} size={15} /> : mark}
        </span>
        <span className="am-row-title">
          {i.kind && i.section === "needs" && <em>{i.kind}</em>}
          <span className="am-ink">{i.title}</span>
          {i.module && <small className="am-tag">Developer</small>}
        </span>
        {i.meta && <span className="am-row-meta">{i.meta}</span>}
      </button>
      {open && (
        <div className="am-row-body">
          {i.mailId && <Draft id={i.mailId} />}
          {i.decision && <Choose decision={i.decision} />}
          {i.proposal && <Propose proposal={i.proposal} onApp={onApp} />}
          {t && <TaskView task={t} />}
          {t && t.state === "needs" && !i.mailId && (t.steps[t.at].handover ? <Handover task={t} onApp={onApp} /> : <Approve task={t} />)}
          {t && (t.state === "done" || t.state === "working") && <Undo task={t} onApp={onApp} />}
          {(t?.steps ?? i.steps) && (
            <details className="am-steps-more" open={!t || t.state !== "done"}>
              <summary>Steps, and what the guard decided at each</summary>
            <ol className="am-steps">
              {t
                ? t.steps.map((s, n) => {
                    const st = n < t.at || (t.state === "done" && t.outcome === "sent") ? "done" : n === t.at && t.state !== "done" ? "now" : "next";
                    const d = n === t.at && t.stopped ? t.stopped : decisionFor(t, n, state, NOW.time);
                    return (
                      <li key={n} className={`is-${st}${d.level === "never" ? " is-never" : ""}`}>
                        <span aria-hidden="true">{STEP_MARK[st]}</span>
                        <span>{s.text}</span>
                        <small title={d.check}>{LEVEL_WORDS[d.level]}</small>
                      </li>
                    );
                  })
                : i.steps!.map((s) => (
                    <li key={s.text} className={`is-${s.state}`}>
                      <span aria-hidden="true">{STEP_MARK[s.state]}</span>
                      <span>{s.text}</span>
                      <small>{s.guard}</small>
                    </li>
                  ))}
            </ol>
            </details>
          )}
          <dl className="am-why">
            <dt>Why</dt>
            <dd>{i.why}</dd>
            <dt>Decided by</dt>
            <dd className="am-mono">{i.check}</dd>
            {t && (
              <>
                <dt>Budget</dt>
                <dd className="am-mono">
                  people: {t.budget.people.join(", ") || "none"} · money: none · by {t.budget.until}
                </dd>
                <dt>Won’t touch</dt>
                <dd>{t.wontTouch.join(", ")}</dd>
              </>
            )}
            <dt>Sources</dt>
            <dd>
              <ul>
                {i.sources.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </dd>
          </dl>
          {i.open && i.section !== "done" && (
            <button className="am-link" onClick={() => onApp(i.open!.app, i.open!.target)}>
              Open in {i.open.app[0].toUpperCase() + i.open.app.slice(1)} →
            </button>
          )}
        </div>
      )}
    </li>
  );
}
