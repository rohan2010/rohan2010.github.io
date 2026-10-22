import { chapters, research } from "@/content/story";
import { Chapter } from "../ui/Chapter";
import { Chips, OutLink } from "../ui/Chips";

// 02 Research (2022–24): one paper spread, on the page's only tinted band.
export function Research({ figure }: { figure: React.ReactNode }) {
  const { card } = research;
  return (
    <section id="research" aria-labelledby="research-title" className="section section-tint">
      <div className="wrap">
        <Chapter chapter={chapters[1]!} title={research.title} lead={research.lead} figure={figure} side="right" />
        <article className="research-spread" data-reveal>
          <div className="research-stat">
            <p className="stat">{card.stat}</p>
            <p className="small text-ink-2 mt-3">{card.statLabel}</p>
            <p className="mt-6">
              <span className="chip chip-accent">{card.badge}</span>
            </p>
          </div>
          <div className="research-paper">
            <h3 className="h3">{card.name}</h3>
            <p className="small text-ink-2 mt-1">{card.kind}</p>
            {card.body.map((paragraph) => (
              <p key={paragraph} className="mt-5 max-w-[60ch]">
                {paragraph}
              </p>
            ))}
            <p className="meta mt-6">{card.datasetsLabel}</p>
            <ul className="research-datasets mt-2">
              {card.datasets.map((dataset) => (
                <li key={dataset}>{dataset}</li>
              ))}
            </ul>
            <Chips items={card.chips} className="mt-6" />
            {card.paper ? <OutLink href={card.paper.href} label={card.paper.label} className="link mt-6 inline-block py-2" /> : null}
          </div>
        </article>
      </div>
    </section>
  );
}
