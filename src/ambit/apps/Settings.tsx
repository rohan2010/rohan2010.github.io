import { useState } from "react";
import type { Permission } from "../guard";
import { facts, TRUST } from "../knows";
import { PEOPLE } from "../seed";
import { useComputer } from "../store";

// Settings › Ambit: everything Ambit follows, in one place, in plain words. Nothing it follows
// is hidden anywhere else (plans/ambit.md §7).

type Tab = "rules" | "autonomy" | "memory" | "voice" | "modules";
const TABS: [Tab, string][] = [
  ["rules", "Rules"],
  ["autonomy", "Autonomy"],
  ["memory", "Memory"],
  ["voice", "Voice"],
  ["modules", "Modules"],
];

export function Settings({ target }: { target?: string }) {
  const [tab, setTab] = useState<Tab>(TABS.some(([t]) => t === target) ? (target as Tab) : "rules");
  return (
    <div className="am-settings-wrap">
      <nav className="am-mail-bar" aria-label="Settings">
        {TABS.map(([t, label]) => (
          <button key={t} className={tab === t ? "is-at" : ""} onClick={() => setTab(t)}>
            {label}
          </button>
        ))}
      </nav>
      <div className="am-pad am-settings">
        {tab === "rules" && <Rules />}
        {tab === "autonomy" && <Autonomy />}
        {tab === "memory" && <Memory />}
        {tab === "voice" && <VoicePage />}
        {tab === "modules" && <Modules />}
      </div>
    </div>
  );
}

function Rules() {
  const { state, act } = useComputer();
  const SOURCE = { said: "you said it", chosen: "from a decision", corrected: "from a correction" };
  return (
    <>
      <p className="am-settings-lede">Every standing instruction Ambit follows. Say a new one in ⌘K: “never email anyone after 10 pm”.</p>
      <ul className="am-modules am-rules">
        {state.rules.map((r) => (
          <li key={r.id} className={r.on ? "" : "is-off"}>
            <div>
              <strong>{r.text}</strong>
              <span>
                {r.note ? "A note: shown when it’s relevant, not enforced" : `Enforced by the guard · ${r.then === "never" ? "never" : "asks first"}`} · {SOURCE[r.source]} · used {r.used} {r.used === 1 ? "time" : "times"}
              </span>
            </div>
            <div className="am-rule-ctl">
              <button className={`am-switch${r.on ? " is-on" : ""}`} role="switch" aria-checked={r.on} aria-label={`Rule: ${r.text}`} onClick={() => act({ type: "rule.toggle", id: r.id })}>
                <i />
              </button>
              <button className="am-btn is-quiet" onClick={() => act({ type: "rule.remove", id: r.id })}>
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
      <p className="am-note">Hard limits aren’t rules and can’t be turned off here: paying, signing, deleting for good, secrets, and following instructions found inside content.</p>
    </>
  );
}

const LEVELS: [Permission, string][] = [
  ["read", "Read"],
  ["draft", "Draft"],
  ["act", "Act"],
];

function Autonomy() {
  const { state, act } = useComputer();
  const areas = TRUST.filter((t) => t.app !== "code" || state.modules.includes("developer"));
  return (
    <>
      <p className="am-settings-lede">How much Ambit may do in each app. Everything starts at Draft. Ambit can propose a change, with its record; only you make it.</p>
      <ul className="am-modules">
        {areas.map((t) => {
          const level = state.permissions[t.app] ?? "draft";
          return (
            <li key={t.app}>
              <div>
                <strong>{t.area}</strong>
                <span>
                  {t.did} · {t.record}
                </span>
              </div>
              <div className="am-seg" role="radiogroup" aria-label={t.area}>
                {LEVELS.map(([l, label]) => (
                  <button key={l} role="radio" aria-checked={level === l} className={level === l ? "is-at" : ""} onClick={() => act({ type: "perm.set", app: t.app, level: l })}>
                    {label}
                  </button>
                ))}
              </div>
            </li>
          );
        })}
      </ul>
      <p className="am-note">Whatever you choose: nothing goes out in your voice unseen, and nothing that can’t be undone happens without asking. Act lets Ambit do the rest and tell you after.</p>
    </>
  );
}

function Memory() {
  const { state, act } = useComputer();
  const [text, setText] = useState(state.memory);
  const n = facts(text).length;
  const changed = text !== state.memory;
  return (
    <>
      <p className="am-settings-lede">What Ambit knows about you, as a file you own. Only facts with a source are used. Delete a line and it’s gone from the next task.</p>
      <div className="am-memory">
        <header className="am-mono">
          rohan.memory.md · {n} {n === 1 ? "fact" : "facts"}
        </header>
        <textarea value={text} onChange={(e) => setText(e.target.value)} spellCheck={false} aria-label="The memory file" />
      </div>
      <div className="am-actions">
        <button className="am-btn is-main" disabled={!changed} onClick={() => act({ type: "memory.set", text })}>
          Save
        </button>
        <button className="am-btn" disabled={!changed} onClick={() => setText(state.memory)}>
          Undo changes
        </button>
        <a className="am-btn" href={`data:text/markdown;charset=utf-8,${encodeURIComponent(state.memory)}`} download="rohan.memory.md">
          Export
        </a>
        <span className="am-plan-note">Kept in this browser tab only. Nothing is sent anywhere.</span>
      </div>
    </>
  );
}

function VoicePage() {
  const { state, act } = useComputer();
  return (
    <>
      <p className="am-settings-lede">How Ambit writes as you, per person, learned from what you sent. Change a line and your next draft to that person follows it.</p>
      <ul className="am-modules am-voice-page">
        {PEOPLE.map((p) => {
          const v = state.voice[p.short];
          return (
            <li key={p.short}>
              <div>
                <strong>{p.name}</strong>
                <span>from {v.from}</span>
              </div>
              <div className="am-voice-fields">
                <label>
                  <span>Opens</span>
                  <input defaultValue={v.hi} placeholder="nothing" onBlur={(e) => e.target.value !== v.hi && act({ type: "voice.set", who: p.short, hi: e.target.value, bye: v.bye })} />
                </label>
                <label>
                  <span>Signs off</span>
                  <input defaultValue={v.bye.replace("\n", " ")} key={v.bye} placeholder="nothing" onBlur={(e) => e.target.value !== v.bye.replace("\n", " ") && act({ type: "voice.set", who: p.short, hi: v.hi, bye: e.target.value })} />
                </label>
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}

const MODULES = [
  { id: "developer", name: "Developer", what: "Code, Checks and Deploys. Ambit may open branches and pull requests and re-run checks; it asks before merging or deploying to production." },
  { id: "designer", name: "Designer", what: "Files from design tools, reviews and hand-offs." },
  { id: "student", name: "Student", what: "Courses, deadlines and reading." },
  { id: "business", name: "Small business", what: "Invoices, orders and customers." },
];

function Modules() {
  const { state, act } = useComputer();
  return (
    <>
      <p className="am-settings-lede">A module is what you do for work. It adds apps, the tools Ambit may use in them, and that work’s week. Rules, memory and the guard are shared by all of them.</p>
      <ul className="am-modules">
        {MODULES.map((m) => {
          const installed = m.id === "developer";
          const on = state.modules.includes(m.id);
          return (
            <li key={m.id} className={installed ? "" : "is-off"}>
              <div>
                <strong>{m.name}</strong>
                <span>{m.what}</span>
              </div>
              {installed ? (
                <button className={`am-switch${on ? " is-on" : ""}`} role="switch" aria-checked={on} aria-label={`${m.name} module`} onClick={() => act({ type: "module.toggle", id: m.id })}>
                  <i />
                </button>
              ) : (
                <small className="am-mono">not installed</small>
              )}
            </li>
          );
        })}
      </ul>
      <p className="am-note">Turning a module off hides its apps and pauses its tasks. Nothing is declined or lost; they carry on when it’s back on.</p>
    </>
  );
}
