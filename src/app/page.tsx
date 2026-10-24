import { getProjects } from "@/content/projects";
import { EMAIL, GITHUB, LINKEDIN } from "@/content/site";
import { Desk } from "@/desk/Desk";
import { HISTORY } from "@/desk/content";
import "./home.css";

// Home: one sentence, the desk, three short lists. No frame around the desk;
// the desk and rohanOS carry the personality.
export default function Home() {
  const projects = getProjects();
  return (
    <main className="home">
      <header className="home-head">
        <h1>
          Rohan builds AI that does the paperwork, so humans don’t have to.
        </h1>
        <p className="home-status">Full-stack and AI engineer in Delhi, open to new roles. Off the clock, losing to Hades.</p>
      </header>

      <div className="home-desk">
        <Desk />
        <p className="home-hint">Everything on the desk opens. The computer works.</p>
      </div>

      <div className="home-lists">
        <section aria-labelledby="h-work">
          <h2 id="h-work">Work</h2>
          <ul>
            {projects.map((p) => (
              <li key={p.slug}>
                <a href={p.caseStudy ?? p.links.code ?? p.links.paper ?? `/#os/${p.slug}`}>{p.name}</a>
                <span>{p.oneLine}</span>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="h-before">
          <h2 id="h-before">Before this</h2>
          <ul>
            {[...HISTORY].reverse().map((step) => (
              <li key={step.text}>
                <span className="home-date">{step.date}</span>
                <span>{step.text}</span>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="h-elsewhere">
          <h2 id="h-elsewhere">Say hi</h2>
          <ul>
            <li>
              <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
            </li>
            <li>
              <a href={GITHUB}>GitHub</a>
            </li>
            <li>
              <a href={LINKEDIN}>LinkedIn</a>
            </li>
          </ul>
        </section>
      </div>
    </main>
  );
}
