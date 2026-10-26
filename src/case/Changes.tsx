import type { CaseStudy } from "@/content/projects";

// Before, now and next, one row each: what changed and what it did.
export function Changes({ changes }: { changes: NonNullable<CaseStudy["changes"]> }) {
  return (
    <ol className="changes">
      {changes.map((c) => (
        <li key={c.when}>
          <span className="changes-when">{c.when}</span>
          <span className="changes-what">{c.change}</span>
          {c.effect && <span className="changes-effect">{c.effect}</span>}
        </li>
      ))}
    </ol>
  );
}
