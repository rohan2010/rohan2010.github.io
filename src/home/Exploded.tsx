"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { DESK_GEOM, DESK_PANES, DESK_SVG } from "@/desk/desk-art";
import "./exploded.css";

// The desk as an exploded-view drawing, scrubbed by scroll. Parts lift along the drawing's
// own z axis on dashed travel lines, get numbered callouts, then the camera moves into the
// monitor and its screen peels into the layers of the onboarding agent. It wraps the
// interactive desk, so every object still opens at any point of the scroll.

type Vec = [number, number];
const G = DESK_GEOM as unknown as { origin: Vec; floor: number; up: Vec; toward: Vec; right: Vec; anchors: Record<string, Vec> };

// World units each part travels (z up; negative drops), and when it starts (0..1 of the explode).
const LIFT: Record<string, { z: number; at: number }> = {
  legs: { z: -70, at: 0 },
  apron: { z: -30, at: 0 },
  screws: { z: -30, at: 0 },
  grommet: { z: 6, at: 0.1 },
  mat: { z: 14, at: 0.1 },
  keyboard: { z: 44, at: 0.2 },
  tickets: { z: 52, at: 0.25 },
  controller: { z: 78, at: 0.3 },
  clipboard: { z: 58, at: 0.3 },
  photo: { z: 74, at: 0.35 },
  plant: { z: 96, at: 0.4 },
  monitor: { z: 112, at: 0.45 },
  sticky: { z: 112, at: 0.45 },
};
const FOLDER_Z = [72, 60, 48, 36];

// side: which way the leader runs; rise: 1 up, -1 down (both at the drawing's 30°).
const CALLOUTS: { key: string; n: string; label: string; side: 1 | -1; rise: 1 | -1; reach: number }[] = [
  { key: "monitor", n: "01", label: "computer · the agent, running", side: 1, rise: 1, reach: 120 },
  { key: "folders", n: "02", label: "folders · four projects", side: -1, rise: -1, reach: 50 },
  { key: "clipboard", n: "03", label: "clipboard · résumé", side: 1, rise: 1, reach: 36 },
  { key: "photo", n: "04", label: "photo · me, in Chicago", side: 1, rise: 1, reach: 80 },
  { key: "controller", n: "05", label: "controller · losing to Hades", side: 1, rise: -1, reach: 130 },
  { key: "keyboard", n: "06", label: "keyboard · what I write in", side: -1, rise: -1, reach: 150 },
  { key: "tickets", n: "07", label: "boarding passes · how I got here", side: -1, rise: 1, reach: 110 },
  { key: "plant", n: "08", label: "plant · purely decorative", side: -1, rise: 1, reach: 40 },
];

const CAPTIONS = [
  { at: 0, text: "Everything on the desk opens. Scroll to take it apart." },
  { at: 0.12, text: "Every object is its own part, drawn in code." },
  { at: 0.42, text: "Each part opens something real." },
  { at: 0.6, text: "The computer is the work." },
  { at: 0.78, text: "Inside the screen: how the onboarding agent is built." },
];

const clamp = (v: number) => Math.min(1, Math.max(0, v));
const span = (p: number, a: number, b: number) => clamp((p - a) / (b - a));
// The desk's own entering curve, cubic-bezier(.32,.72,0,1), approximated for scrubbing.
const ease = (t: number) => 1 - Math.pow(1 - t, 3.2);
const lift = (z: number): Vec => [G.up[0] * z, G.up[1] * z];
const NS = "http://www.w3.org/2000/svg";

// intro: the hero. At the top of the page it sits beside the desk (or above it on a
// phone); the camera frames the desk into the space left over, then the hero fades
// and the desk slides to the middle before it comes apart.
// pointer: a short label for a callout from the hero to the running monitor.
export function Exploded({
  children,
  intro,
  pointer,
  backdrop,
}: {
  children: ReactNode;
  intro?: ReactNode;
  pointer?: string[];
  backdrop?: ReactNode;
}) {
  const track = useRef<HTMLDivElement>(null);
  const host = useRef<HTMLDivElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const captionRef = useRef<HTMLParagraphElement>(null);
  const pointerRef = useRef<SVGSVGElement>(null);
  const [caption, setCaption] = useState(0);

  useEffect(() => {
    const svg = host.current?.querySelector("svg");
    const box = track.current;
    if (!svg || !box) return;

    // Wrap every movable top-level part so hover transforms on .desk-object keep working.
    type Part = { el: SVGGElement; z: number; at: number; anchor?: Vec; key: string };
    const parts: Part[] = [];
    let folder = 0;
    const wrap = (node: Element) => {
      const g = document.createElementNS(NS, "g");
      node.replaceWith(g);
      g.appendChild(node);
      return g;
    };
    for (const node of Array.from(svg.children)) {
      const name = node.getAttribute("data-object") ?? node.getAttribute("data-part");
      if (!name) continue;
      if (name === "folder") {
        const z = FOLDER_Z[folder++] ?? 40;
        parts.push({ el: wrap(node), z, at: 0.15 + folder * 0.05, anchor: G.anchors.folders, key: "folders" });
      } else if (LIFT[name]) {
        parts.push({ el: wrap(node), ...LIFT[name], anchor: G.anchors[name], key: name });
      } else if (name !== "top") {
        parts.push({ el: wrap(node), z: 0, at: 0, key: name });
      }
    }
    const monitor = parts.find((p) => p.key === "monitor")!;
    const panel = monitor.el.querySelector<SVGGElement>('[data-part="panel"]');
    const halo = svg.querySelector(":scope > .iso-halo") as SVGElement | null;
    const cable = parts.find((p) => p.key === "cable");

    // The floor the desk stands on: an isometric grid on the drawing's own axes, fading
    // out from under the desk. It lives in the drawing, so it moves with the camera.
    const floor = document.createElementNS(NS, "g");
    floor.setAttribute("class", "xp-floor");
    {
      const at = (x: number, y: number): Vec => [
        G.origin[0] + x * G.right[0] + y * G.toward[0] + G.floor * G.up[0],
        G.origin[1] + x * G.right[1] + y * G.toward[1] + G.floor * G.up[1],
      ];
      const STEP = 38;
      const N = 18;
      const minor: string[] = [];
      const major: string[] = [];
      for (let i = -N; i <= N; i++) {
        const u = i * STEP;
        const [a, b, c, d] = [at(u, -N * STEP), at(u, N * STEP), at(-N * STEP, u), at(N * STEP, u)];
        const line = `M${a[0].toFixed(1)} ${a[1].toFixed(1)}L${b[0].toFixed(1)} ${b[1].toFixed(1)}M${c[0].toFixed(1)} ${c[1].toFixed(1)}L${d[0].toFixed(1)} ${d[1].toFixed(1)}`;
        (i % 4 === 0 ? major : minor).push(line);
      }
      const [cx, cy] = at(0, 0);
      floor.innerHTML =
        `<defs><radialGradient id="xp-floor-fade" gradientUnits="userSpaceOnUse" cx="${cx}" cy="${cy - 40}" r="720">` +
        `<stop offset="0" stop-color="#fff"/><stop offset=".5" stop-color="#fff" stop-opacity=".7"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>` +
        `<mask id="xp-floor-mask" maskUnits="userSpaceOnUse" x="-2000" y="-2000" width="5000" height="5000"><rect x="-2000" y="-2000" width="5000" height="5000" fill="url(#xp-floor-fade)"/></mask></defs>` +
        `<g mask="url(#xp-floor-mask)"><path class="xp-floor-minor" d="${minor.join("")}"/><path class="xp-floor-major" d="${major.join("")}"/></g>`;
    }
    svg.prepend(floor);


    // Travel lines go just above the desk top, under every object.
    const lines = document.createElementNS(NS, "g");
    lines.setAttribute("class", "xp-lines");
    const top = svg.querySelector(':scope > [data-part="top"]');
    top?.after(lines);
    const travel = parts
      .filter((p) => p.anchor && p.key !== "sticky" && !(p.key === "folders" && p.z !== FOLDER_Z[0]))
      .map((p) => {
        const path = document.createElementNS(NS, "path");
        lines.appendChild(path);
        return { part: p, path };
      });

    // The screen's layers ride inside the monitor, in front of the panel.
    const panes = document.createElementNS(NS, "g");
    panes.innerHTML = DESK_PANES;
    panel?.after(panes);
    const layers = Array.from(panes.querySelectorAll<SVGGElement>(".xp-pane-layer"));

    // Callouts sit above everything.
    const notes = document.createElementNS(NS, "g");
    notes.setAttribute("class", "xp-notes");
    svg.appendChild(notes);
    const callouts = CALLOUTS.map((c) => {
      const g = document.createElementNS(NS, "g");
      g.innerHTML = `<path class="xp-leader"/><circle class="xp-ring" r="9"/><text class="xp-num" text-anchor="middle" dy="3">${c.n}</text><text class="xp-label"></text>`;
      g.querySelector(".xp-label")!.textContent = c.label;
      notes.appendChild(g);
      const part = parts.find((p) => p.key === c.key && (c.key !== "folders" || p.z === FOLDER_Z[0]))!;
      return { ...c, g, part };
    });

    // Where the camera ends up: around the lifted monitor and its fully peeled layers.
    const PEEL = 62;
    const full = lift(monitor.z);
    const mb = monitor.el.getBBox();
    const reach: Vec = [G.toward[0] * PEEL * layers.length, G.toward[1] * PEEL * layers.length];
    const x0 = mb.x + full[0] + Math.min(0, reach[0]) - 30;
    const y0 = mb.y + full[1] - 20;
    const x1 = mb.x + mb.width + full[0] + Math.max(0, reach[0]) + 30;
    const y1 = mb.y + mb.height + full[1] + Math.max(0, reach[1]) - 40;
    const zoom = { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
    // The camera pulls back as the desk comes apart: measure the fully exploded drawing once.
    const still = { x: 0, y: 0, w: 1000, h: 680 };
    let apart = still;

    // Where the desk sits while the hero is up: the viewBox that maps the still desk
    // into the free rectangle beside (or below) the hero text.
    let framed: typeof still | null = null;
    const frame = () => {
      const lead = introRef.current;
      if (!lead) return;
      const r = svg.getBoundingClientRect();
      const t = lead.getBoundingClientRect();
      const wide = innerWidth >= 900;
      // The stage clips, so the desk may reach its edge but no further.
      const edge = (svg.closest(".xp-stage") ?? svg).getBoundingClientRect().right;
      const free = wide
        ? { x: t.right + 16 - r.left, y: 0, w: Math.min(edge, innerWidth) - 12 - t.right - 16, h: r.height }
        : { x: 0, y: t.bottom + 8 - r.top, w: r.width, h: r.bottom - t.bottom - 8 };
      if (free.w < 80 || free.h < 80) return void (framed = null);
      const k = Math.min(free.w / still.w, free.h / still.h);
      framed = {
        x: still.x + still.w / 2 - (free.x + free.w / 2) / k,
        y: still.y + still.h / 2 - (free.y + free.h / 2) / k,
        w: r.width / k,
        h: r.height / k,
      };
    };

    // The hero's callout: a brass ring on the monitor's screen, a 30° leader up to clear
    // space above the monitor, a shelf and the label. It runs to the right when there is
    // room, else to the left. Measured with the desk framed beside the hero.
    const aim = () => {
      const mark = pointerRef.current;
      const glass = svg.querySelector('[data-object="monitor"] .desk-glass');
      const stage = svg.closest(".xp-stage");
      if (!mark || !glass || !stage || !framed || innerWidth < 900) return void mark?.classList.add("is-off");
      mark.classList.remove("is-off");
      render(0);
      const g = glass.getBoundingClientRect();
      const st = stage.getBoundingClientRect();
      const texts = Array.from(mark.querySelectorAll("text"));
      const wide = Math.max(...texts.map((t) => t.getComputedTextLength()));
      const x = g.left - st.left + g.width * 0.42;
      const y = g.top - st.top + g.height * 0.2;
      const reach = Math.max(90, g.height * 0.8);
      let side = 1;
      if (x + reach + wide + 12 > st.width - 8) side = -1;
      const ex = x + side * reach;
      const ey = y - reach * 0.577;
      const sx = ex + side * (wide + 4);
      mark.setAttribute("viewBox", `0 0 ${st.width} ${st.height}`);
      mark.querySelector("path")!.setAttribute("d", `M${x} ${y}L${ex} ${ey}H${sx}`);
      const ring = mark.querySelector("circle")!;
      ring.setAttribute("cx", String(x));
      ring.setAttribute("cy", String(y));
      // The label sits on its shelf, last line just above the line.
      texts.forEach((t, i) => {
        t.setAttribute("x", String(sx));
        t.setAttribute("y", String(ey - 8 - (texts.length - 1 - i) * 16));
        t.setAttribute("text-anchor", side > 0 ? "end" : "start");
      });
    };

    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let shown = 0;
    let raf = 0;
    let last = -1;

    const render = (p: number) => {
      const hero = framed ? 1 - ease(span(p, 0.02, 0.1)) : 0;
      const explode = span(p, 0.1, 0.5);
      const label = span(p, 0.42, 0.56) * (1 - span(p, 0.6, 0.66));
      const dive = ease(span(p, 0.6, 0.8));
      const peel = span(p, 0.78, 0.98);

      for (const part of parts) {
        const t = ease(span(explode, part.at, part.at + 0.55));
        const [dx, dy] = lift(part.z * t);
        part.el.setAttribute("transform", `translate(${dx.toFixed(2)} ${dy.toFixed(2)})`);
        part.el.style.opacity = part === monitor || part.key === "sticky" ? "1" : String(1 - 0.9 * dive);
      }
      if (cable) cable.el.style.opacity = String((1 - span(explode, 0, 0.2)) * (1 - dive));
      if (halo) halo.style.opacity = String(1 - span(explode, 0, 0.3));
      floor.style.opacity = String(1 - 0.85 * dive);
      lines.style.opacity = String(span(explode, 0.05, 0.3) * (1 - dive));
      for (const { part, path } of travel) {
        const t = ease(span(explode, part.at, part.at + 0.55));
        const [ax, ay] = part.anchor!;
        const [dx, dy] = lift(part.z * t);
        path.setAttribute("d", `M${ax} ${ay}L${(ax + dx).toFixed(1)} ${(ay + dy).toFixed(1)}`);
      }

      // The panel lifts off its stand; the sticky note comes forward off the glass.
      const sticky = parts.find((p) => p.key === "sticky");
      const off = ease(span(explode, 0.7, 1));
      panel?.setAttribute("transform", `translate(${lift(18 * off).join(" ")})`);
      panes.setAttribute("transform", `translate(${lift(18 * off).join(" ")})`);
      if (sticky) {
        const t = ease(span(explode, sticky.at, sticky.at + 0.55));
        const [dx, dy] = lift((sticky.z + 18 * off) * t);
        sticky.el.setAttribute("transform", `translate(${(dx + G.toward[0] * 26 * off).toFixed(2)} ${(dy + G.toward[1] * 26 * off).toFixed(2)})`);
        sticky.el.style.opacity = String(1 - dive);
      }

      layers.forEach((layer, i) => {
        const t = ease(span(peel, i * 0.12, 0.6 + i * 0.12));
        const d = PEEL * (i + 1) * t;
        layer.setAttribute("transform", `translate(${(G.toward[0] * d).toFixed(2)} ${(G.toward[1] * d).toFixed(2)})`);
        layer.style.opacity = String(span(peel, i * 0.12, i * 0.12 + 0.15));
      });

      notes.style.opacity = String(label);
      for (const c of callouts) {
        const t = ease(span(explode, c.part.at, c.part.at + 0.55));
        const [ax, ay] = c.part.anchor!;
        const [dx, dy] = lift(c.part.z * t);
        const sx = ax + dx;
        const sy = ay + dy;
        // Leader at the drawing's 30° then a short shelf, like a callout on a drawing.
        const ex = sx + c.side * c.reach * 0.866;
        const ey = sy - c.rise * c.reach * 0.5;
        const shelf = ex + c.side * 14;
        c.g.querySelector(".xp-leader")!.setAttribute("d", `M${sx.toFixed(1)} ${sy.toFixed(1)}L${ex.toFixed(1)} ${ey.toFixed(1)}H${shelf.toFixed(1)}`);
        const ring = c.g.querySelector(".xp-ring")!;
        ring.setAttribute("cx", String(shelf + c.side * 9));
        ring.setAttribute("cy", String(ey));
        const num = c.g.querySelector(".xp-num")!;
        num.setAttribute("x", String(shelf + c.side * 9));
        num.setAttribute("y", String(ey));
        const text = c.g.querySelector(".xp-label")!;
        text.setAttribute("x", String(shelf + c.side * 24));
        text.setAttribute("y", String(ey + 4.5));
        text.setAttribute("text-anchor", c.side > 0 ? "start" : "end");
      }

      const back = ease(explode);
      const mix = (a: number, b: number, t: number) => a + (b - a) * t;
      const f = framed ?? still;
      const v = {
        x: mix(mix(mix(still.x, apart.x, back), zoom.x, dive), f.x, hero),
        y: mix(mix(mix(still.y, apart.y, back), zoom.y, dive), f.y, hero),
        w: mix(mix(mix(still.w, apart.w, back), zoom.w, dive), f.w, hero),
        h: mix(mix(mix(still.h, apart.h, back), zoom.h, dive), f.h, hero),
      };
      const lead = introRef.current;
      if (lead) {
        // The text leaves first, so the desk never slides across it.
        const stay = framed ? 1 - span(p, 0, 0.035) : 0;
        lead.style.opacity = String(stay);
        lead.style.translate = `0 ${(-32 * (1 - stay)).toFixed(1)}px`;
        lead.style.visibility = stay < 0.02 ? "hidden" : "visible";
        if (pointerRef.current) pointerRef.current.style.opacity = String(stay);
      }
      if (captionRef.current) captionRef.current.style.opacity = String(1 - hero);
      svg.setAttribute("viewBox", `${v.x.toFixed(1)} ${v.y.toFixed(1)} ${v.w.toFixed(1)} ${v.h.toFixed(1)}`);

      let c = 0;
      CAPTIONS.forEach((cap, i) => {
        if (p >= cap.at) c = i;
      });
      setCaption(c);
    };

    const target = () => {
      const r = box.getBoundingClientRect();
      return clamp(-r.top / (r.height - innerHeight));
    };
    const tick = () => {
      const goal = target();
      shown = reduced ? goal : shown + (goal - shown) * 0.14;
      if (Math.abs(goal - shown) < 0.0005) shown = goal;
      if (shown !== last) {
        render(shown);
        last = shown;
      }
      raf = requestAnimationFrame(tick);
    };
    svg.setAttribute("overflow", "visible");
    render(0.56);
    // Frame the exploded desk, not the floor under it.
    floor.style.display = "none";
    const b = svg.getBBox();
    floor.style.display = "";
    apart = { x: b.x - 16, y: b.y - 16, w: b.width + 32, h: b.height + 32 };
    frame();
    aim();
    const resize = () => {
      frame();
      aim();
      render(shown);
    };
    addEventListener("resize", resize);
    shown = target();
    render(shown);
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("resize", resize);
      // Put the untouched drawing back, so a second mount starts clean.
      if (svg.parentElement) svg.parentElement.innerHTML = DESK_SVG;
    };
  }, []);

  return (
    <div className="xp-track" ref={track}>
      <div className="xp-stage">
        {backdrop}
        {intro && (
          <div className="xp-hero" ref={introRef}>
            {intro}
          </div>
        )}
        {pointer && (
          <svg className="xp-pointer is-off" ref={pointerRef} aria-hidden="true">
            <path pathLength={1} />
            <circle r="7" />
            {pointer.map((line) => (
              <text key={line}>
                {line}
              </text>
            ))}
          </svg>
        )}
        <p className="xp-caption" aria-live="polite" ref={captionRef}>
          {CAPTIONS[caption].text}
        </p>
        <div className="xp-desk" ref={host}>
          {children}
        </div>
      </div>
    </div>
  );
}
