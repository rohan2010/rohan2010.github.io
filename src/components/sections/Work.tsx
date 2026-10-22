import { chapters, work } from "@/content/story";
import { Chapter } from "../ui/Chapter";

// 03 Work (2024–now): a spec sheet. The role, four metric tiles, the loop the
// bench runs, and the toolbox as four plain lists.
export function Work({ figure }: { figure: React.ReactNode }) {
  const { role } = work;
  return (
    <section id="work" aria-labelledby="work-title" className="section">
      <div className="wrap">
        <Chapter chapter={chapters[2]!} title={work.title} figure={figure} side="left" />
        <p className="text-[17px]" data-reveal>
          <strong className="font-semibold">{role.org}</strong>
          <span className="text-ink-2">
            {" "}
            · {role.title} · {role.place} · {role.dates}
          </span>
        </p>
        <ul className="work-tiles mt-8">
          {work.rows.map((row) => (
            <li key={row.label} className="card work-tile" data-reveal>
              <h3 className="meta">{row.label}</h3>
              <p className={`metric mt-3 ${row.small ? "metric-small" : ""}`}>{row.metric}</p>
              <p className="small text-ink-2 mt-4">{row.body}</p>
            </li>
          ))}
        </ul>
        <p className="mt-8" data-reveal>
          <a href={work.callback.href} className="link py-2">
            {work.callback.label}
          </a>
        </p>

        <div className="mt-20" data-reveal>
          <h3 className="eyebrow">{work.toolboxTitle}</h3>
          <div className="toolbox mt-6">
            {work.toolbox.map((group) => (
              <div key={group.label}>
                <h4 className="meta border-b border-rule pb-3">{group.label}</h4>
                <ul className="mt-3">
                  {group.items.map((item, index) => (
                    <li key={item} className={index < 3 ? "text-ink" : "text-ink-2"}>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
