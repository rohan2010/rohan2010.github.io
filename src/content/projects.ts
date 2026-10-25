import { readdirSync, readFileSync } from "node:fs";
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
  readmeHtml: string;
};

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
