import { stepState, type Task } from "../tasks";

// A web task as the page it's on: the form filling in field by field as its step runs, and a
// padlock across the one thing Ambit never does. The full page is on Ambit's desktop.

const FIELDS: [string, string][] = [
  ["Name", "Rohan Pant"],
  ["People", "4"],
  ["When", "Fri 18:30"],
  ["Phone", "98450 12345"],
];

export function WebView({ task: t }: { task: Task }) {
  const fill = t.steps.findIndex((s) => s.tool === "web.fill");
  const filled = fill >= 0 && stepState(t, fill) === "done";
  const pay = t.steps.findIndex((s) => s.tool === "pay");
  const stopped = t.state === "needs" && t.at === pay;
  const yours = t.outcome === "byHand";

  return (
    <figure className="am-web" aria-label="The booking page">
      <div className="am-web-bar am-mono">olive.in/book</div>
      <div className="am-web-form">
        {FIELDS.map(([k, v], i) => (
          <span key={k} className={`am-web-field${filled ? " is-filled" : ""}`} style={{ "--i": i } as React.CSSProperties}>
            <small>{k}</small>
            <b className={yours ? "" : "am-ink"}>{filled ? v : ""}</b>
          </span>
        ))}
      </div>
      <div className={`am-web-pay${stopped ? " is-locked" : ""}${yours ? " is-paid" : ""}`}>
        <span className="am-web-lock" aria-hidden="true" />
        <span>{yours ? "₹500 deposit · paid by you" : stopped ? "₹500 deposit · Ambit stops here" : "₹500 deposit"}</span>
      </div>
    </figure>
  );
}
