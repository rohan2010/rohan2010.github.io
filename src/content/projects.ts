import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { marked } from "marked";

// Projects, one folder each in src/content/projects/<slug>/ (project.json + README.md).
// Server-only: reads the file system at build time. Add a folder to add a project.

export type DesignNode = { id: string; label: string; note?: string };

export type Project = {
  slug: string;
  name: string;
  order: number;
  oneLine: string;
  year: string;
  status: string;
  links: { code?: string; paper?: string };
  demo?: string;
  caseStudy?: string | null;
  design?: { nodes: DesignNode[]; edges: [string, string][] };
  case?: CaseStudy;
  readmeHtml: string;
};

// A case study: the facts in project.json under "case", the prose in case.md split on
// fixed "## <slot>" headings. A slot with no text is left off the page, never padded.
export type CaseStudy = {
  title: string; // the one serif word goes in *asterisks*
  lede: string;
  // The headline result as a before → after, with an optional note on how it was measured.
  result?: { label: string; from: string; to: string; note?: string };
  // facts.result: the facts list's Result line when it isn't a before/after (a finding).
  facts: { part: string; where: string; when: string; role?: string; result?: string; builtWith: string[]; note?: string };
  pattern?: string; // names the arrangement as a known pattern
  // id ties a detail to its case.md slot (detail-a, detail-b); node to the step it explains.
  details: { id: string; node: string; title: string; chose?: string; over?: string; because?: string }[];
  changes?: { when: string; change: string; effect?: string }[];
};
export const CASE_SLOTS = ["problem", "arrangement", "detail-a", "detail-b", "findings", "test-record", "try-it", "around"] as const;
export type CaseSlot = (typeof CASE_SLOTS)[number];

const DIR = join(process.cwd(), "src", "content", "projects");

export function getProjects(): Project[] {
  return readdirSync(DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => {
      const meta = JSON.parse(readFileSync(join(DIR, entry.name, "project.json"), "utf8"));
      const readme = readFileSync(join(DIR, entry.name, "README.md"), "utf8");
      return { slug: entry.name, ...meta, readmeHtml: marked.parse(readme, { async: false }) } as Project;
    })
    .sort((a, b) => a.order - b.order);
}

/** The case study for a project, with its prose rendered per slot. Throws if a detail's
 *  ring would point at a node the design doesn't have, so the build fails instead. */
export function getCase(slug: string) {
  const project = getProjects().find((p) => p.slug === slug);
  if (!project?.case) return null;
  for (const detail of project.case.details) {
    if (!project.design?.nodes.some((n) => n.id === detail.node)) throw new Error(`${slug}: detail ${detail.id} points at "${detail.node}", which isn't in design.nodes`);
  }
  const file = join(DIR, slug, "case.md");
  const prose: Partial<Record<CaseSlot, string>> = {};
  if (existsSync(file)) {
    const parts = readFileSync(file, "utf8").split(/^## +([\w-]+)\s*$/m);
    for (let i = 1; i < parts.length; i += 2) {
      const slot = parts[i] as CaseSlot;
      if (!CASE_SLOTS.includes(slot)) throw new Error(`${slug}/case.md: unknown section "## ${slot}"`);
      const text = parts[i + 1].trim();
      if (text) prose[slot] = marked.parse(text, { async: false });
    }
  }
  return { project, study: project.case, prose };
}
