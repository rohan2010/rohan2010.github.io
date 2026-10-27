import type { Metadata } from "next";
import Link from "next/link";
import { SiteNav } from "@/brand/SiteNav";
import { getItem, getItems } from "@/content/playground";
import { EMAIL, GITHUB, LINKEDIN, site } from "@/content/site";
import { PromptBuilder } from "@/playground/PromptBuilder";
import { Accent, plain } from "@/notebook/Title";
import { CodeTabs } from "@/playground/CodeTabs";
import { Preview } from "@/playground/Preview";
import "../../home.css";
import "@/case/case.css";
import "@/notebook/notebook.css";
import "@/playground/builder.css";
import "@/playground/playground.css";

// One Playground item: the component running, the prompt to build your own, what my first
// version got wrong (each tied to the line in the prompt that avoids it), then the code.

export const dynamicParams = false;

export function generateStaticParams() {
  return getItems().map((i) => ({ slug: i.slug }));
}

export async function generateMetadata({ params }: PageProps<"/playground/[slug]">): Promise<Metadata> {
  const found = getItem((await params).slug);
  if (!found) return {};
  return {
    title: `${plain(found.item.title)} · Playground · Rohan Pant`,
    description: found.item.dek,
    alternates: { canonical: `${site.url}/playground/${found.item.slug}/` },
  };
}

const MAIL = `mailto:${EMAIL}?subject=${encodeURIComponent("About your Playground")}`;

export default async function PlaygroundItemPage({ params }: PageProps<"/playground/[slug]">) {
  const { item, code } = getItem((await params).slug)!;

  return (
    <main className="home nb pg pg-item">
      <SiteNav mail={MAIL} />

      <header className="pp-head">
        <p className="case-back">
          <Link href="/playground/">← Playground</Link>
        </p>
        <p className="nb-meta">
          <span className="nb-type">{item.kind}</span>
          <span>{item.stack.join(" · ")}</span>
        </p>
        <h1>
          <Accent text={item.title} />
        </h1>
        <p className="nb-post-dek">{item.dek}</p>
      </header>

      <Preview slug={item.slug} />

      <section className="pg-section" aria-labelledby="prompt">
        <div className="pg-section-head">
          <h2 id="prompt" className="nb-section-title">
            Build your own
          </h2>
          <p>Paste this into your coding agent. Change the highlighted parts to your project; everything else is there because of a mistake below.</p>
        </div>
        <PromptBuilder template={item.template} variables={item.variables} />
      </section>

      <section className="pg-section" aria-labelledby="mistakes">
        <div className="pg-section-head">
          <h2 id="mistakes" className="nb-section-title">
            {item.mistakesTitle ?? "What I got wrong first"}
          </h2>
          <p>{item.mistakesIntro ?? `${item.mistakes.length} things my first version did, and the words in the prompt that stop yours doing them.`}</p>
        </div>
        <ol className="pg-mistakes">
          {item.mistakes.map((m) => (
            <li key={m.then}>
              <p className="pg-then">{m.then}</p>
              <p className="pg-cost">{m.cost}</p>
              <p className="pg-now">
                <span className="nb-label">Now</span>
                {m.now}
              </p>
              <p className="pg-line">
                <span className="nb-label">In the prompt</span>“{m.line}”
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section className="pg-section" aria-labelledby="code">
        <div className="pg-section-head">
          <h2 id="code" className="nb-section-title">
            The code
          </h2>
          <p>The files this page runs, straight from the site’s repo. Copy them as they are, or hand them to your agent along with the prompt.</p>
        </div>
        <CodeTabs files={code} />
      </section>

      {item.seenIn?.length ? (
        <section className="pg-section pg-seen" aria-labelledby="seen">
          <h2 id="seen" className="nb-section-title">
            Running on this site
          </h2>
          <ul>
            {item.seenIn.map((s) => (
              <li key={s.href}>
                <a href={s.href}>
                  {s.label} <span aria-hidden="true">→</span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="close" aria-labelledby="close">
        <h2 id="close">Built your own? Show me.</h2>
        <a className="close-mail" href={`mailto:${EMAIL}?subject=${encodeURIComponent(`Built with: ${plain(item.title)}`)}`}>
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
