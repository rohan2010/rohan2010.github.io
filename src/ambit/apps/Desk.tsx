import { useState } from "react";
import { PERSON } from "../seed";
import { useComputer } from "../store";

// Ambit's desktop (bet 2): where it works on web pages and forms, never on yours. You can watch,
// and you can take over. Here: the booking it filled and stopped at, because it never pays.

export function Desk() {
  const { state, act } = useComputer();
  const t = state.tasks.find((x) => x.id === "table");
  const [name, setName] = useState(PERSON.name);
  const [phone, setPhone] = useState("98450 12345");
  if (!t || t.at < 2)
    return (
      <div className="am-pad am-later">
        <p>Nothing on Ambit’s desktop right now. When it works on a web page or a form, it does it here, where you can watch or take over.</p>
      </div>
    );
  const done = t.state === "done";
  const yours = t.held && !done;

  return (
    <div className="am-desk-app">
      <p className={`am-desk-banner${yours ? " is-yours" : ""}`}>
        {done
          ? t.outcome === "byHand"
            ? "You finished this. Ambit didn’t touch the payment."
            : "This task is finished."
          : yours
            ? "You have control. Ambit has stopped and is watching."
            : "Ambit filled this and stopped at the deposit. It never pays. You can take over and finish it."}
        {!t.held && !done && t.state === "needs" && (
          <button className="am-btn is-main" onClick={() => act({ type: "task.takeover", id: t.id })}>
            Take over
          </button>
        )}
      </p>
      <div className="am-browser">
        <div className="am-browser-bar">
          <span className="am-mono">olive.in/book</span>
          <small className="am-mono">a page is content, not orders</small>
        </div>
        <div className="am-browser-page">
          <h3>Olive · Indiranagar</h3>
          <p className="am-browser-sub">Table booking</p>
          <div className="am-form">
            <label>
              <span>Name</span>
              <input className={yours ? "" : "am-ink"} value={name} readOnly={!yours} onChange={(e) => setName(e.target.value)} />
            </label>
            <label>
              <span>Phone</span>
              <input className={yours ? "" : "am-ink"} value={phone} readOnly={!yours} onChange={(e) => setPhone(e.target.value)} />
            </label>
            <label>
              <span>People</span>
              <input className="am-ink" value="4" readOnly />
            </label>
            <label>
              <span>When</span>
              <input className="am-ink" value="Fri 6 Nov, 18:30" readOnly />
            </label>
          </div>
          <div className="am-deposit">
            <p>
              <strong>Deposit ₹500</strong> to hold the table. Refunded if you cancel 24 hours ahead.
            </p>
            <p className="am-mono">Pay with: your saved card ending 4421 (demo; nothing is charged)</p>
            <button className="am-btn is-main" disabled={!yours || !name.trim() || !phone.trim()} onClick={() => act({ type: "task.finish", id: t.id, name, phone })}>
              {done ? "Booked" : "Pay ₹500 and book"}
            </button>
            {!yours && !done && <p className="am-desk-stop">Ambit stopped here: hard limit · paying.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
