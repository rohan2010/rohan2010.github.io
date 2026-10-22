import Link from "next/link";
import type { WorkPage } from "@/content/schema";
import { sourceById, type SourceId } from "@/content/sources";
import { workInOrder } from "@/content/work";
import { SiteFooter } from "@/components/site/SiteFooter";
import { BACK, FORWARD, PageTransition, SharedElement, sharedName } from "@/lib/transitions";
import "./work.css";

// The "Field report" template shell (MASTER §3, concepts §5). Owner: 1D, who
// builds it out (exploded architecture in src/figures/explode/, forks drawn as
// forks, the mini ruler). Arc: Situation → Tension → What I did → Outcome →
// What it unlocks (craft-bar UX-CS1). `learned` null → that section is hidden.

export function WorkTemplate({ page }: { page: WorkPage }) {
  const order = workInOrder();
  const index = order.findIndex((p) => p.slug === page.slug);
  const prev = order[index - 1];
  const next = order[index + 1];
  const back = page.scene ? `/#${page.scene}` : "/";
  return (
    <PageTransition>
      <main id="main" tabIndex={-1} className="work">
        <header className="work-header">
          <p>
            <Link className="link" href={back} transitionTypes={BACK}>
              ← Back to the story
            </Link>
          </p>
          <SharedElement name={sharedName(page.slug)}>
            <h1 className="t-h1">{page.title}</h1>
          </SharedElement>
          <p className="work-one-line">{page.oneLine}</p>
          <p className="t-caption">
            {page.role} · <span className="t-year" data-mono="">{page.dates}</span> · {page.status}
          </p>
        </header>

        <aside className="work-ancestor" aria-labelledby="ancestor">
          <h2 id="ancestor" className="t-h3">
            The ancestor, <span className="t-year" data-mono="">{page.ancestor.year}</span>
          </h2>
          <p>{page.ancestor.text}</p>
          <p className="t-caption">
            Source:{" "}
            {page.ancestor.sources.map((id) => {
              const source = sourceById(id as SourceId);
              return (
                <a key={id} className="link" href={source.url} rel="noreferrer">
                  {source.source}
                </a>
              );
            })}
          </p>
        </aside>

        <div className="work-body">
          <section aria-labelledby="situation">
            <h2 id="situation" className="t-h2">Situation</h2>
            {page.situation.map((p, i) => <p key={i}>{p}</p>)}
          </section>
          <section aria-labelledby="tension">
            <h2 id="tension" className="t-h2">Tension</h2>
            {page.tension.map((p, i) => <p key={i}>{p}</p>)}
          </section>
          <section aria-labelledby="decisions">
            <h2 id="decisions" className="t-h2">What I did</h2>
            <h3 className="t-h3">Architecture</h3>
            {/* List fallback; 1D adds the exploded figure above it. */}
            <ol className="work-arch">
              {page.architecture.nodes.map((node) => (
                <li key={node.id}>
                  <strong>{node.label}</strong> {node.job}
                  {node.state === "stub" ? " (stub, not built yet)" : null}
                </li>
              ))}
            </ol>
            <h3 className="t-h3">Forks in the road</h3>
            {page.decisions.map((d) => (
              <div key={d.fork} className="work-fork">
                <p>
                  <strong>{d.fork}</strong>
                </p>
                <p>Taken: {d.taken}</p>
                <p>Not taken: {d.notTaken}</p>
                <p>Why: {d.why}</p>
              </div>
            ))}
          </section>
          {page.learned ? (
            <section aria-labelledby="learned">
              <h2 id="learned" className="t-h2">What broke, what I learned</h2>
              <ul>
                {page.learned.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          ) : null}
          <section aria-labelledby="outcome">
            <h2 id="outcome" className="t-h2">Outcome</h2>
            <ul>
              {page.outcome.map((o) => (
                <li key={o.text}>
                  {o.value ? <strong>{o.value} </strong> : null}
                  {o.text}
                </li>
              ))}
            </ul>
          </section>
          <section aria-labelledby="unlocks">
            <h2 id="unlocks" className="t-h2">What it unlocks</h2>
            {page.unlocks.map((p, i) => <p key={i}>{p}</p>)}
            <ul className="work-links">
              {page.links.map((l) => (
                <li key={l.href}>
                  <a className="link" href={l.href} rel="noreferrer">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <nav className="work-pager" aria-label="More projects">
          {prev ? (
            <Link className="link" href={`/work/${prev.slug}/`} transitionTypes={BACK}>
              ← <span className="t-year" data-mono="">{prev.year}</span> {prev.title}
            </Link>
          ) : <span />}
          <Link className="link" href="/work/" transitionTypes={BACK}>
            All work
          </Link>
          {next ? (
            <Link className="link" href={`/work/${next.slug}/`} transitionTypes={FORWARD}>
              Next project: <span className="t-year" data-mono="">{next.year}</span> {next.title} →
            </Link>
          ) : <span />}
        </nav>
      </main>
      <SiteFooter />
    </PageTransition>
  );
}
