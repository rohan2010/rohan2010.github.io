import type { WorkPage } from "../schema";

// STUB (phase 0): proves the /work/[slug]/ route and template. Owner: 1D, who
// replaces it from plans/v2/projects/bloomscroll.md (≥ 400 words). Facts here
// come only from the bloomScroll README (src/content/projects.ts).
export const bloomscroll: WorkPage = {
  slug: "bloomscroll",
  title: "bloomScroll",
  oneLine: "Keeps your YouTube feed on what you came for, and runs on your own computer.",
  role: "Open-source project",
  dates: "2026",
  year: 2026,
  scene: "everyone",
  ancestor: {
    year: 1992,
    text: "In 1992 Tapestry, at Xerox PARC, filtered an incoming stream of email and news by the notes people left on it. bloomScroll filters a stream too, a video feed, but for one person and on that person’s own machine.",
    sources: ["tapestry-1992"],
  },
  situation: ["A free, open-source browser extension that removes off-topic videos from your YouTube feed."],
  tension: ["Sending every title to a hosted model would cost money, leak what you watch and add latency to every page."],
  decisions: [
    {
      fork: "How does each title get judged?",
      taken: "A cascade: rules first, then MiniLM embeddings on your device, then an optional local model for the unclear few.",
      notTaken: "One hosted LLM call per title.",
      why: "Cost, privacy and latency: most titles are settled by the cheap steps, and nothing leaves the computer.",
    },
  ],
  architecture: {
    nodes: [
      { id: "rules", label: "Rules", job: "Settle the obvious titles first.", layer: 0, state: "done" },
      { id: "minilm", label: "MiniLM embeddings", job: "Compare a title with what you came for, on your device.", layer: 1, state: "done" },
      { id: "llm", label: "Local LLM (optional)", job: "Decide the unclear few.", layer: 2, state: "done" },
    ],
    edges: [
      { from: "rules", to: "minilm", label: "unsure titles" },
      { from: "minilm", to: "llm", label: "still unsure" },
    ],
  },
  learned: null,
  outcome: [{ text: "An early release: no account and no tracking." }],
  unlocks: ["A filter that runs where the person is, not where the server is."],
  status: "Early release",
  links: [{ label: "Code on GitHub", href: "https://github.com/rohan2010/bloomScroll", kind: "code" }],
};
