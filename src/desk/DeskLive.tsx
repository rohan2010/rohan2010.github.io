"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AmbitOS } from "@/ambit/AmbitOS";
import type { Project } from "@/content/projects";
import { LABELS, PANELS, type Panel } from "./content";

type Open = { kind: "panel"; id: string } | { kind: "folder"; slug: string } | null;
type Computer = { from: { x: number; y: number; w: number; h: number } | null; start?: string } | null;
type Tip = { text: string; x: number; y: number } | null;

// Makes the static desk drawing interactive: hover labels, click or Enter to
// open, Esc to close. The SVG comes in as markup; objects are found by
// [data-object] with event delegation, so the art stays server-rendered.
// The fields of a project the desk and the computer on it need.
export type DeskProject = Pick<Project, "slug" | "name" | "oneLine" | "status" | "year" | "readmeHtml" | "links" | "demo" | "caseStudy" | "design">;

export function DeskLive({ svg, css, projects }: { svg: string; css: string; projects: DeskProject[] }) {
  const stage = useRef<HTMLDivElement>(null);
  const [tip, setTip] = useState<Tip>(null);
  const [open, setOpen] = useState<Open>(null);
  const [computer, setComputer] = useState<Computer>(null);
  const returnTo = useRef<Element | null>(null);
  // The computer on the desk is Ambit OS (plans/ambit.md); its Projects app holds these.
  const ambit = useMemo(() => projects.map((p) => ({ ...p, caseStudy: p.caseStudy ?? undefined, code: p.links.code, paper: p.links.paper })), [projects]);

  const labelOf = useCallback(
    (el: Element) => {
      const name = el.getAttribute("data-object") ?? "";
      if (name === "folder") return projects.find((p) => p.slug === el.getAttribute("data-slug"))?.name ?? "Project";
      return LABELS[name] ?? "";
    },
    [projects],
  );

  const show = useCallback(
    (el: Element) => {
      const host = stage.current;
      if (!host) return;
      const a = host.getBoundingClientRect();
      const b = el.getBoundingClientRect();
      setTip({ text: labelOf(el), x: b.left - a.left + b.width / 2, y: b.top - a.top });
    },
    [labelOf],
  );

  const activate = useCallback((el: Element) => {
    const name = el.getAttribute("data-object");
    returnTo.current = el;
    if (name === "plant") {
      el.classList.remove("is-watered");
      void (el as SVGElement).getBoundingClientRect();
      el.classList.add("is-watered");
      return;
    }
    if (name === "folder") setOpen({ kind: "folder", slug: el.getAttribute("data-slug") ?? "" });
    else if (name === "monitor") {
      // Zoom out of the monitor's screen: start the OS at the glass's place on the page.
      const glass = el.querySelector(".desk-glass")?.getBoundingClientRect();
      setTip(null);
      setComputer({ from: glass ? { x: glass.left, y: glass.top, w: glass.width, h: glass.height } : null });
      history.replaceState(null, "", "#os");
    }
    else if (name && PANELS[name]) setOpen({ kind: "panel", id: name });
  }, []);

  useEffect(() => {
    const host = stage.current;
    if (!host) return;
    const objectOf = (target: EventTarget | null) => (target instanceof Element ? target.closest("[data-object]") : null);
    const over = (e: Event) => {
      const el = objectOf(e.target);
      if (el) show(el);
      else setTip(null);
    };
    const click = (e: Event) => {
      const el = objectOf(e.target);
      if (el) activate(el);
    };
    const key = (e: KeyboardEvent) => {
      const el = objectOf(e.target);
      if (el && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault();
        activate(el);
      }
    };
    const hide = () => setTip(null);
    const events: [string, EventListener][] = [
      ["pointerover", over],
      ["pointerleave", hide],
      ["focusin", over],
      ["focusout", hide],
      ["click", click],
      ["keydown", key as EventListener],
    ];
    events.forEach(([name, fn]) => host.addEventListener(name, fn));
    return () => events.forEach(([name, fn]) => host.removeEventListener(name, fn));
  }, [activate, show]);

  // A link to /#os or /#os/<slug> sits you straight down at the computer, on load or from a
  // link on this page (the nav, a project's Open).
  useEffect(() => {
    const sit = () => {
      const match = window.location.hash.match(/^#os(?:\/([\w-]+))?$/);
      if (match) setComputer((c) => c ?? { from: null, start: match[1] });
    };
    sit();
    window.addEventListener("hashchange", sit);
    return () => window.removeEventListener("hashchange", sit);
  }, []);

  const standUp = useCallback(() => {
    setComputer(null);
    history.replaceState(null, "", window.location.pathname);
    stage.current?.querySelector<HTMLElement>('[data-object="monitor"]')?.focus();
  }, []);

  const close = useCallback(() => {
    setOpen(null);
    (returnTo.current as HTMLElement | null)?.focus?.();
  }, []);

  useEffect(() => {
    if (!open) return;
    const esc = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [open, close]);

  return (
    <div className="desk-stage" ref={stage}>
      <style>{css}</style>
      <div dangerouslySetInnerHTML={{ __html: svg }} />
      {computer && <AmbitOS projects={ambit} from={computer.from} start={computer.start} onExit={standUp} />}
      {tip && !open && (
        <span className="desk-tip" style={{ left: tip.x, top: tip.y }} aria-hidden="true">
          {tip.text}
        </span>
      )}
      {open && (
        <div className="desk-sheet-wrap" onClick={(e) => e.target === e.currentTarget && close()}>
          <div className="desk-sheet" role="dialog" aria-modal="true" aria-labelledby="desk-sheet-title">
            <button type="button" className="desk-sheet-close" onClick={close} aria-label="Close" autoFocus>
              ×
            </button>
            {open.kind === "panel" && <PanelView panel={PANELS[open.id]} />}
            {open.kind === "folder" && <FolderView project={projects.find((p) => p.slug === open.slug)} />}
          </div>
        </div>
      )}
    </div>
  );
}

function PanelView({ panel }: { panel: Panel }) {
  return (
    <>
      <p className="desk-sheet-kicker">{panel.kicker}</p>
      <h2 id="desk-sheet-title">{panel.title}</h2>
      {panel.body.map((text) => (
        <p key={text}>{text}</p>
      ))}
      {panel.list && (
        <ul>
          {panel.list.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}
      {panel.links && (
        <p className="desk-sheet-links">
          {panel.links.map((link) => (
            <a key={link.href} href={link.href} {...(link.external ? { target: "_blank", rel: "noreferrer" } : {})}>
              {link.label}
            </a>
          ))}
        </p>
      )}
    </>
  );
}

function FolderView({ project }: { project?: DeskProject }) {
  if (!project) return null;
  return (
    <>
      <p className="desk-sheet-kicker">
        Folder: {project.status}
      </p>
      <div className="desk-readme" id="desk-sheet-title" dangerouslySetInnerHTML={{ __html: project.readmeHtml }} />
      <p className="desk-sheet-links">
        {project.caseStudy && <a href={project.caseStudy}>Read the case study</a>}
        {project.links.code && (
          <a href={project.links.code} target="_blank" rel="noreferrer">
            Code
          </a>
        )}
        {project.links.paper && (
          <a href={project.links.paper} target="_blank" rel="noreferrer">
            Paper
          </a>
        )}
      </p>
    </>
  );
}
