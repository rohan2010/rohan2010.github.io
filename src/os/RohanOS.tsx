"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { SIMS } from "@/sim/sims";
import { Design, designSize } from "./Design";
import { Icon, type IconName } from "./icons";
import "./os.css";

// rohanOS: the computer on the desk. A small System 7-style window manager.
// Click selects, double-click (or Enter, or a tap on touch screens) opens.

export type OsProject = {
  slug: string;
  name: string;
  oneLine: string;
  status: string;
  year: string;
  readmeHtml: string;
  links: { code?: string; paper?: string };
  demo?: string;
  caseStudy?: string | null;
  design?: { nodes: { id: string; label: string; note?: string }[]; edges: [string, string][] };
};

type Rect = { x: number; y: number; w: number; h: number };
type Kind = "projects" | "project" | "readme" | "design" | "demo" | "about" | "trash" | "info";
type Win = { id: string; kind: Kind; title: string; slug?: string; text?: string; x: number; y: number; w: number; h: number; z: number };
type FileItem = { id: string; name: string; kind: string; icon: IconName; open: () => void };

const MENU_H = 24;
const MENUS = {
  logo: ["About rohanOS…", "Stand up from the desk"],
  File: ["Open", "Close window", "Stand up"],
  Special: ["Clean up windows", "Empty trash…"],
} as const;
// Touch screens and phone-width windows open on a single tap; a mouse selects, then double-clicks.
const isTouch = () => typeof window !== "undefined" && window.matchMedia("(pointer: coarse), (max-width: 700px)").matches;

export function RohanOS({ projects, from, start, onExit, onRoute }: { projects: OsProject[]; from: Rect | null; start?: string; onExit: () => void; onRoute: (slug?: string) => void }) {
  const [phase, setPhase] = useState<"zoom" | "boot" | "on" | "off">(from ? "zoom" : "boot");
  const [wins, setWins] = useState<Win[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [menu, setMenu] = useState<string | null>(null);
  const [clock, setClock] = useState("");
  const root = useRef<HTMLDivElement>(null);
  const top = useRef(10);
  const reduced = useRef(false);

  const find = (slug?: string) => projects.find((p) => p.slug === slug);

  // ── Window manager ──────────────────────────────────────────────────
  const open = useCallback(
    (kind: Kind, title: string, slug?: string, size: { w: number; h: number } = { w: 460, h: 320 }, text?: string) => {
      const id = `${kind}:${slug ?? title}`;
      setWins((list) => {
        top.current += 1;
        const existing = list.find((w) => w.id === id);
        if (existing) return list.map((w) => (w.id === id ? { ...w, z: top.current } : w));
        const n = list.length;
        const vw = window.innerWidth;
        const vh = window.innerHeight - MENU_H;
        const w = Math.min(size.w, vw - 24);
        const h = Math.min(size.h, vh - 40);
        const x = Math.max(8, Math.min(40 + n * 26, vw - w - 8));
        const y = Math.max(8, Math.min(28 + n * 26, vh - h - 8));
        return [...list, { id, kind, title, slug, text, x, y, w, h, z: top.current }];
      });
      if (kind === "project") onRoute(slug);
    },
    [onRoute],
  );
  const close = useCallback((id: string) => setWins((list) => list.filter((w) => w.id !== id)), []);
  const focus = (id: string) =>
    setWins((list) => {
      top.current += 1;
      return list.map((w) => (w.id === id ? { ...w, z: top.current } : w));
    });
  const topWin = wins.reduce<Win | null>((a, w) => (!a || w.z > a.z ? w : a), null);

  const standUp = useCallback(() => {
    setMenu(null);
    if (reduced.current || !from) return onExit();
    setPhase("off");
    setTimeout(onExit, 420);
  }, [from, onExit]);

  // ── Boot: zoom from the monitor, a startup screen, then the desktop ──
  useLayoutEffect(() => {
    reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const el = root.current;
    if (!el) return;
    if (from && !reduced.current) {
      const sx = from.w / window.innerWidth;
      const sy = from.h / window.innerHeight;
      el.style.transformOrigin = "0 0";
      el.style.transform = `translate(${from.x}px, ${from.y}px) scale(${sx}, ${sy})`;
      el.getBoundingClientRect();
      el.style.transition = "transform 0.55s cubic-bezier(.32,.72,0,1)";
      el.style.transform = "none";
    }
    const boot = setTimeout(() => setPhase("boot"), from && !reduced.current ? 450 : 0);
    const on = setTimeout(() => setPhase("on"), reduced.current ? 0 : from ? 1350 : 900);
    return () => {
      clearTimeout(boot);
      clearTimeout(on);
    };
  }, [from]);

  useEffect(() => {
    if (phase !== "off" || !from || !root.current) return;
    const el = root.current;
    el.style.transform = `translate(${from.x}px, ${from.y}px) scale(${from.w / window.innerWidth}, ${from.h / window.innerHeight})`;
  }, [phase, from]);

  // The desktop opens with the Projects window, and the deep-linked project if any.
  useEffect(() => {
    if (phase !== "on") return;
    open("projects", "Projects", undefined, { w: 520, h: 230 });
    const p = find(start);
    if (p) open("project", p.name, p.slug, { w: 440, h: 270 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Clock, scroll lock, focus.
  useEffect(() => {
    const tick = () => setClock(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    tick();
    const timer = setInterval(tick, 15000);
    const overflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    root.current?.focus();
    return () => {
      clearInterval(timer);
      document.documentElement.style.overflow = overflow;
    };
  }, []);

  // Esc closes the menu, then the top window, then stands up from the desk.
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.preventDefault();
      if (menu) setMenu(null);
      else if (topWin) close(topWin.id);
      else standUp();
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [menu, topWin, close, standUp]);

  // ── What each window shows ──────────────────────────────────────────
  const filesOf = (p: OsProject): FileItem[] => {
    const files: FileItem[] = [{ id: "readme", name: "README.md", kind: "SimpleText document", icon: "markdown", open: () => open("readme", `${p.name}: README.md`, p.slug, { w: 520, h: 440 }) }];
    if (p.design) {
      const size = designSize(p.design.nodes, p.design.edges);
      files.push({ id: "design", name: "system design", kind: "Drawing", icon: "drawing", open: () => open("design", `${p.name}: system design`, p.slug, { w: size.width + 32, h: size.height + 52 }) });
    }
    if (p.demo) {
      const sim = SIMS[p.demo];
      files.push({ id: "demo", name: sim?.name ?? "Demo", kind: "Application", icon: "app", open: () => open("demo", sim?.name ?? "Demo", p.slug, { w: 1040, h: 720 }) });
    }
    if (p.links.code) files.push({ id: "code", name: "code", kind: "Alias to GitHub", icon: "alias", open: () => window.open(p.links.code, "_blank", "noopener") });
    if (p.links.paper) files.push({ id: "paper", name: "paper", kind: "Alias to arXiv", icon: "alias", open: () => window.open(p.links.paper, "_blank", "noopener") });
    if (p.caseStudy) files.push({ id: "case", name: "case study", kind: "Alias to page", icon: "alias", open: () => (window.location.href = p.caseStudy!) });
    return files;
  };

  const body = (w: Win) => {
    const p = find(w.slug);
    switch (w.kind) {
      case "projects":
        return (
          <IconGrid
            items={projects.map((proj) => ({ id: proj.slug, name: proj.name, kind: "Folder", icon: "folder" as IconName, open: () => open("project", proj.name, proj.slug, { w: 440, h: 270 }) }))}
            selected={selected}
            onSelect={setSelected}
            footer={`${projects.length} items`}
          />
        );
      case "project":
        return p ? <FileList items={filesOf(p)} selected={selected} onSelect={setSelected} header={p.oneLine} footer={p.status} /> : null;
      case "readme":
        return p ? <div className="os-text" dangerouslySetInnerHTML={{ __html: p.readmeHtml }} /> : null;
      case "design":
        return p?.design ? (
          <div className="os-design-wrap">
            <Design nodes={p.design.nodes} edges={p.design.edges} />
          </div>
        ) : null;
      case "demo": {
        const Sim = p?.demo ? SIMS[p.demo]?.Sim : undefined;
        return <div className="os-demo">{Sim && <Sim />}</div>;
      }
      case "about":
        return (
          <div className="os-text">
            <h1>About Rohan</h1>
            <p>Full-stack and AI engineer. 3+ years building things people use; M.S. in Human-Computer Interaction from Purdue; research at NeurIPS 2024.</p>
            <p>I build AI agents that do real work, and the evals and guardrails that keep them honest.</p>
            <p>Based in Delhi, will relocate, open to roles. The fastest way to reach me is the sticky note on the monitor, once you stand up.</p>
          </div>
        );
      case "trash":
        return (
          <FileList
            items={[
              { id: "v2", name: "rhymes_v2/", kind: "Folder", icon: "folder", open: () => open("info", "rhymes_v2", undefined, { w: 380, h: 150 }, "Version 2: a 180-year history of computing, with me somewhere at the end. Too clever.") },
              { id: "v3", name: "gradient_v3/", kind: "Folder", icon: "folder", open: () => open("info", "gradient_v3", undefined, { w: 380, h: 150 }, "Version 3: dark, gradients, big type. Looked like everyone else’s. Too generic.") },
            ]}
            selected={selected}
            onSelect={setSelected}
            header="Earlier versions of this site."
            footer="The trash is sentimental. It stays full."
          />
        );
      case "info":
        return (
          <div className="os-text">
            <p>{w.text}</p>
          </div>
        );
    }
  };

  const run = (label: string) => {
    setMenu(null);
    if (label === "About rohanOS…") open("info", "About rohanOS", undefined, { w: 360, h: 150 }, "rohanOS 1.0. Built for Rohan’s desk. One bit per pixel, like it’s 1991.");
    else if (label === "Open") document.querySelector<HTMLElement>(".os-item[data-selected]")?.dispatchEvent(new MouseEvent("dblclick", { bubbles: true }));
    else if (label === "Close window") {
      if (topWin) close(topWin.id);
    }
    else if (label === "Clean up windows") setWins((list) => list.map((w, i) => ({ ...w, x: 40 + i * 26, y: 28 + i * 26 })));
    else if (label === "Empty trash…") open("info", "Empty trash", undefined, { w: 340, h: 140 }, "The trash is sentimental. It stays full.");
    else standUp();
  };

  return (
    <div className={`os is-${phase}`} ref={root} role="dialog" aria-modal="true" aria-label="rohanOS, the computer on Rohan's desk" tabIndex={-1} onPointerDown={() => menu && setMenu(null)}>
      {phase === "boot" && (
        <div className="os-boot">
          <div className="os-boot-box">
            <Icon name="desk" size={64} />
            <p>Welcome to rohanOS</p>
          </div>
        </div>
      )}
      {phase !== "zoom" && phase !== "boot" && (
        <>
          <div className="os-menubar" role="menubar">
            {(["logo", "File", "Special"] as const).map((name) => (
              <div key={name} className="os-menu">
                <button
                  type="button"
                  role="menuitem"
                  aria-haspopup="true"
                  aria-expanded={menu === name}
                  className={menu === name ? "is-open" : ""}
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    setMenu(menu === name ? null : name);
                  }}
                  onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), setMenu(menu === name ? null : name))}
                >
                  {name === "logo" ? <Icon name="desk" size={16} /> : name}
                </button>
                {menu === name && (
                  <ul className="os-menu-list" role="menu" onPointerDown={(e) => e.stopPropagation()}>
                    {MENUS[name].map((label) => (
                      <li key={label}>
                        <button type="button" role="menuitem" onClick={() => run(label)}>
                          {label}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
            <span className="os-clock">{clock}</span>
            <button type="button" className="os-standup" onClick={standUp}>
              Stand up
            </button>
          </div>

          <div className="os-desktop">
            <div className="os-desk-icons">
              {[
                { id: "hd", name: "rohan HD", icon: "disk" as IconName, run: () => open("projects", "Projects", undefined, { w: 520, h: 230 }) },
                { id: "about", name: "About Rohan", icon: "about" as IconName, run: () => open("about", "About Rohan", undefined, { w: 420, h: 280 }) },
                { id: "trash", name: "Trash", icon: "trash" as IconName, run: () => open("trash", "Trash", undefined, { w: 380, h: 200 }) },
              ].map((item) => (
                <ItemButton key={item.id} id={`desk:${item.id}`} name={item.name} icon={item.icon} selected={selected} onSelect={setSelected} onOpen={item.run} />
              ))}
            </div>

            {wins.map((w) => (
              <Window key={w.id} win={w} active={topWin?.id === w.id} onFocus={() => focus(w.id)} onClose={() => close(w.id)} onMove={(x, y) => setWins((list) => list.map((v) => (v.id === w.id ? { ...v, x, y } : v)))}>
                {body(w)}
              </Window>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── Pieces ───────────────────────────────────────────────────────────────

function Window({ win, active, onFocus, onClose, onMove, children }: { win: Win; active: boolean; onFocus: () => void; onClose: () => void; onMove: (x: number, y: number) => void; children: React.ReactNode }) {
  const drag = useRef<{ dx: number; dy: number } | null>(null);
  return (
    <section
      className={`os-window${active ? " is-active" : ""}`}
      style={{ left: win.x, top: win.y, width: win.w, height: win.h, zIndex: win.z }}
      onPointerDown={onFocus}
      aria-label={win.title}
    >
      <header
        className="os-titlebar"
        onPointerDown={(e) => {
          if ((e.target as HTMLElement).closest("button")) return;
          drag.current = { dx: e.clientX - win.x, dy: e.clientY - win.y };
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          if (!drag.current) return;
          const x = Math.max(-win.w + 80, Math.min(window.innerWidth - 80, e.clientX - drag.current.dx));
          const y = Math.max(0, Math.min(window.innerHeight - MENU_H - 24, e.clientY - drag.current.dy));
          onMove(x, y);
        }}
        onPointerUp={() => (drag.current = null)}
      >
        <button type="button" className="os-close" onClick={onClose} aria-label={`Close ${win.title}`} />
        <h2>{win.title}</h2>
      </header>
      <div className="os-content">{children}</div>
    </section>
  );
}

function ItemButton({ id, name, icon, selected, onSelect, onOpen, kind, list }: { id: string; name: string; icon: IconName; selected: string | null; onSelect: (id: string) => void; onOpen: () => void; kind?: string; list?: boolean }) {
  const isSelected = selected === id;
  return (
    <button
      type="button"
      className={`os-item${list ? " is-row" : ""}`}
      data-selected={isSelected || undefined}
      onClick={() => (isTouch() ? onOpen() : onSelect(id))}
      onDoubleClick={onOpen}
      onFocus={() => onSelect(id)}
      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), onOpen())}
      title={isTouch() ? undefined : "Double-click to open"}
    >
      <Icon name={icon} size={list ? 16 : 32} />
      <span className="os-item-name">{name}</span>
      {list && kind && <span className="os-item-kind">{kind}</span>}
    </button>
  );
}

function IconGrid({ items, selected, onSelect, footer }: { items: FileItem[]; selected: string | null; onSelect: (id: string) => void; footer: string }) {
  return (
    <>
      <div className="os-info-bar">{footer}</div>
      <div className="os-grid">
        {items.map((item) => (
          <ItemButton key={item.id} id={`grid:${item.id}`} name={item.name} icon={item.icon} selected={selected} onSelect={onSelect} onOpen={item.open} />
        ))}
      </div>
    </>
  );
}

function FileList({ items, selected, onSelect, header, footer }: { items: FileItem[]; selected: string | null; onSelect: (id: string) => void; header: string; footer: string }) {
  return (
    <>
      <div className="os-info-bar">{header}</div>
      <div className="os-list">
        <div className="os-list-head" aria-hidden="true">
          <span>Name</span>
          <span>Kind</span>
        </div>
        {items.map((item) => (
          <ItemButton key={item.id} id={`list:${item.id}`} name={item.name} icon={item.icon} kind={item.kind} list selected={selected} onSelect={onSelect} onOpen={item.open} />
        ))}
      </div>
      <div className="os-info-bar os-info-foot">{footer}</div>
    </>
  );
}
