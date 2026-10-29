import { useState } from "react";
import { newId, useComputer } from "../store";
import { DAYS, NOW, WEEKS } from "../seed";

// Calendar by hand: two weeks, add an event, remove one. Ambit's holds are tentative and drawn
// in its ink; releasing one by hand is allowed, and the task that made it asks again later.

export function Calendar({ target }: { target?: string }) {
  const { state, act } = useComputer();
  const [week, setWeek] = useState<0 | 1>(target === "1" ? 1 : 0);
  const [at, setAt] = useState<string | null>(null);
  const [adding, setAdding] = useState<string | null>(null);
  const [form, setForm] = useState({ time: "10:00", title: "" });
  const picked = state.events.find((e) => e.id === at);

  return (
    <div className="am-cal-wrap">
      <nav className="am-cal-bar" aria-label="Weeks">
        {WEEKS.map((w, i) => (
          <button key={w} className={week === i ? "is-at" : ""} onClick={() => (setWeek(i as 0 | 1), setAt(null))}>
            {w}
          </button>
        ))}
      </nav>
      <div className="am-cal">
        {DAYS.map((d) => (
          <div key={d} className={`am-cal-day${week === 0 && d === NOW.weekday ? " is-today" : ""}`}>
            <h4>
              {d}
              <button aria-label={`Add an event on ${d}`} onClick={() => (setAdding(d), setAt(null), setForm({ time: "10:00", title: "" }))}>
                +
              </button>
            </h4>
            {state.events
              .filter((e) => e.week === week && e.day === d)
              .sort((a, b) => a.time.localeCompare(b.time, undefined, { numeric: true }))
              .map((e) => (
                <button key={e.id} className={`am-ev${e.author === "ambit" ? " is-ambit" : ""}${at === e.id ? " is-at" : ""}`} onClick={() => (setAt(at === e.id ? null : e.id), setAdding(null))}>
                  <time>{e.time}</time>
                  <span className={e.author === "ambit" ? "am-ink" : ""}>{e.title}</span>
                </button>
              ))}
            {adding === d && (
              <form
                className="am-ev-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!form.title.trim()) return;
                  act({ type: "event.add", event: { id: newId("ev"), week, day: d, time: form.time, title: form.title.trim(), author: "you" } });
                  setAdding(null);
                }}
              >
                <input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} aria-label="Time" />
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="What" aria-label="What" autoFocus />
                <div>
                  <button className="am-btn is-main">Add</button>
                  <button type="button" className="am-btn is-quiet" onClick={() => setAdding(null)}>
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        ))}
      </div>
      {picked && (
        <footer className="am-cal-pick">
          <p>
            <strong className={picked.author === "ambit" ? "am-ink" : ""}>{picked.title}</strong>
            <span className="am-mono">
              {picked.day} {picked.time} · {picked.author === "ambit" ? "held by Ambit, tentative" : "added by you"}
            </span>
          </p>
          {picked.author === "ambit" && <p className="am-ev-note">Held for the task “Finding 45 min with Sam”. Releasing it is fine; the task will ask you before holding again.</p>}
          <button className="am-btn" onClick={() => (act({ type: "event.remove", id: picked.id }), setAt(null))}>
            {picked.author === "ambit" ? "Release hold" : "Remove"}
          </button>
        </footer>
      )}
    </div>
  );
}
