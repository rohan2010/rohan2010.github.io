import type { Metadata } from "next";
import Link from "next/link";
import { Flow, SectionHead } from "@/brand/Sections";
import { SiteNav } from "@/brand/SiteNav";
import { Changes } from "@/case/Changes";
import { Contents, type ContentsItem } from "@/case/Contents";
import { Facts } from "@/case/Facts";
import { getCase, getProjects } from "@/content/projects";
import { EMAIL, GITHUB, LINKEDIN } from "@/content/site";
import { Cascade } from "@/demos/Cascade";
import { Design } from "@/os/Design";
import { Toy } from "@/toy/Toy";
import "../../home.css";
import "@/case/case.css";

// A case study, the same shape for every project: the title and facts, the problem, how it's
// built, the decisions worth explaining, what was found or fixed, a demo, before and after.
// A section with nothing to say is left off, never padded.

export const dynamicParams = false;

export function generateStaticParams() {
  return getProjects()
    .filter((p) => p.case)
    .map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/work/[slug]">): Promise<Metadata> {
  const found = getCase((await params).slug);
  if (!found) return {};
  return { title: `${found.project.name} · Rohan Pant`, description: found.study.lede };
}

const MAIL = `mailto:${EMAIL}?subject=${encodeURIComponent("Interview: Rohan Pant")}`;
const DEMOS: Record<string, { label: string; cta: string; note: string; render: () => React.ReactNode }> = {
  "onboarding-toy": { label: "Try a toy version", cta: "Play the toy version", note: "made-up documents", render: () => <Toy /> },
  "bloomscroll-cascade": { label: "Try the cascade", cta: "Try the cascade", note: "a made-up feed", render: () => <Cascade /> },
};

// "*word*" in a title becomes the one accent word.
function Title({ text }: { text: string }) {
  return (
    <h1>
      {text.split(/\*([^*]+)\*/).map((part, i) => (i % 2 ? <em key={i}>{part}</em> : part))}
    </h1>
  );
}

function Prose({ html }: { html?: string }) {
  return html ? <div className="case-prose" dangerouslySetInnerHTML={{ __html: html }} /> : null;
}

export default async function CaseStudyPage({ params }: PageProps<"/work/[slug]">) {
  const found = getCase((await params).slug)!;
  const { project, study, prose } = found;
  const projects = getProjects();
  const pad = (n: number) => String(n).padStart(2, "0");
  const demo = project.demo && DEMOS[project.demo];
  const next = projects[(projects.indexOf(projects.find((p) => p.slug === project.slug)!) + 1) % projects.length];
  const nextHref = next.case ? `/work/${next.slug}/` : `/#os/${next.slug}`;

  // An edge pointing back to an earlier step is drawn dashed; only then does the caption explain it.
  const order = new Map(project.design?.nodes.map((n, i) => [n.id, i]));
  const hasLoop = project.design?.edges.some(([a, b]) => (order.get(b) ?? 0) < (order.get(a) ?? 0)) ?? false;

  // The sections in order, numbered as they appear.
  const sections: (ContentsItem & { body: React.ReactNode; note?: string })[] = [];
  if (prose.problem) sections.push({ id: "problem", label: "The problem", body: <Prose html={prose.problem} /> });
  if (project.design)
    sections.push({
      id: "arrangement",
      label: "How it’s built",
      body: (
        <>
          <Prose html={prose.arrangement} />
          <figure className="case-ga">
            <div className="case-ga-wide">
              <Design nodes={project.design.nodes} edges={project.design.edges} />
            </div>
            <div className="case-ga-narrow">
              <Flow design={project.design} />
            </div>
            {study.pattern && (
              <figcaption>
                {study.pattern[0].toUpperCase() + study.pattern.slice(1)}.{" "}
                {hasLoop && <span className="case-ga-key">The dashed line is the loop.</span>}
              </figcaption>
            )}
          </figure>
        </>
      ),
    });
  for (const d of study.details) {
    const html = prose[`detail-${d.id.toLowerCase()}` as "detail-a" | "detail-b"];
    if (!html) continue;
    const node = project.design?.nodes.find((n) => n.id === d.node);
    sections.push({
      id: `detail-${d.id.toLowerCase()}`,
      label: d.title,
      note: node ? `at ${node.label}` : undefined,
      body: (
        <>
          <Prose html={html} />
          {d.chose && (
            <dl className="case-choice">
              <div>
                <dt>Chose</dt>
                <dd>{d.chose}</dd>
              </div>
              {d.over && (
                <div>
                  <dt>Over</dt>
                  <dd>{d.over}</dd>
                </div>
              )}
              {d.because && (
                <div>
                  <dt>Because</dt>
                  <dd>{d.because}</dd>
                </div>
              )}
            </dl>
          )}
        </>
      ),
    });
  }
  if (prose.findings) sections.push({ id: "findings", label: "What we found", body: <Prose html={prose.findings} /> });
  if (prose["test-record"]) sections.push({ id: "test-record", label: "Testing it", body: <Prose html={prose["test-record"]} /> });
  if (demo)
    sections.push({
      id: "try-it",
      label: demo.label,
      note: demo.note,
      body: (
        <>
          <Prose html={prose["try-it"]} />
          <div className="case-demo">{demo.render()}</div>
        </>
      ),
    });
  if (study.changes?.length) sections.push({ id: "changes", label: "Before and after", body: <Changes changes={study.changes} /> });
  if (prose.around) sections.push({ id: "around", label: "Around it", body: <Prose html={prose.around} /> });

  return (
    <main className="home case">
      <SiteNav mail={MAIL} />

      <header className="case-hero">
        <div className="case-intro">
          <p className="case-back">
            <Link href="/">← Back to the desk</Link>
          </p>
          <p className="hero-status">
            <span className="dot" aria-hidden="true" />
            Case {pad(project.order)} · {project.status}
          </p>
          <Title text={study.title} />
          <p className="case-lede">{study.lede}</p>
          {study.result && (
            <div className="case-result">
              <p className="case-result-label">{study.result.label}</p>
              <p className="case-result-value">
                {study.result.from} → <b>{study.result.to}</b>
              </p>
              {study.result.note && <p className="case-result-note">{study.result.note}</p>}
            </div>
          )}
          <p className="case-ctas">
            <a className="btn" href={MAIL}>
              Email me
            </a>
            {demo && <a href="#try-it">{demo.cta} ↓</a>}
            {project.links.paper && <a href={project.links.paper}>Read the paper ↗</a>}
            {project.links.code && <a href={project.links.code}>Code on GitHub ↗</a>}
          </p>
        </div>
        <Facts study={study} status={project.status} />
      </header>

      <div className="case-layout">
        <Contents
          items={sections.map(({ id, label }) => ({ id, label }))}
          links={[
            { href: MAIL, label: "Email me" },
            { href: LINKEDIN, label: "LinkedIn" },
          ]}
        />
        <div className="case-main">
          {sections.map((s, i) => (
            <section key={s.id} className="sec case-sec" aria-labelledby={s.id}>
              <SectionHead id={s.id} n={pad(i + 1)} title={s.label} note={s.note} />
              {s.body}
            </section>
          ))}
        </div>
      </div>

      <nav className="case-next" aria-label="Next project">
        <span className="meta">Next project</span>
        <a href={nextHref}>
          {next.name} <span aria-hidden="true">→</span>
        </a>
      </nav>

      <section className="close" aria-labelledby="close">
        <p className="close-run" aria-hidden="true">
          RUN #44 · visitor · ✓ case read · <b>? escalating to a human_</b>
        </p>
        <h2 id="close">Hiring for full-stack or AI engineering? Let’s talk.</h2>
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
