import { chapters, field } from "@/content/story";
import { Chapter } from "../ui/Chapter";
import { Chips } from "../ui/Chips";

// 01 Field (2021): two field reports side by side, on one horizontal rule,
// because both happened the same year.
export function Field({ figure }: { figure: React.ReactNode }) {
  return (
    <section id="field" aria-labelledby="field-title" className="section">
      <div className="wrap">
        <Chapter chapter={chapters[0]!} title={field.title} figure={figure} side="left" />
        <ol className="field-reports">
          {field.entries.map((entry) => (
            <li key={entry.org} className="field-report" data-reveal>
              <p className="field-date meta uppercase">
                <span className="field-dot" aria-hidden="true" />
                {entry.dates}
              </p>
              <h3 className="h3 mt-6">{entry.org}</h3>
              <p className="small text-ink-2 mt-1">
                {entry.role} · {entry.place}
              </p>
              <p className="field-fact mt-6">{entry.keyFact}</p>
              <p className="mt-3 max-w-[58ch]">{entry.body}</p>
              {entry.chips.length ? <Chips items={entry.chips} className="mt-5" /> : null}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
