import { EMAIL, GITHUB, LINKEDIN, RESUME_HREF, RESUME_READY } from "@/content/site";
import { projects, timeline } from "./data";
import { HomeMotion } from "./HomeMotion";
import "./home.css";

// The home page: hero → work → timeline → contact. Server-rendered and readable
// with JS off; HomeMotion adds all the movement on top.
export function Home() {
  return (
    <div className="v3">
      <nav className="v3-nav" aria-label="Main">
        <a href="#top" className="v3-nav-name">
          RP<span>.</span>
        </a>
        <div>
          <a href="#work">Work</a>
          <a href="#timeline">Timeline</a>
          <a href="#contact">Contact</a>
        </div>
      </nav>

      <main id="main" tabIndex={-1}>
        <header className="v3-hero" id="top">
          <div className="v3-grid" aria-hidden="true" />
          <div className="v3-glow" aria-hidden="true" />
          <p className="v3-kicker">
            <span className="v3-dot" /> Full-stack + AI engineer · Delhi · open to roles
          </p>
          <h1 className="v3-title" data-split>
            Rohan Pant builds AI that <em>actually ships.</em>
          </h1>
          <p className="v3-lede">
            Agents that do real work, the evals and guardrails that keep them honest, and the web apps around them. 3+ years
            in production, M.S. from Purdue, research at NeurIPS 2024.
          </p>
          <div className="v3-cta">
            <a className="v3-btn" href="#work">
              See the work
            </a>
            <a className="v3-btn ghost" href={`mailto:${EMAIL}`}>
              Say hello
            </a>
          </div>
          <dl className="v3-stats">
            <div>
              <dt>seller activation</dt>
              <dd>days → minutes</dd>
            </div>
            <div>
              <dt>listing time</dt>
              <dd>
                −<span data-count="40">40</span>%
              </dd>
            </div>
            <div>
              <dt>RLHF annotations audited</dt>
              <dd>
                <span data-count="6501">6,501</span>
              </dd>
            </div>
            <div>
              <dt>published</dt>
              <dd>NeurIPS ’24</dd>
            </div>
          </dl>
        </header>

        <div className="v3-marquee" aria-hidden="true">
          <div>
            {[0, 1].map((k) => (
              <span key={k}>
                LangGraph agents ✦ RAG pipelines ✦ MCP servers ✦ LLM evals ✦ Guardrails ✦ Next.js ✦ FastAPI ✦ Qdrant ✦
                PyTorch ✦ CI/CD ✦{" "}
              </span>
            ))}
          </div>
        </div>

        <section className="v3-section" id="work" aria-labelledby="work-h">
          <p className="v3-label">01 — Selected work</p>
          <h2 id="work-h" className="v3-h2" data-reveal>
            Four things I built, and what they changed.
          </h2>
          <div className="v3-work">
            {projects.map((p) => (
              <article className="v3-card" key={p.name} data-card>
                <p className="v3-card-kind">{p.kind}</p>
                <h3>{p.name}</h3>
                <p className="v3-card-stat">
                  {p.stat}
                  <span>{p.statLabel}</span>
                </p>
                <p className="v3-card-line">{p.line}</p>
                <ul className="v3-tags">
                  {p.stack.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
                {p.href && (
                  <a className="v3-card-link" href={p.href}>
                    {p.linkLabel} →
                  </a>
                )}
              </article>
            ))}
          </div>
        </section>

        <section className="v3-tl" id="timeline" aria-labelledby="tl-h">
          <div className="v3-tl-head">
            <p className="v3-label">02 — The path so far</p>
            <h2 id="tl-h" className="v3-h2">
              From reading handwriting to agents that act.
            </h2>
          </div>
          <div className="v3-tl-year" aria-hidden="true">
            {timeline[0].year}
          </div>
          <ol className="v3-tl-track">
            {timeline.map((t, i) => (
              <li className="v3-stop" key={i} data-stop>
                <span className="v3-stop-dot" aria-hidden="true" />
                <p className="v3-stop-when">{t.when}</p>
                <h3>{t.role}</h3>
                <p className="v3-stop-where">{t.where}</p>
                <p className="v3-stop-text">{t.text}</p>
                {t.stat && (
                  <p className="v3-stop-stat">
                    {t.stat.value} <span>{t.stat.label}</span>
                  </p>
                )}
                <ul className="v3-tags">
                  {t.tags.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </section>

        <section className="v3-contact" id="contact" aria-labelledby="contact-h">
          <p className="v3-label">03 — Next</p>
          <h2 id="contact-h" className="v3-big" data-reveal>
            Your team could be the next stop.
          </h2>
          <a className="v3-mail" href={`mailto:${EMAIL}`}>
            {EMAIL}
            <span aria-hidden="true">↗</span>
          </a>
          <ul className="v3-links">
            <li>
              <a href={LINKEDIN} rel="noreferrer">
                LinkedIn
              </a>
            </li>
            <li>
              <a href={GITHUB} rel="noreferrer">
                GitHub
              </a>
            </li>
            {RESUME_READY && (
              <li>
                <a href={RESUME_HREF}>Résumé</a>
              </li>
            )}
          </ul>
        </section>
      </main>

      <footer className="v3-foot">
        <span>© 2026 Rohan Pant</span>
        <span>Delhi · relocatable · immediate joiner</span>
      </footer>
      <HomeMotion />
    </div>
  );
}
