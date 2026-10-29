"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { GITHUB, LINKEDIN } from "@/content/site";
import { Mark, PIXELS } from "./Mark";

const SECTIONS = [
  ["/#work", "Work"],
  ["/#route", "Background"],
  ["/playground/", "Playground"],
  ["/notebook/", "Notebook"],
  ["/#os", "Ambit OS"],
] as const;

// What's behind each link, one line each, for the phone menu.
const NOTES: Record<string, string> = {
  "/#work": "Case studies, with demos you can run",
  "/#route": "Where I've studied and shipped",
  "/playground/": "Landing-page pieces, with the prompts",
  "/notebook/": "Writing from building with AI",
  "/#os": "The computer on the desk",
};

// Where the links stop fitting in the bar and move into the menu; matches home.css.
const NARROW = "(max-width: 640px)";
// The menu button's 3×3 pixels. Open, the corners and centre stay and draw an ×; the rest go.
const GRID = Array.from({ length: 9 }, (_, i) => ({ r: Math.floor(i / 3), c: i % 3, x: i % 2 === 0 }));

// The bar across the top: a floating pane of glass with the mark and name home, five places to
// go, one ask. A smaller glass lens behind the links marks where you are and follows the pointer.
// On a phone the five places move into a menu: a tobacco screen that opens as a circle from
// the pixel button, the links rising in one after another.
export function SiteNav({ mail }: { mail: string }) {
  const [moved, setMoved] = useState(false);
  const [open, setOpen] = useState(false);
  const [origin, setOrigin] = useState({ x: "100%", y: "0px" });
  const [time, setTime] = useState("");
  const path = usePathname();
  const bar = useRef<HTMLElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const check = () => setMoved(scrollY > 8);
    check();
    addEventListener("scroll", check, { passive: true });
    return () => removeEventListener("scroll", check);
  }, []);

  // Open: the page underneath holds still, focus moves to the first link, and Escape, a tap
  // outside the bar, or the window growing past phone width closes it.
  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const before = root.style.overflow;
    root.style.overflow = "hidden";
    panel.current?.querySelector("a")?.focus({ preventScroll: true });
    const close = () => setOpen(false);
    const key = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      close();
      button.current?.focus();
    };
    const wide = matchMedia(NARROW);
    const grow = () => !wide.matches && close();
    addEventListener("keydown", key);
    wide.addEventListener("change", grow);
    return () => {
      root.style.overflow = before;
      removeEventListener("keydown", key);
      wide.removeEventListener("change", grow);
    };
  }, [open]);

  const toggle = () => {
    // The circle grows from the button's centre.
    const r = button.current?.getBoundingClientRect();
    if (r) setOrigin({ x: `${r.left + r.width / 2}px`, y: `${r.top + r.height / 2}px` });
    // My time of day, read as the menu opens, so it's never rendered on the server.
    setTime(new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" }).format(new Date()));
    setOpen((o) => !o);
  };
  const here = (href: string) => !href.includes("#") && path.startsWith(href.replace(/\/$/, ""));

  // The glass lens behind the links: it rests on the page you're on, slides to the link under
  // the pointer or keyboard, and glides back (or fades, with no current page) when you leave.
  const lens = useCallback((to: HTMLElement | null) => {
    const t = track.current;
    if (!t) return;
    if (!to) return void (t.dataset.lens = "off");
    const a = to.getBoundingClientRect();
    const b = t.getBoundingClientRect();
    t.style.setProperty("--lx", `${a.left - b.left}px`);
    t.style.setProperty("--lw", `${a.width}px`);
    t.dataset.lens = "on";
  }, []);
  const rest = useCallback(() => lens(track.current?.querySelector<HTMLElement>("a[aria-current]") ?? null), [lens]);
  useEffect(() => {
    const t = track.current;
    if (!t) return;
    rest();
    // The first placement doesn't slide in from the left.
    requestAnimationFrame(() => (t.dataset.ready = ""));
    const resized = new ResizeObserver(() => rest());
    resized.observe(t);
    return () => resized.disconnect();
  }, [path, rest]);

  return (
    <header
      ref={bar}
      className={`nav${moved ? " is-moved" : ""}${open ? " is-open" : ""}`}
      // Tabbing out of the open menu closes it.
      onBlur={(e) => open && !bar.current?.contains(e.relatedTarget as Node) && setOpen(false)}
    >
      <nav className="nav-in" aria-label="Main">
        <Link className="nav-home" href="/" aria-label="Rohan Pant, home" onClick={() => setOpen(false)}>
          <Mark />
          <span className="nav-name">Rohan Pant</span>
        </Link>
        <div className="nav-track" ref={track} onPointerLeave={rest} onBlur={(e) => !track.current?.contains(e.relatedTarget as Node) && rest()}>
          <span className="nav-lens" aria-hidden="true" />
          <ul className="nav-links">
            {/* Plain links on purpose: Ambit OS opens on the browser's hashchange, which <Link> never fires. */}
            {SECTIONS.map(([href, label]) => (
              <li key={href}>
                <a href={href} aria-current={here(href) ? "page" : undefined} onPointerEnter={(e) => lens(e.currentTarget)} onFocus={(e) => lens(e.currentTarget)}>
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <a className="nav-cta" href={mail}>
          Email me
        </a>
        <button ref={button} type="button" className="nav-menu" aria-expanded={open} aria-controls="nav-panel" aria-label={open ? "Close menu" : "Open menu"} onClick={toggle}>
          <svg viewBox="0 0 20 20" aria-hidden="true">
            {GRID.map(({ r, c, x }) => (
              <rect key={`${r}${c}`} className={`nav-menu-px${x ? " is-x" : ""}${r === 2 && c === 2 ? " is-last" : ""}`} x={2 + c * 6} y={2 + r * 6} width="4" height="4" rx="0.6" style={{ "--i": r + c } as CSSProperties} />
            ))}
          </svg>
        </button>
      </nav>

      <div id="nav-panel" ref={panel} className="nav-panel" inert={!open} style={{ "--ox": origin.x, "--oy": origin.y } as CSSProperties}>
        <ul>
          {SECTIONS.map(([href, label], i) => (
            <li key={href} style={{ "--i": i } as CSSProperties}>
              <a href={href} onClick={() => setOpen(false)} aria-current={here(href) ? "page" : undefined}>
                <span className="nav-panel-n" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="nav-panel-text">
                  <span className="nav-panel-label">{label}</span>
                  <span className="nav-panel-note">{NOTES[href]}</span>
                </span>
                <span className="nav-panel-arrow" aria-hidden="true">
                  →
                </span>
              </a>
            </li>
          ))}
        </ul>
        {/* The mark's R, large, assembling pixel by pixel in the space under the links. */}
        <svg className="nav-panel-r" viewBox="0 0 16 22" aria-hidden="true">
          {PIXELS.map(({ r, c, last }) => (
            <rect key={`${r}-${c}`} className={last ? "is-last" : undefined} x={c * 3.2} y={r * 3.2} width="2.6" height="2.6" rx="0.3" style={{ "--i": r + c } as CSSProperties} />
          ))}
        </svg>
        <div className="nav-panel-foot" style={{ "--i": SECTIONS.length } as CSSProperties}>
          <p className="nav-panel-status">
            <span className="dot" aria-hidden="true" />
            Open to full-stack and AI roles
          </p>
          <p className="nav-panel-links">
            <a href={mail}>Email</a>
            <a href={GITHUB}>GitHub ↗</a>
            <a href={LINKEDIN}>LinkedIn ↗</a>
          </p>
          {time && <p className="nav-panel-time">It’s {time} in Delhi.</p>}
        </div>
      </div>
    </header>
  );
}
