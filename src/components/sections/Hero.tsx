import { EMAIL, RESUME_HREF, RESUME_READY, hero, resumeLabels } from "@/content/story";

// Desktop: text in columns 1–4, the bench in 5–12, its legend under it.
// Phone: eyebrow and H1, then the bench, then the lead, CTAs, facts and legend
// (CSS order). The DOM stays text-first, so the H1, lead and CTAs come before
// the bench for screen readers and the keyboard.
export function Hero({ figure, legend }: { figure: React.ReactNode; legend: React.ReactNode }) {
  return (
    <section id="top" aria-labelledby="hero-title" className="wrap">
      <div className="hero-grid">
        <div className="hero-head">
          <p className="eyebrow">{hero.eyebrow}</p>
          <h1 id="hero-title" className="display hero-title mt-3 lg:mt-5">
            {hero.title}
          </h1>
        </div>
        <div className="hero-rest">
          <p className="lead text-ink-2 max-w-[34ch]">{hero.lead}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <a href={hero.primary.href} className="btn btn-primary">
              {hero.primary.label}
            </a>
            {RESUME_READY ? (
              <a href={RESUME_HREF} download className="btn btn-secondary">
                {resumeLabels.hero}
              </a>
            ) : null}
            <a href={`mailto:${EMAIL}`} className="link py-2 text-[15px] sm:ml-3">
              {EMAIL}
            </a>
          </div>
          <ul className="hero-facts meta mt-8">
            {hero.facts.map((fact) => (
              <li key={fact}>{fact}</li>
            ))}
          </ul>
        </div>
        <div className="hero-figure min-w-0">{figure}</div>
        <div className="hero-legend min-w-0">{legend}</div>
      </div>
    </section>
  );
}
