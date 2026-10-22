"use client";

import * as React from "react";
import type { SceneId, SceneLayout } from "@/content/schema";

export interface SceneContextValue {
  id: SceneId;
  year: number;
  yearTo: number | null;
  era: number;
  layout: SceneLayout;
  /** the scene's <section>. NOTE: null inside a child's layout effect (useGSAP),
   *  because React attaches a parent's ref after its children's layout effects.
   *  Use element() there. */
  ref: React.RefObject<HTMLElement | null>;
  /** the scene's <section>, safe in any effect (falls back to the DOM id) */
  element: () => HTMLElement | null;
}

export const SceneContext = React.createContext<SceneContextValue | null>(null);

interface SceneRootProps extends Omit<SceneContextValue, "ref" | "element"> {
  className: string;
  beat: string;
  yearLabel: string;
  toLabel?: string;
  labelledBy: string;
  children: React.ReactNode;
}

/**
 * The client root of <Scene> (src/components/scene/Scene.tsx). It renders the
 * <section> on the server too, so with JS off the page is complete. The data-*
 * attributes are the registration the ruler reads.
 */
export function SceneRoot({ id, year, yearTo, era, layout, beat, yearLabel, toLabel, labelledBy, className, children }: SceneRootProps) {
  const ref = React.useRef<HTMLElement>(null);
  const value = React.useMemo(
    () => ({ id, year, yearTo, era, layout, ref, element: () => ref.current ?? document.getElementById(id) }),
    [id, year, yearTo, era, layout],
  );
  return (
    <SceneContext.Provider value={value}>
      <section
        ref={ref}
        id={id}
        className={className}
        aria-labelledby={labelledBy}
        data-scene={id}
        data-year={year}
        data-year-to={yearTo ?? undefined}
        data-to-label={toLabel}
        data-year-label={yearLabel}
        data-era={era}
        data-layout={layout}
        data-beat={beat}
        style={{ "--scene-era": era } as React.CSSProperties}
      >
        {children}
      </section>
    </SceneContext.Provider>
  );
}
