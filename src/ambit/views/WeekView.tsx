import { DAYS } from "../seed";
import { useComputer } from "../store";
import type { Task } from "../tasks";

// A scheduling task as the week it's working in: what's already there in grey, Ambit's holds
// dashed in brass, the one that's kept turning solid, the one let go fading to an outline.
// Under it, the exchange with the other side's agent as a conversation, and the budget as a
// fence: whoever it would add from outside waits at the edge until you say.

const FROM = 9;
const TO = 17;

export function WeekView({ task: t }: { task: Task }) {
  const { state } = useComputer();
  const hold = t.steps.find((s) => s.do?.kind === "hold")?.do;
  const holds = hold?.kind === "hold" ? hold.holds : [];
  const week = holds[0]?.week ?? 1;
  const ids = new Set(holds.map((h) => h.id));
  const others = state.events.filter((e) => e.week === week && !ids.has(e.id));
  const add = t.steps.find((s) => s.do?.kind === "addPerson");
  const outsider = add?.person;
  const waitingOnOutsider = t.state === "needs" && t.steps[t.at] === add;
  const top = (time: string) => {
    const [h, m] = time.split(":").map(Number);
    return `${Math.max(0, Math.min(1, (h + m / 60 - FROM) / (TO - FROM))) * 100}%`;
  };

  return (
    <figure className="am-week" aria-label="The week Ambit is scheduling in">
      <div className="am-week-grid">
        {DAYS.slice(0, 5).map((d) => (
          <div key={d} className="am-week-day">
            <span className="am-week-name">{d}</span>
            <div className="am-week-col">
              {others
                .filter((e) => e.day === d && Number(e.time.split(":")[0]) >= FROM && Number(e.time.split(":")[0]) < TO)
                .map((e) => (
                  <span key={e.id} className="am-week-ev" style={{ top: top(e.time) }} title={`${e.time} ${e.title}`}>
                    {e.title}
                  </span>
                ))}
              {holds
                .filter((h) => h.day === d)
                .map((h) => {
                  const now = state.events.find((e) => e.id === h.id);
                  const cls = !now ? "is-released" : now.tentative ? "is-held" : "is-kept";
                  return (
                    <span key={h.id} className={`am-week-hold ${cls}`} style={{ top: top(h.time) }}>
                      <b>{h.time}</b>
                      {cls === "is-released" ? "let go" : cls === "is-kept" ? (now!.title.includes("Raj") ? "booked, with Raj" : "booked") : "held"}
                    </span>
                  );
                })}
            </div>
          </div>
        ))}
      </div>
      {outsider && (t.exchange?.length ?? 0) > 0 && (
        <div className={`am-fence${waitingOnOutsider ? " is-asking" : ""}`}>
          <span className="am-fence-in">
            <small>budget</small>
            {t.budget.people.map((p) => p.split(" ")[0]).join(", ")}
          </span>
          <span className="am-fence-out">
            {outsider.split(" ")[0]} {waitingOnOutsider ? "is waiting outside it" : state.events.some((e) => e.title.includes("Raj")) ? "came in: you said yes" : "stayed out"}
          </span>
        </div>
      )}
      {t.exchange && (
        <ol className="am-chat" aria-label="The exchange with Sam’s agent">
          {t.exchange.map((m, i) => (
            <li key={i} className={`is-${m.from}`}>
              <small>{m.who}</small>
              <p className={m.from === "ambit" ? "am-ink" : ""}>{m.text}</p>
            </li>
          ))}
        </ol>
      )}
    </figure>
  );
}
