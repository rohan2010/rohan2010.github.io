import type { Metadata } from "next";
import Link from "next/link";
import { SiteNav } from "@/brand/SiteNav";
import { formatDate, getEntry, getWriting, type Entry } from "@/content/notebook";
import { EMAIL, site } from "@/content/site";
import { Cover, accentWord } from "@/notebook/Cover";
import { Accent } from "@/notebook/Title";
import "../home.css";
import "@/notebook/notebook.css";

// The Notebook: the writing, newest post up top with what you'll take from it, then the rest.
// Prompts live on the Playground, next to what they build.

export const metadata: Metadata = {
  title: "Notebook · Rohan Pant",
  description: "Writing on building with AI, by Rohan Pant: guides you can follow and experiments I’m running.",
  alternates: { types: { "application/rss+xml": `${site.url}/notebook/feed.xml` } },
};

const MAIL = `mailto:${EMAIL}?subject=${encodeURIComponent("Hello from the Notebook")}`;
const href = (e: Entry) => `/notebook/${e.slug}/`;

function Meta({ entry }: { entry: Entry }) {
  return (
    <p className="nb-meta">
      <span className="nb-type">{entry.type}</span>
      <time dateTime={entry.date}>{formatDate(entry.date)}</time>
      <span>{getEntry(entry.slug)!.minutes} min read</span>
    </p>
  );
}

export default function NotebookPage() {
  const [latest, ...rest] = getWriting();

  return (
    <main className="home nb">
      <SiteNav mail={MAIL} />

      <header className="nb-head">
        <div>
          <p className="hero-status">
            <span className="dot" aria-hidden="true" />
            Notebook
          </p>
          <h1>
            Notes from building with <em>AI</em>.
          </h1>
          <p className="nb-head-sub">Guides you can follow in a Colab notebook, and experiments I’m running. Prompts and components are on the <Link href="/playground/">Playground</Link>.</p>
        </div>
        <dl className="nb-stats">
          <div>
            <dt>Posts</dt>
            <dd>
              <a href="#writing">{rest.length + 1}</a>
            </dd>
          </div>
          <div>
            <dt>Follow</dt>
            <dd>
              <a href="/notebook/feed.xml">RSS feed</a>
            </dd>
          </div>
        </dl>
      </header>

      <section className="nb-writing" aria-labelledby="writing">
        <h2 id="writing" className="nb-section-title">
          Writing
        </h2>
        <article className="nb-feature">
          <a className="nb-feature-cover" href={href(latest)} tabIndex={-1} aria-hidden="true">
            <Cover word={accentWord(latest.title)} motif={latest.motif ?? ""} kicker="Latest" />
          </a>
          <div className="nb-feature-text">
            <Meta entry={latest} />
            <h3>
              <a href={href(latest)}>
                <Accent text={latest.title} />
              </a>
            </h3>
            <p className="nb-feature-dek">{latest.dek}</p>
            {latest.takeaways && (
              <>
                <p className="nb-label">What you’ll take away</p>
                <ul className="nb-takeaways">
                  {latest.takeaways.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </>
            )}
            <a className="btn" href={href(latest)}>
              Read the post&nbsp;<span aria-hidden="true">→</span>
            </a>
          </div>
        </article>

        {rest.length > 0 && (
          <ul className="nb-cards">
            {rest.map((e) => (
              <li key={e.slug}>
                <a className="nb-card" href={href(e)}>
                  <Cover word={accentWord(e.title)} motif={e.motif ?? ""} size="sm" />
                  <Meta entry={e} />
                  <span className="nb-card-title">
                    <Accent text={e.title} />
                  </span>
                  <span className="nb-card-dek">{e.dek}</span>
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
