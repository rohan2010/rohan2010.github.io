import { getProjects, type Project } from "@/content/projects";
import { EMAIL, GITHUB, LINKEDIN } from "@/content/site";
import { Flow, SectionHead } from "@/brand/Sections";
import { SiteNav } from "@/brand/SiteNav";
import { Desk } from "@/desk/Desk";
import { HISTORY } from "@/desk/content";
import { DitherGrid } from "@/home/DitherGrid";
import { Exploded } from "@/home/Exploded";
import "./home.css";

// Home: who and what, the desk as an exploded drawing, then the work, the route here
// and one ask. Everything below the desk borrows the desk's drawing language: hairlines,
// numbered rings, small mono notes, one redline for things you can act on.

const MAIL = `mailto:${EMAIL}?subject=${encodeURIComponent("Interview: Rohan Pant")}`;
const CASE_STUDY = "/work/onboarding-agent/";
const PAPER = "https://arxiv.org/abs/2411.11937";

function linkOf(p: Project) {
  if (p.caseStudy) return { href: p.caseStudy, label: "Case study", inside: true };
  if (p.links.paper) return { href: p.links.paper, label: "Paper" };
  if (p.links.code) return { href: p.links.code, label: "Code" };
  return { href: `/#os/${p.slug}`, label: "Open" };
}

export default function Home() {
  const projects = getProjects();
  const [lead, ...rest] = projects;
  return (
    <main className="home">
      <SiteNav mail={MAIL} />
      {/* The hero sits beside the desk; scrolling fades it and takes the desk apart. */}
      <div className="home-desk">
        <Exploded
          backdrop={<DitherGrid />}
          pointer={["Live: rohanOS is running", "Click the screen to use it"]}
          intro={
            <header className="hero">
              <p className="hero-status">
                <span className="dot" aria-hidden="true" />
                Open to full-stack and AI roles · Delhi, can relocate
              </p>
              <h1>
                Rohan builds AI that does the <em>paperwork</em>, so humans don’t have to.
              </h1>
              <p className="hero-sub">
                Full-stack and AI engineer, 3+ years in. I build systems that check their own work, retry when
                they’re wrong, and hand the unsure cases to a person instead of guessing.
              </p>
              <dl className="hero-proof">
                <div>
                  <dt>In production</dt>
                  <dd>
                    <a href={CASE_STUDY}>Seller onboarding: days → minutes</a>
                  </dd>
                </div>
                <div>
                  <dt>Published</dt>
                  <dd>
                    <a href={PAPER}>NeurIPS 2024 ↗</a>
                  </dd>
                </div>
                <div>
                  <dt>Trained in</dt>
                  <dd>M.S. HCI, Purdue</dd>
                </div>
              </dl>
              <div className="hero-actions">
                <a className="btn" href={MAIL}>
                  Email me
                </a>
                <a className="text-link" href={CASE_STUDY}>
                  Read the agent case study <span aria-hidden="true">→</span>
                </a>
              </div>
              <p className="hero-hint">
                <span aria-hidden="true">↓</span> Everything on the desk opens. Scroll and it comes apart.
              </p>
            </header>
          }
        >
          <Desk />
        </Exploded>
      </div>

      <section className="sec" aria-labelledby="work">
        <SectionHead id="work" n="01" title="Work" note={`${projects.length} projects`} />
        <p className="receipts">
          Seller activation: <a href={CASE_STUDY}>days to minutes</a>. Product listings: 40% faster.{" "}
          <a href={projects.find((p) => p.links.paper)?.links.paper}>A NeurIPS 2024 paper</a> on the values hiding in AI
          training data. And before all that, 30% more sign-ups at a Dubai startup.
        </p>

        <article className="lead">
          <div className="lead-text">
            <p className="meta">
              Case {String(lead.order).padStart(2, "0")} · {lead.year} · {lead.status}
            </p>
            <h3>{lead.name}</h3>
            <p className="lead-line">{lead.oneLine}</p>
            <p className="lead-result">
              days <span aria-hidden="true">→</span> minutes
            </p>
            <p className="lead-actions">
              <a className="btn btn-ghost" href={lead.caseStudy ?? CASE_STUDY}>
                Read the case study
              </a>
            </p>
          </div>
          <div className="lead-flow">
            <p className="meta">How it works</p>
            <Flow design={lead.design} />
          </div>
        </article>

        <ul className="rows">
          {rest.map((p) => {
            const link = linkOf(p);
            return (
              <li key={p.slug} className="row">
                <span className="row-n">{String(p.order).padStart(2, "0")}</span>
                <div className="row-main">
                  <h3>
                    <a href={link.href}>
                      {p.name}{" "}
                      <span className="row-arrow" aria-hidden="true">
                        {"inside" in link ? "→" : "↗"}
                      </span>
                    </a>
                  </h3>
                  <p>{p.oneLine}</p>
                  <p className="meta">
                    {p.year} · {p.status}
                  </p>
                </div>
                <Flow design={p.design} compact />
              </li>
            );
          })}
        </ul>
      </section>

      <section className="sec" aria-labelledby="route">
        <SectionHead id="route" n="02" title="How I got here" note="Delhi → Dubai (remote) → Purdue → now" />
        <ol className="route">
          {[...HISTORY].reverse().map((step, i) => (
            <li key={step.text} className={i === 0 ? "is-now" : undefined}>
              <span className="route-date">{step.date}</span>
              <span className="route-dot" aria-hidden="true" />
              <span className="route-text">{step.text}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="close" aria-labelledby="close">
        <p className="close-run" aria-hidden="true">
          RUN #43 · visitor · ✓ work reviewed · <b>? escalating to a human_</b>
        </p>
        <h2 id="close">Hiring for full-stack or AI engineering? Let’s talk.</h2>
        <p className="close-note">Based in Delhi, happy to relocate, and I can start right away.</p>
        <a className="close-mail" href={MAIL}>
          {EMAIL}
        </a>
        <p className="close-links">
          <a href={GITHUB}>GitHub ↗</a>
          <a href={LINKEDIN}>LinkedIn ↗</a>
        </p>
      </section>
    </main>
  );
}
