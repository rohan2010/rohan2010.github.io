import type { CaseStudy } from "@/content/projects";

// The facts a recruiter came for, in one short list beside the title.
export function Facts({ study, status }: { study: CaseStudy; status: string }) {
  const { facts } = study;
  const result = facts.result ?? (study.result && `${study.result.label}: ${study.result.from} → ${study.result.to}`);
  const rows = (
    [
      ["What", facts.part],
      ["Result", result],
      ["Where", facts.where],
      ["When", facts.when],
      ["My part", facts.role],
      ["Built with", facts.builtWith.join(", ")],
      ["Status", status],
      ["Note", facts.note],
    ] as [string, string | undefined][]
  ).filter((row): row is [string, string] => Boolean(row[1]));
  return (
    <aside className="facts" aria-label="At a glance">
      <p className="facts-head">At a glance</p>
      <dl>
        {rows.map(([label, value]) => (
          <div key={label} className={label === "Note" ? "is-note" : undefined}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
    </aside>
  );
}
