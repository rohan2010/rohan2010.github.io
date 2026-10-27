import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

// The Playground: web UI I built for this site, each with a prompt to rebuild it, what my
// first version got wrong, and the code. One folder each in src/content/playground/<slug>/
// (item.json); the running preview is keyed by slug in src/playground/previews.ts.
// Server-only: reads the file system at build time.

/** A blank in a prompt template, written {key} in the template. */
export type PromptVariable = { key: string; label: string; value: string; hint?: string };

export type Mistake = {
  then: string; // what the first version did
  cost: string; // why that didn't work
  now: string; // what it does instead
  line: string; // the words in the prompt that ask for the fix
};

export type PlaygroundItem = {
  slug: string;
  title: string; // the one serif word goes in *asterisks*
  dek: string;
  kind: string; // what it is on a page: Hero, Project page, Navigation…
  date: string; // YYYY-MM-DD
  order: number; // place on the Playground page, first = 1
  stack: string[];
  template: string;
  variables: PromptVariable[];
  mistakes: Mistake[];
  // The mistakes section's heading and line under it; default to "What I got wrong first".
  mistakesTitle?: string;
  mistakesIntro?: string;
  files: { path: string; label?: string; note?: string }[]; // repo paths, shown as code
  seenIn?: { label: string; href: string }[];
};

const DIR = join(process.cwd(), "src", "content", "playground");

export function getItems(): PlaygroundItem[] {
  return readdirSync(DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => ({ slug: entry.name, ...JSON.parse(readFileSync(join(DIR, entry.name, "item.json"), "utf8")) }) as PlaygroundItem)
    .sort((a, b) => a.order - b.order);
}

/** One item with the source of each file it lists, read from the repo so it never drifts. */
export function getItem(slug: string) {
  const item = getItems().find((i) => i.slug === slug);
  if (!item) return null;
  const code = item.files.map((f) => ({
    ...f,
    label: f.label ?? f.path.split("/").pop()!,
    lang: f.path.split(".").pop()!,
    text: readFileSync(join(process.cwd(), f.path), "utf8"),
  }));
  return { item, code };
}
