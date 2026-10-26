import type { Project } from "@/content/projects";

// Pieces shared by the home page and the case studies:
// a section head (numbered ring, title, hairline, mono note) and a project's design graph as a chain.

export function SectionHead({ id, n, title, note }: { id: string; n: string; title: string; note?: string }) {
  return (
    <div className="sec-head">
      <span className="sec-ring" aria-hidden="true">
        {n}
      </span>
      <h2 id={id}>{title}</h2>
      <span className="sec-rule" aria-hidden="true" />
      {note && <span className="sec-note">{note}</span>}
    </div>
  );
}

// The project's own design graph, drawn as a chain; an edge that points back is a retry loop.
export function Flow({ design, compact = false }: { design: Project["design"]; compact?: boolean }) {
  if (!design) return null;
  const index = new Map(design.nodes.map((node, i) => [node.id, i]));
  const loops = design.edges.filter(([a, b]) => (index.get(b) ?? 0) < (index.get(a) ?? 0));
  return (
    <ol className={compact ? "flow flow-compact" : "flow"}>
      {design.nodes.map((node) => {
        const back = loops.find(([a]) => a === node.id);
        return (
          <li key={node.id}>
            <span className="flow-label">{node.label}</span>
            {!compact && node.note && <span className="flow-note">{node.note}</span>}
            {!compact && back && <span className="flow-loop">↺ back to {design.nodes[index.get(back[1]) ?? 0].label}</span>}
          </li>
        );
      })}
    </ol>
  );
}
