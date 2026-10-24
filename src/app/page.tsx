import { getProjects } from "@/content/projects";
import { EMAIL, GITHUB, LINKEDIN, site } from "@/content/site";
import { Desk } from "@/desk/Desk";
import { HISTORY, SKILLS } from "@/desk/content";
import "./sheet.css";

// Home: an engineering drawing sheet. The desk is the drawing; the parts list
// is the projects; the title block is who drew it. Sheet 2 carries the
// revision table (career) and general notes (skills).
const ZONES = [1, 2, 3, 4, 5, 6, 7, 8];
const ROWS = ["A", "B", "C", "D"];
const REV = "ABCDEFGHJK";

export default function Home() {
  const projects = getProjects();
  return (
    <main className="sheets">
      <a className="sheet-skip" href="#parts">
        Skip the drawing
      </a>

      <section className="sheet" aria-label="Sheet 1: the desk">
        <Zones />
        <div className="sheet-drawing">
          <Desk />
        </div>

        <div className="sheet-foot">
          <table className="parts" id="parts">
            <caption>Parts list: work</caption>
            <thead>
              <tr>
                <th scope="col">Item</th>
                <th scope="col">Part</th>
                <th scope="col">Ref</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p, i) => (
                <tr key={p.slug}>
                  <td className="parts-n">{i + 1}</td>
                  <th scope="row">
                    {p.name}
                    <span className="parts-line">{p.oneLine}</span>
                    <span className="parts-status">{p.status}</span>
                  </th>
                  <td className="parts-ref">
                    {p.caseStudy && <a href={p.caseStudy}>Case study</a>}
                    {p.links.code && <a href={p.links.code}>Code</a>}
                    {p.links.paper && <a href={p.links.paper}>Paper</a>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="title-block">
            <div className="tb-cell tb-name">
              <span className="tb-label">Drawn by</span>
              <h1>{site.name}</h1>
            </div>
            <div className="tb-cell tb-title">
              <span className="tb-label">Title</span>
              <p>Full-stack and AI engineer</p>
            </div>
            <div className="tb-cell tb-line">
              <span className="tb-label">Note</span>
              <p>I build AI that does paperwork so humans don’t have to. I’ve mostly spent the free time on Steam.</p>
            </div>
            <div className="tb-cell tb-left">
              <span className="tb-label">Location</span>
              <p>Delhi, will relocate</p>
            </div>
            <div className="tb-cell">
              <span className="tb-label">Status</span>
              <p>Open to roles</p>
            </div>
            <div className="tb-cell tb-contact">
              <span className="tb-label">Contact</span>
              <p>
                <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
                <a href={LINKEDIN}>LinkedIn</a>
                <a href={GITHUB}>GitHub</a>
              </p>
            </div>
            <div className="tb-cell tb-left">
              <span className="tb-label">Scale</span>
              <p>1:4</p>
            </div>
            <div className="tb-cell">
              <span className="tb-label">Sheet</span>
              <p>1 of 2</p>
            </div>
          </div>
        </div>
      </section>

      <section className="sheet sheet-2" aria-label="Sheet 2: revisions and notes">
        <Zones />
        <div className="sheet-2-grid">
          <table className="revisions">
            <caption>Revisions: how I got here</caption>
            <thead>
              <tr>
                <th scope="col">Rev</th>
                <th scope="col">Date</th>
                <th scope="col">Description</th>
              </tr>
            </thead>
            <tbody>
              {HISTORY.map((step, i) => (
                <tr key={step.text}>
                  <td className="parts-n">{REV[i]}</td>
                  <td className="rev-date">{step.date}</td>
                  <td>{step.text}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="notes">
            <h2>General notes: what I work with</h2>
            <ol>
              {SKILLS.map((skill) => (
                <li key={skill.group}>
                  <strong>{skill.group}.</strong> {skill.items}.
                </li>
              ))}
            </ol>
            <p className="notes-end">Sheet 2 of 2</p>
          </div>
        </div>
      </section>
    </main>
  );
}

function Zones() {
  return (
    <div className="zones" aria-hidden="true">
      <div className="zones-top">
        {ZONES.map((n) => (
          <span key={n}>{n}</span>
        ))}
      </div>
      <div className="zones-side">
        {ROWS.map((r) => (
          <span key={r}>{r}</span>
        ))}
      </div>
    </div>
  );
}
