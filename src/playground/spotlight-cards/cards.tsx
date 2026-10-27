import type { ReactNode } from "react";

// The sample features, shared by the live version and the naive one. Each drawing is a few
// strokes in currentColor on a 64-unit grid; the parts that move on hover carry a class, and
// spotlight.css says how they move. The copy is made up: a generic notes app.

export type Card = {
  id: string;
  title: string;
  copy: string;
  // Bento slot on the six-column grid; spotlight.css places each one.
  size: "big" | "wide" | "small";
  art: ReactNode;
};

const svg = (children: ReactNode, viewBox = "0 0 64 64") => (
  <svg className="sc-art" viewBox={viewBox} aria-hidden="true" focusable="false">
    {children}
  </svg>
);

export const CARDS: Card[] = [
  {
    id: "sync",
    title: "Sync on every device",
    copy: "Write on the laptop, finish on the phone. Nothing to save.",
    size: "big",
    art: svg(
      <>
        {/* A laptop, a phone, and the arc between them that draws itself on hover. */}
        <rect x="14" y="40" width="68" height="44" rx="4" />
        <path d="M6 92h84l-6 6H12z" />
        <rect x="130" y="34" width="30" height="56" rx="5" />
        <path d="M141 82h8" />
        <path className="sc-arc" d="M60 34C76 8 120 6 140 28" pathLength="1" />
        <circle className="sc-dot" cx="140" cy="28" r="2.5" />
      </>,
      "0 0 168 104",
    ),
  },
  {
    id: "search",
    title: "Search that keeps up",
    copy: "Results as you type, across every note and file.",
    size: "small",
    art: svg(
      <g className="sc-lens">
        <circle cx="27" cy="27" r="14" />
        <path d="M37 37l13 13" />
        <path d="M20 24a8 8 0 0 1 6-5" />
      </g>,
    ),
  },
  {
    id: "share",
    title: "Share with a link",
    copy: "Anyone with it can read. You choose who can edit.",
    size: "small",
    art: svg(
      <>
        <rect className="sc-link-a" x="8" y="25" width="26" height="14" rx="7" />
        <rect className="sc-link-b" x="30" y="25" width="26" height="14" rx="7" />
      </>,
    ),
  },
  {
    id: "history",
    title: "Every version kept",
    copy: "Go back an hour or a year. Nothing is lost.",
    size: "small",
    art: svg(
      <>
        <circle cx="32" cy="32" r="18" />
        <path d="M32 20v12" />
        <path className="sc-hand" d="M32 32h9" />
        <path d="M10 20l4 6 6-3" />
      </>,
    ),
  },
  {
    id: "private",
    title: "Private by default",
    copy: "Encrypted on your device before it goes anywhere.",
    size: "wide",
    art: svg(
      <>
        <path className="sc-shackle" d="M22 30v-8a10 10 0 0 1 20 0v8" />
        <rect x="16" y="30" width="32" height="24" rx="4" />
        <path d="M32 40v5" />
      </>,
    ),
  },
];
