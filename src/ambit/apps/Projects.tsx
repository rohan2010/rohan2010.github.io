import { useState } from "react";
import { Design } from "@/os/Design";
import { SIMS } from "@/sim/sims";
import type { DesignNode } from "@/content/projects";

// Projects: not part of the made-up week. Rohan's real work, so the portfolio is one click away inside the
// demo: each project's README, its system design and its simulator.

export type AmbitProject = {
  slug: string;
  name: string;
  oneLine: string;
  year: string;
  status: string;
  caseStudy?: string;
  code?: string;
  paper?: string;
  readmeHtml: string;
  design?: { nodes: DesignNode[]; edges: [string, string][] };
  demo?: string;
};
type Tab = "readme" | "design" | "demo";

export function Projects({ projects, onBig, target }: { projects: AmbitProject[]; onBig: () => void; target?: string }) {
  const [slug, setSlug] = useState<string | null>(projects.some((p) => p.slug === target) ? target! : null);
  const [tab, setTab] = useState<Tab>("readme");
  const p = projects.find((x) => x.slug === slug);

  if (!p)
    return (
      <div className="am-pad">
        <p className="am-note">Not part of the made-up week. These are Rohan’s real projects.</p>
        <ul className="am-list am-projects">
          {projects.map((x) => (
            <li key={x.slug}>
              <button onClick={() => (setSlug(x.slug), setTab("readme"))}>
                <strong>{x.name}</strong>
                <span>{x.oneLine}</span>
                <small>
                  {x.year} · {x.status}
                </small>
              </button>
            </li>
          ))}
        </ul>
      </div>
    );

  const Sim = p.demo ? SIMS[p.demo]?.Sim : undefined;
  const tabs: [Tab, string][] = [["readme", "README"], ...(p.design ? ([["design", "System design"]] as [Tab, string][]) : []), ...(Sim ? ([["demo", SIMS[p.demo!].name]] as [Tab, string][]) : [])];
  return (
    <div className="am-project">
      <nav className="am-mail-bar" aria-label={p.name}>
        <button onClick={() => setSlug(null)}>← Projects</button>
        {tabs.map(([t, label]) => (
          <button
            key={t}
            className={tab === t ? "is-at" : ""}
            onClick={() => {
              setTab(t);
              if (t === "demo") onBig();
            }}
          >
            {label}
          </button>
        ))}
        <span className="am-project-links">
          {p.caseStudy && <a href={p.caseStudy}>Case study</a>}
          {p.code && (
            <a href={p.code} target="_blank" rel="noreferrer">
              Code
            </a>
          )}
          {p.paper && (
            <a href={p.paper} target="_blank" rel="noreferrer">
              Paper
            </a>
          )}
        </span>
      </nav>
      {tab === "readme" && <div className="am-readme" dangerouslySetInnerHTML={{ __html: p.readmeHtml }} />}
      {tab === "design" && p.design && (
        <div className="am-design">
          <Design nodes={p.design.nodes} edges={p.design.edges} />
        </div>
      )}
      {tab === "demo" && Sim && (
        <div className="am-demo">
          <Sim />
        </div>
      )}
    </div>
  );
}
