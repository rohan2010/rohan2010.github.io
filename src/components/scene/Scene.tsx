import type * as React from "react";
import type { Beat, SceneId, SceneLayout } from "@/content/schema";
import { sceneById } from "@/content/scenes";
import { SceneRoot } from "@/lib/motion/scene-context";

// The scene shell (server component). Lead-owned. See plans/v2/CONTRACTS.md.
//
//   <Scene id="handwriting" layout="split">
//     <SceneSlot slot="figure">…</SceneSlot>
//     <SceneSlot slot="text"><SceneHeading id="handwriting">Reading handwriting</SceneHeading>…</SceneSlot>
//   </Scene>
//
// year / yearTo / beat / layout default to the registry (src/content/scenes.ts);
// pass them only to assert they match. A mismatch fails the build.

interface SceneProps {
  id: SceneId;
  layout?: SceneLayout;
  year?: number;
  yearTo?: number | null;
  beat?: Beat;
  className?: string;
  children: React.ReactNode;
}

export function Scene({ id, layout, year, yearTo, beat, className, children }: SceneProps) {
  const meta = sceneById(id);
  const check = <T,>(name: string, given: T | undefined, registry: T) => {
    if (given !== undefined && given !== registry) throw new Error(`<Scene id="${id}"> ${name}=${String(given)} but scenes.ts says ${String(registry)}`);
  };
  check("layout", layout, meta.layout);
  check("year", year, meta.year);
  check("yearTo", yearTo, meta.yearTo);
  check("beat", beat, meta.beat);
  return (
    <SceneRoot
      id={meta.id}
      year={meta.year}
      yearTo={meta.yearTo}
      era={meta.era}
      layout={meta.layout}
      beat={meta.beat}
      yearLabel={meta.yearLabel}
      toLabel={meta.toLabel}
      labelledBy={`${meta.id}-title`}
      className={className ? `scene ${className}` : "scene"}
    >
      <div className="scene-grid">{children}</div>
    </SceneRoot>
  );
}

type Slot = "text" | "figure" | "note" | "wide";

/** A grid slot. Each layout places text / figure / note / wide differently (src/styles/scenes.css). */
export function SceneSlot({ slot, className, children }: { slot: Slot; className?: string; children: React.ReactNode }) {
  return (
    <div className={className ? `scene-slot scene-${slot} ${className}` : `scene-slot scene-${slot}`} data-slot={slot}>
      {children}
    </div>
  );
}

/** Screen-reader form of the years: "1989 and 2021", "2023 and now". */
function spokenYears(id: SceneId) {
  const meta = sceneById(id);
  if (meta.yearLabel === "next") return null; // the title already says "Next"
  if (meta.yearTo === null) return String(meta.year);
  return `${meta.year} and ${meta.toLabel ?? meta.yearTo}`;
}

/**
 * The scene's heading, with its years inside it (the ruler is aria-hidden, so
 * the years live here). Scene 0 passes level={1}; every other scene is an h2.
 * `size` picks the type role; default h2 (h1 for level 1).
 */
export function SceneHeading({
  id,
  level = 2,
  size,
  years = true,
  className,
  children,
}: {
  id: SceneId;
  level?: 1 | 2;
  size?: "display" | "h1" | "h2" | "h3";
  /** show the years line (default true) */
  years?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  const meta = sceneById(id);
  const Tag = level === 1 ? "h1" : "h2";
  const role = size ?? (level === 1 ? "h1" : "h2");
  return (
    <Tag id={`${id}-title`} className={`scene-heading ${className ?? ""}`.trim()}>
      {years ? (
        <>
          <span className="scene-heading-years" aria-hidden="true" data-mono="">
            {meta.yearLabel}
          </span>
          {spokenYears(id) ? <span className="sr-only">{spokenYears(id)}: </span> : null}
        </>
      ) : null}
      <span className={`t-${role}`}>{children}</span>
    </Tag>
  );
}
