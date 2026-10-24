"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { LABELS, PANELS, type Panel } from "./content";

export type FolderProject = { slug: string; name: string; oneLine: string; status: string; readmeHtml: string; code?: string; paper?: string; caseStudy?: string | null };

type Open = { kind: "panel"; id: string } | { kind: "folder"; slug: string } | { kind: "computer" } | null;
type Tip = { text: string; x: number; y: number } | null;

// Makes the static desk drawing interactive: hover labels, click or Enter to
// open, Esc to close. The SVG comes in as markup; objects are found by
// [data-object] with event delegation, so the art stays server-rendered.
export function DeskLive({ svg, css, projects }: { svg: string; css: string; projects: FolderProject[] }) {
  const stage = useRef<HTMLDivElement>(null);
  const [tip, setTip] = useState<Tip>(null);
  const [open, setOpen] = useState<Open>(null);
  const returnTo = useRef<Element | null>(null);

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
    else if (name === "monitor") setOpen({ kind: "computer" });
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
            {open.kind === "computer" && (
              <>
                <p className="desk-sheet-kicker">The computer</p>
                <h2 id="desk-sheet-title">rohanOS is booting soon</h2>
                <p>Next step: click the monitor and you sit down at a little System 7 computer with every project on it. For now, the folders on the desk open each project.</p>
              </>
            )}
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
              {link.external ? " ↗" : ""}
            </a>
          ))}
        </p>
      )}
    </>
  );
}

function FolderView({ project }: { project?: FolderProject }) {
  if (!project) return null;
  return (
    <>
      <p className="desk-sheet-kicker">
        Folder · {project.status}
      </p>
      <div className="desk-readme" id="desk-sheet-title" dangerouslySetInnerHTML={{ __html: project.readmeHtml }} />
      <p className="desk-sheet-links">
        {project.caseStudy && <a href={project.caseStudy}>Read the case study</a>}
        {project.code && (
          <a href={project.code} target="_blank" rel="noreferrer">
            Code ↗
          </a>
        )}
        {project.paper && (
          <a href={project.paper} target="_blank" rel="noreferrer">
            Paper ↗
          </a>
        )}
      </p>
    </>
  );
}
