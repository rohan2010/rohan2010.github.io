import { getProjects } from "@/content/projects";
import { site } from "@/content/site";
import { Desk } from "@/desk/Desk";
import { PANELS } from "@/desk/content";

// Home: name and line, the desk, then everything on it as a plain list
// (for skimmers, screen readers and JS-off). Styling stays plain for now.
export default function Home() {
  const projects = getProjects();
  const contact = PANELS.sticky;
  return (
    <main className="home">
      <h1>{site.name}</h1>
      <p className="home-role">Full-stack + AI engineer · Delhi · open to roles</p>
      <p className="home-line">I build AI that does paperwork so humans don’t have to. I’ve mostly spent the free time on Steam.</p>
      <a className="home-skip" href="#list">
        Or skip the desk ↓
      </a>

      <Desk />

      <section id="list" aria-labelledby="work-h">
        <h2 id="work-h">Work</h2>
        <ul className="home-list">
          {projects.map((p) => (
            <li key={p.slug}>
              <strong>{p.name}</strong> · {p.oneLine} <span className="home-muted">({p.status})</span>{" "}
              {p.caseStudy && <a href={p.caseStudy}>Case study</a>} {p.links.code && <a href={p.links.code}>Code ↗</a>}{" "}
              {p.links.paper && <a href={p.links.paper}>Paper ↗</a>}
            </li>
          ))}
        </ul>

        <h2>{PANELS.tickets.title}</h2>
        <ul className="home-list">
          {PANELS.tickets.list?.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>

        <h2>{PANELS.keyboard.title}</h2>
        <ul className="home-list">
          {PANELS.keyboard.list?.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>

        <h2>{contact.title}</h2>
        <p>{contact.body[0]}</p>
        <p className="home-links">
          {contact.links?.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
        </p>
      </section>
    </main>
  );
}
