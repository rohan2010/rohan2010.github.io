import * as React from "react";
import { ViewTransition } from "react";

// Route transitions (tech-motion.md §3.8, §9). Lead-owned. Server-safe: no client code.
//
// - Wrap each page.tsx's content in <PageTransition> (not the layout: layouts
//   never enter or exit).
// - Give <Link> a direction: transitionTypes={FORWARD} into a project page,
//   transitionTypes={BACK} for "← back" links.
// - Shared element: wrap the same thing on both pages in
//   <SharedElement name={sharedName(slug)}>. Morphs pair only when both ends
//   are in the viewport (G1): use them near the top of a page.
// The CSS is in src/styles/transitions.css; reduced motion zeroes it.

export const FORWARD = ["nav-forward"];
export const BACK = ["nav-back"];

const DIRECTION = { "nav-forward": "nav-forward", "nav-back": "nav-back", default: "none" } as const;

export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransition enter={DIRECTION} exit={DIRECTION} default="none">
      {children}
    </ViewTransition>
  );
}

/** The view-transition name for a work page's shared figure/title. */
export const sharedName = (slug: string) => `work-${slug}`;

export function SharedElement({ name, children }: { name: string; children: React.ReactNode }) {
  return (
    <ViewTransition name={name} share="morph" default="none">
      {children}
    </ViewTransition>
  );
}
