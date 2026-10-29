"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { Apps, type AmbitProject } from "./apps";
import { Glyph, Mark, type AppIcon } from "./icons";
import { ITEMS, NOW, PERSON } from "./seed";
import { LEVEL_WORDS } from "./guard";
import { ComputerProvider, useComputer } from "./store";
import { decisionFor, type Task } from "./tasks";
import { understand } from "./understand";
import { Today, useToday } from "./Today";
import { Voice } from "./Voice";
import "./ambit.css";

// Ambit OS (plans/ambit.md §13). Step 1: the shell and the morning: menu bar with the status
// item, windows, a dock, ⌘K and Today. Step 2: the apps work by hand, over shared state
// (store.tsx). Step 3: ⌘K hands work off as a plan with a budget, tasks run step by step through
// the guard (guard.ts), drafts come back in two inks, and whatever goes out leaves a receipt.
// Step 4: the Developer module (dev.ts): Code, Checks, Deploys, and a switch in Settings.
// Step 5: what you tell Ambit (knows.ts): decisions, rules, autonomy, the memory file, your voice.
// Step 6: Activity with revert, Ambit's own desktop with take-over, and skills handed back.

export type AppId = "today" | "mail" | "calendar" | "files" | "notes" | "projects" | "code" | "checks" | "deploys" | "receipts" | "activity" | "desk" | "settings" | "about";
// target: what the app should show when opened from elsewhere (a message, a week, a folder).
// n changes whenever a new target arrives, so the app starts over at it.
type Win = { id: AppId; x: number; y: number; w: number; h: number; z: number; min?: boolean; max?: boolean; target?: string; n: number };

export const APPS: Record<AppId, { title: string; icon: AppIcon; w: number; h: number }> = {
  today: { title: "Today", icon: "today", w: 480, h: 780 },
  mail: { title: "Mail", icon: "mail", w: 780, h: 520 },
  calendar: { title: "Calendar", icon: "calendar", w: 780, h: 440 },
  files: { title: "Files", icon: "files", w: 740, h: 420 },
  notes: { title: "Notes", icon: "notes", w: 680, h: 440 },
  projects: { title: "Projects", icon: "projects", w: 760, h: 560 },
  code: { title: "Code", icon: "code", w: 820, h: 520 },
  checks: { title: "Checks", icon: "checks", w: 760, h: 460 },
  deploys: { title: "Deploys", icon: "deploys", w: 640, h: 420 },
  receipts: { title: "Receipts", icon: "receipts", w: 560, h: 520 },
  activity: { title: "Activity", icon: "activity", w: 640, h: 600 },
  desk: { title: "Ambit’s desktop", icon: "desk", w: 640, h: 560 },
  settings: { title: "Settings", icon: "settings", w: 720, h: 600 },
  about: { title: "About this computer", icon: "about", w: 460, h: 400 },
};
const DOCK: (AppId | "|")[] = ["today", "|", "mail", "calendar", "files", "notes", "projects", "|", "code", "checks", "deploys", "|", "receipts", "activity", "desk", "settings"];
const DEV: AppId[] = ["code", "checks", "deploys"];

const MENU_H = 30;
// Phones get the voice surface, not a shrunken desktop.
const PHONE = "(max-width: 700px)";
const noop = () => () => {};
const isPhone = () => window.matchMedia(PHONE).matches;
const onPhoneChange = (cb: () => void) => {
  const mq = window.matchMedia(PHONE);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};
const DOCK_H = 76;

/** The morning, as four things to try. Each is ticked by doing it, not by reading it. */
export type Tried = "status" | "needs" | "working" | "declined";
const TRY: { id: Tried; text: string }[] = [
  { id: "status", text: "Read the status item, top right." },
  { id: "needs", text: "Open something that needs you." },
  { id: "working", text: "Open a task: see what the guard decided at each step." },
  { id: "declined", text: "Find what Ambit declined, and why." },
];

/** "2 working · 1 needs you", leaving out whichever is zero. */
export function statusLine({ working, needs }: { working: number; needs: number }) {
  const parts = [working && `${working} working`, needs && `${needs} ${needs === 1 ? "needs" : "need"} you`].filter(Boolean);
  return parts.length ? parts.join(" · ") : "All quiet";
}

/** How the desk hands over: where the monitor's glass is (to zoom from), a project to open
 *  first (a #os/<slug> link), and how to stand up again. All optional, so the OS also runs alone. */
export type Desk = { from?: { x: number; y: number; w: number; h: number } | null; start?: string; onExit?: () => void };

export function AmbitOS({ projects, ...desk }: { projects: AmbitProject[] } & Desk) {
  return (
    <ComputerProvider>
      <Shell projects={projects} desk={desk} />
    </ComputerProvider>
  );
}

function Shell({ projects, desk }: { projects: AmbitProject[]; desk: Desk }) {
  const { from, start, onExit } = desk;
  const root = useRef<HTMLDivElement>(null);
  const { state, act } = useComputer();
  const today = useToday();
  const paused = state.paused;
  const dev = state.modules.includes("developer");
  const ready = useSyncExternalStore(noop, () => true, () => false);
  const phone = useSyncExternalStore(onPhoneChange, isPhone, () => false);
  const [booting, setBooting] = useState(true);
  const [desktopAnyway, setDesktopAnyway] = useState(false);
  const [wins, setWins] = useState<Win[]>([]);
  const [menu, setMenu] = useState<string | null>(null);
  const [palette, setPalette] = useState(false);
  const [open, setOpen] = useState<string | null>(null);
  const [tried, setTried] = useState<Set<Tried>>(new Set());
  const [tryShut, setTryShut] = useState(false);
  const top = useRef(1);

  const counts = { working: today.filter((i) => i.section === "working").length, needs: today.filter((i) => i.section === "needs").length };
  const unread = state.mail.filter((m) => m.folder === "inbox" && m.unread).length;
  const tick = useCallback((t: Tried) => setTried((s) => (s.has(t) ? s : new Set(s).add(t))), []);

  // ── Windows ─────────────────────────────────────────────────────────
  const launch = useCallback((id: AppId, target?: string) => {
    setMenu(null);
    setWins((list) => {
      top.current += 1;
      if (list.some((w) => w.id === id)) return list.map((w) => (w.id === id ? { ...w, min: false, z: top.current, ...(target !== undefined && { target, n: w.n + 1 }) } : w));
      const a = APPS[id];
      const vw = window.innerWidth;
      const vh = window.innerHeight - MENU_H - DOCK_H;
      const w = Math.min(a.w, vw - 32);
      const h = Math.min(a.h, vh - 24);
      const n = list.length;
      const x = id === "today" ? 24 : Math.max(16, Math.min(vw - w - 24, 490 + n * 28));
      const y = id === "today" ? 16 : Math.max(12, Math.min(vh - h - 12, 24 + n * 28));
      return [...list, { id, x, y, w, h, z: top.current, target, n: 0 }];
    });
  }, []);
  const close = (id: AppId) => setWins((list) => list.filter((w) => w.id !== id));
  const minimise = (id: AppId) => setWins((list) => list.map((w) => (w.id === id ? { ...w, min: true } : w)));
  const focus = (id: AppId) =>
    setWins((list) => {
      const w = list.find((x) => x.id === id);
      if (!w || w.z === top.current) return list;
      top.current += 1;
      return list.map((x) => (x.id === id ? { ...x, z: top.current } : x));
    });
  const change = (id: AppId, to: Partial<Win>) => setWins((list) => list.map((w) => (w.id === id ? { ...w, ...to } : w)));
  const front = wins.filter((w) => !w.min).sort((a, b) => b.z - a.z)[0]?.id;

  // Open a Today item from anywhere (⌘K, the status menu, the voice surface).
  const reveal = useCallback(
    (id: string) => {
      launch("today");
      setOpen(id);
      const section = today.find((i) => i.id === id)?.section;
      if (section === "needs" || section === "working" || section === "declined") tick(section);
    },
    [launch, tick, today],
  );

  // ── Start ───────────────────────────────────────────────────────────
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const f = requestAnimationFrame(() => {
      launch("today");
      if (start) launch("projects", start);
    });
    const t = window.setTimeout(() => setBooting(false), reduced ? 0 : 1500);
    return () => {
      cancelAnimationFrame(f);
      window.clearTimeout(t);
    };
  }, [launch, start]);

  // Sitting down: the screen grows out of the monitor's glass. Standing up: it shrinks back.
  const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  useLayoutEffect(() => {
    const el = root.current;
    if (!el || !from || reduced()) return;
    el.style.transformOrigin = "0 0";
    el.style.transform = `translate(${from.x}px, ${from.y}px) scale(${from.w / window.innerWidth}, ${from.h / window.innerHeight})`;
    const f = requestAnimationFrame(() => {
      el.style.transition = "transform 0.45s cubic-bezier(.32,.72,0,1)";
      el.style.transform = "none";
    });
    return () => cancelAnimationFrame(f);
  }, [from, ready, phone]);
  const [leaving, setLeaving] = useState(false);
  const standUp = () => setLeaving(true);
  useEffect(() => {
    const el = root.current;
    if (!leaving || !onExit) return;
    if (!el || !from || reduced()) return onExit();
    el.style.transform = `translate(${from.x}px, ${from.y}px) scale(${from.w / window.innerWidth}, ${from.h / window.innerHeight})`;
    const t = window.setTimeout(onExit, 420);
    return () => window.clearTimeout(t);
  }, [leaving, from, onExit]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPalette((p) => !p);
      } else if (e.key === "Escape") {
        setPalette(false);
        setMenu(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!ready) return <div className="am" aria-busy="true" />;
  if (phone && !desktopAnyway) return <Voice counts={counts} onDesktop={() => setDesktopAnyway(true)} onExit={onExit} />;

  const status = paused ? "paused" : counts.needs ? "needs" : "working";
  const menus: Record<string, { label: string; run?: () => void; off?: boolean }[]> = {
    ambit: [
      { label: "About this computer", run: () => launch("about") },
      { label: "Settings…", run: () => launch("settings") },
      { label: "Restart the morning", run: () => window.location.reload() },
      ...(onExit ? [{ label: "Stand up from the desk", run: standUp }] : []),
    ],
    File: [{ label: "Hand something off…  ⌘K", run: () => setPalette(true) }],
    View: [
      { label: "Today", run: () => launch("today") },
      { label: "Activity", run: () => launch("activity") },
      { label: "Receipts", run: () => launch("receipts") },
      { label: "Ambit’s desktop", run: () => launch("desk") },
    ],
    Window: wins.length ? wins.map((w) => ({ label: APPS[w.id].title, run: () => launch(w.id) })) : [{ label: "No windows", off: true }],
  };

  return (
    <div className="am" ref={root} role="dialog" aria-modal="true" aria-label="Ambit OS, the computer on Rohan’s desk" onPointerDown={() => menu && setMenu(null)}>
      {/* ── Menu bar ── */}
      <header className="am-bar" onPointerDown={(e) => e.stopPropagation()}>
        <nav className="am-menus" aria-label="Menus">
          {Object.keys(menus).map((m) => (
            <div key={m} className="am-menu">
              <button className={`am-menu-btn${m === "ambit" ? " is-logo" : ""}${menu === m ? " is-open" : ""}`} aria-expanded={menu === m} onClick={() => setMenu(menu === m ? null : m)} onPointerEnter={() => menu && menu !== m && setMenu(m)}>
                {m === "ambit" ? (
                  <>
                    <Mark /> Ambit
                  </>
                ) : (
                  m
                )}
              </button>
              {menu === m && (
                <ul className="am-drop" role="menu">
                  {menus[m].map((it) => (
                    <li key={it.label}>
                      <button role="menuitem" disabled={it.off} onClick={() => (setMenu(null), it.run?.())}>
                        {it.label}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
          {front && <span className="am-front">{APPS[front].title}</span>}
        </nav>
        <div className="am-tray">
          <span className="am-chip" title="Rohan’s name on a made-up week. Everything on this computer is demo data.">
            {PERSON.first}
            {dev && " · Developer"}
          </span>
          <span className="am-chip is-quiet" title="No model is running. Ambit's words are written in advance.">
            Scripted
          </span>
          <button className="am-search" aria-label="Find (⌘K)" onClick={() => setPalette(true)}>
            <Glyph name="search" size={16} />
          </button>
          <div className="am-menu">
            <button
              className={`am-status is-${status}${menu === "status" ? " is-open" : ""}`}
              aria-expanded={menu === "status"}
              onClick={() => {
                setMenu(menu === "status" ? null : "status");
                tick("status");
              }}
            >
              <i aria-hidden="true" />
              {paused ? "Paused" : statusLine(counts)}
            </button>
            {menu === "status" && (
              <div className="am-drop am-status-drop" role="menu">
                <button className="am-pause" onClick={() => act({ type: "pause.toggle" })}>
                  {paused ? "Resume all" : "Pause all"}
                  <small>{paused ? "Tasks carry on from where they stopped." : "Every task stops at the end of its current step."}</small>
                </button>
                {(["needs", "working"] as const).map((s) => (
                  <div key={s} className="am-status-group">
                    <p>{s === "needs" ? "Needs you" : paused ? "Paused" : "Working"}</p>
                    {today.filter((i) => i.section === s).map((i) => (
                      <button key={i.id} role="menuitem" onClick={() => (setMenu(null), reveal(i.id))}>
                        <span className="am-ink">{i.title}</span>
                        {i.meta && <small>{i.meta}</small>}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
          {onExit && (
            <button className="am-standup" onClick={standUp}>
              ↩ Stand up
            </button>
          )}
          <time className="am-clock">
            {NOW.day} {NOW.time}
          </time>
        </div>
      </header>

      {/* ── Desktop ── */}
      <main className="am-desk" aria-label="Desktop">
        {wins.filter((w) => dev || !DEV.includes(w.id)).map((w) => (
          <Window key={w.id} win={w} front={w.id === front} onFocus={() => focus(w.id)} onClose={() => close(w.id)} onMin={() => minimise(w.id)} onChange={(to) => change(w.id, to)}>
            {w.id === "today" ? (
              <Today
                open={open}
                onOpen={(id, section) => {
                  setOpen(open === id ? null : id);
                  if (open !== id && section !== "done") tick(section);
                  if (open !== id && state.tasks.some((t) => t.id === id)) tick("working");
                }}
                onApp={launch}
              />
            ) : (
              <Apps key={w.n} id={w.id} target={w.target} projects={projects} onApp={launch} onBig={() => change(w.id, { max: true })} />
            )}
          </Window>
        ))}

        {!tryShut && (
          <aside className="am-try" aria-label="Try this">
            <header>
              <p>Try this · your morning</p>
              <button aria-label="Close" onClick={() => setTryShut(true)}>
                ×
              </button>
            </header>
            <ol>
              {TRY.map((t) => (
                <li key={t.id} className={tried.has(t.id) ? "is-done" : ""}>
                  <span aria-hidden="true">{tried.has(t.id) ? "✓" : ""}</span>
                  {t.text}
                </li>
              ))}
            </ol>
            {tried.size === TRY.length && <p className="am-try-end">That’s the morning: what needs you, what’s running, what it refused. Handing off work comes in the next build.</p>}
          </aside>
        )}
      </main>

      {/* ── Dock ── */}
      <footer className="am-dock-wrap">
        <nav className="am-dock" aria-label="Dock">
          {DOCK.filter((id, n) => dev || (!DEV.includes(id as AppId) && !(id === "|" && DOCK[n - 1] === "deploys"))).map((id, n) =>
            id === "|" ? (
              <span key={n} className="am-dock-gap" aria-hidden="true" />
            ) : (
              <button key={id} className={`am-dock-app${wins.some((w) => w.id === id) ? " is-running" : ""}${DEV.includes(id) ? " is-module" : ""}`} onClick={() => launch(id)} aria-label={APPS[id].title}>
                <Glyph name={APPS[id].icon} />
                {id === "mail" && unread > 0 && <b className="am-badge">{unread}</b>}
                <span className="am-tip">{DEV.includes(id) ? `${APPS[id].title} · Developer module` : APPS[id].title}</span>
              </button>
            ),
          )}
        </nav>
      </footer>

      {palette && <Palette onClose={() => setPalette(false)} onApp={launch} onItem={reveal} />}

      {booting && (
        <div className="am-boot" onClick={() => setBooting(false)}>
          <div>
            <Mark size={34} />
            <p className="am-boot-name">Ambit OS</p>
            <p className="am-boot-line">
              Good morning, {PERSON.first}. <span className="am-ink">Ambit worked overnight.</span>
            </p>
            <p className="am-boot-note am-mono">A made-up week. Scripted; no model is running.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function Window({ win, front, children, onFocus, onClose, onMin, onChange }: { win: Win; front: boolean; children: React.ReactNode; onFocus: () => void; onClose: () => void; onMin: () => void; onChange: (to: Partial<Win>) => void }) {
  const drag = useRef<{ dx: number; dy: number } | null>(null);
  const size = useRef<{ x: number; y: number; w: number; h: number } | null>(null);
  const a = APPS[win.id];
  return (
    <section
      className={`am-win${front ? " is-front" : ""}${win.min ? " is-min" : ""}${win.max ? " is-max" : ""}`}
      style={{ left: win.x, top: win.y, width: win.w, height: win.h, zIndex: win.z }}
      aria-label={a.title}
      onPointerDown={onFocus}
    >
      <header
        className="am-win-bar"
        onDoubleClick={(e) => !(e.target as HTMLElement).closest("button") && onChange({ max: !win.max })}
        onPointerDown={(e) => {
          if ((e.target as HTMLElement).closest("button") || win.max) return;
          e.currentTarget.setPointerCapture(e.pointerId);
          drag.current = { dx: e.clientX - win.x, dy: e.clientY - win.y };
        }}
        onPointerMove={(e) => {
          if (!drag.current) return;
          const x = Math.max(-win.w + 100, Math.min(window.innerWidth - 100, e.clientX - drag.current.dx));
          const y = Math.max(0, Math.min(window.innerHeight - MENU_H - DOCK_H - 30, e.clientY - drag.current.dy));
          onChange({ x, y });
        }}
        onPointerUp={() => (drag.current = null)}
      >
        <Glyph name={a.icon} size={16} />
        <h2>{a.title}</h2>
        <button aria-label={`Minimise ${a.title}`} onClick={onMin}>
          –
        </button>
        <button aria-label={win.max ? `Restore ${a.title}` : `Maximise ${a.title}`} onClick={() => onChange({ max: !win.max })}>
          {win.max ? "❐" : "□"}
        </button>
        <button aria-label={`Close ${a.title}`} onClick={onClose}>
          ×
        </button>
      </header>
      <div className="am-win-body">{children}</div>
      {!win.max && (
        <span
          className="am-win-size"
          aria-hidden="true"
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            size.current = { x: e.clientX, y: e.clientY, w: win.w, h: win.h };
          }}
          onPointerMove={(e) => {
            const s = size.current;
            if (!s) return;
            onChange({ w: Math.max(320, s.w + e.clientX - s.x), h: Math.max(220, s.h + e.clientY - s.y) });
          }}
          onPointerUp={() => (size.current = null)}
        />
      )}
    </section>
  );
}

// ⌘K: find anything on this computer, or hand work off. A hand-off never runs from here
// directly: it shows the plan and its budget first, with what the guard will do at each step.
function Palette({ onClose, onApp, onItem }: { onClose: () => void; onApp: (id: AppId, target?: string) => void; onItem: (id: string) => void }) {
  const { state, act } = useComputer();
  const [q, setQ] = useState("");
  const [at, setAt] = useState(0);
  const heard = useMemo(() => understand(q, state), [q, state]);
  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    const has = (...t: string[]) => t.join(" ").toLowerCase().includes(s);
    const apps = (Object.keys(APPS) as AppId[]).filter((id) => !s || has(APPS[id].title)).map((id) => ({ key: `app:${id}`, group: "Apps", label: APPS[id].title, icon: APPS[id].icon, run: () => onApp(id) }));
    if (!s) return apps.slice(0, 9);
    const found = [
      ...ITEMS.filter((i) => has(i.title, i.why, ...i.sources)).map((i) => ({ key: i.id, group: "Today", label: i.title, icon: "today" as AppIcon, run: () => onItem(i.id) })),
      ...state.tasks.filter((t) => has(t.titles.working, t.intent)).map((t) => ({ key: t.id, group: "Today", label: t.titles.working, icon: "today" as AppIcon, run: () => onItem(t.id) })),
      ...state.mail.filter((m) => has(m.subject, m.from, m.to, m.body)).map((m) => ({ key: m.id, group: "Mail", label: m.subject, icon: "mail" as AppIcon, run: () => onApp("mail", m.id) })),
      ...state.files.filter((f) => has(f.name)).map((f) => ({ key: f.id, group: "Files", label: f.name, icon: "files" as AppIcon, run: () => onApp("files", f.where) })),
      ...state.notes.filter((n) => has(n.title, n.body)).map((n) => ({ key: n.id, group: "Notes", label: n.title, icon: "notes" as AppIcon, run: () => onApp("notes") })),
    ];
    return [...found, ...apps].slice(0, heard ? 4 : 9);
  }, [q, onApp, onItem, state, heard]);
  const start = () => {
    if (heard?.kind === "rule") {
      act({ type: "rule.add", rule: heard.rule });
      onApp("settings", "rules");
      return onClose();
    }
    if (heard?.kind !== "plan") return;
    act({ type: "task.add", task: heard.task });
    onItem(heard.task.id);
    onClose();
  };
  const run = (n: number) => {
    if (heard?.kind === "plan" || heard?.kind === "rule") return start();
    const r = results[n];
    if (!r) return;
    r.run();
    onClose();
  };

  return (
    <div className="am-scrim" onPointerDown={onClose}>
      <div className="am-palette" role="dialog" aria-label="Find or hand off" onPointerDown={(e) => e.stopPropagation()}>
        <label>
          <Glyph name="search" size={18} />
          <input
            autoFocus
            value={q}
            placeholder="Find something, or hand it off: “reply to Dad saying…”"
            onChange={(e) => (setQ(e.target.value), setAt(0))}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown" || e.key === "ArrowUp") {
                e.preventDefault();
                setAt((n) => Math.max(0, Math.min(n + (e.key === "ArrowDown" ? 1 : -1), results.length - 1)));
              }
              if (e.key === "Enter") run(at);
            }}
          />
          <kbd>esc</kbd>
        </label>
        {heard?.kind === "plan" && <PlanPreview task={heard.task} onRun={start} onCancel={() => setQ("")} />}
        {heard?.kind === "rule" && (
          <div className="am-plan">
            <p className="am-plan-title">{heard.rule.text}</p>
            <p className={heard.rule.note ? "am-ink" : ""}>{heard.read}</p>
            <div className="am-actions">
              <button className="am-btn is-main" onClick={start}>
                {heard.rule.note ? "Keep as a note" : "Add the rule"} <kbd>↵</kbd>
              </button>
              <button className="am-btn is-quiet" onClick={() => setQ("")}>
                Cancel
              </button>
              <span className="am-plan-note">You can turn it off or delete it in Settings › Rules.</span>
            </div>
          </div>
        )}
        {heard?.kind === "say" && (
          <div className="am-palette-intent">
            <p className="am-ink">{heard.say}</p>
            {heard.reveal && (
              <button className="am-link" onClick={() => (onItem(heard.reveal!), onClose())}>
                Show it in Today →
              </button>
            )}
          </div>
        )}
        {!q.trim() && <p className="am-palette-hint">Try “45 min with Priya next week”, “reply to Dad saying I’ll come on Sunday”, “tidy Downloads”, or a rule: “never email anyone after 10 pm”.</p>}
        <ul>
          {results.map((r, n) => (
            <li key={r.key}>
              <button className={n === at && !heard ? "is-at" : ""} onPointerEnter={() => setAt(n)} onClick={() => run(n)}>
                <Glyph name={r.icon} size={16} />
                <span>{r.label}</span>
                <small>{r.group}</small>
              </button>
            </li>
          ))}
          {!results.length && !heard && <li className="am-palette-none">Nothing on this computer matches.</li>}
        </ul>
      </div>
    </div>
  );
}

function PlanPreview({ task, onRun, onCancel }: { task: Task; onRun: () => void; onCancel: () => void }) {
  const { state } = useComputer();
  const steps = task.steps.map((s, i) => ({ s, d: decisionFor(task, i, state, NOW.time) }));
  const asks = steps.filter((x) => x.d.level === "ask");
  return (
    <div className="am-plan">
      <p className="am-plan-title am-ink">{task.titles.working.replace(/\.$/, "")}</p>
      <dl>
        <dt>will read</dt>
        <dd>{task.reads.join(" · ")}</dd>
        <dt>steps</dt>
        <dd>
          <ol>
            {steps.map(({ s, d }, i) => (
              <li key={i}>
                <span>{s.text}</span>
                <small className={`is-${d.level}`} title={d.check}>
                  {LEVEL_WORDS[d.level]}
                </small>
              </li>
            ))}
          </ol>
        </dd>
        <dt>will ask you</dt>
        <dd>{asks.length ? asks.map((x) => `before: ${x.s.text[0].toLowerCase()}${x.s.text.slice(1)}`).join(" · ") : "nothing; every step can be undone"}</dd>
        <dt>won’t touch</dt>
        <dd>{task.wontTouch.join(" · ")}</dd>
        <dt>budget</dt>
        <dd className="am-mono">
          people: {task.budget.people.join(", ") || "none"} · money: none · by {task.budget.until}
        </dd>
      </dl>
      <div className="am-actions">
        <button className="am-btn is-main" onClick={onRun}>
          Run <kbd>↵</kbd>
        </button>
        <button className="am-btn is-quiet" onClick={onCancel}>
          Cancel
        </button>
        <span className="am-plan-note">Anything outside this plan or budget comes back to you as a question.</span>
      </div>
    </div>
  );
}
