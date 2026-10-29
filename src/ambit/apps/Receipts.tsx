import { useComputer } from "../store";

// Receipts (plans/ambit.md bet 13): every outward act, newest first. What went, to whom, who
// sent it and under which check, and whether it can be taken back.

export function Receipts() {
  const { state } = useComputer();
  if (!state.receipts.length)
    return (
      <div className="am-pad am-later">
        <p>Nothing has gone out today. When something does, by Ambit or by you, it’s listed here: what, to whom, under which rule and budget, and whether it can be taken back.</p>
      </div>
    );
  return (
    <ul className="am-receipts">
      {state.receipts.map((r) => (
        <li key={r.id}>
          <header>
            <strong>{r.what}</strong>
            <time className="am-mono">{r.at}</time>
          </header>
          <dl className="am-why">
            <dt>To</dt>
            <dd>
              {r.to} · “{r.subject}”
            </dd>
            <dt>Sent by</dt>
            <dd>{r.by}</dd>
            <dt>Decided by</dt>
            <dd className="am-mono">{r.check}</dd>
            {r.task && (
              <>
                <dt>Task</dt>
                <dd>{r.task}</dd>
              </>
            )}
            {r.budget && (
              <>
                <dt>Budget</dt>
                <dd className="am-mono">{r.budget}</dd>
              </>
            )}
            <dt>Undo</dt>
            <dd>{r.undo}</dd>
          </dl>
        </li>
      ))}
    </ul>
  );
}
