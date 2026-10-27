import type { Metadata } from "next";
import Link from "next/link";
import { SiteNav } from "@/brand/SiteNav";
import { Contents } from "@/case/Contents";
import { formatDate, getEntries, getEntry, getWriting, type Link as Ref } from "@/content/notebook";
import { EMAIL, GITHUB, LINKEDIN, site } from "@/content/site";
import { Cover, accentWord } from "@/notebook/Cover";
import { ProseTools } from "@/notebook/ProseTools";
import { Accent, plain } from "@/notebook/Title";
import "../../home.css";
import "@/case/case.css";
import "@/notebook/notebook.css";

// One Notebook post: the title and cover, the post at a glance (takeaways, what you need),
// the text with its contents pinned beside it, then where to go further and where the facts
// came from. A post first published elsewhere names that page as canonical.

export const dynamicParams = false;

export function generateStaticParams() {
  return getEntries().map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: PageProps<"/notebook/[slug]">): Promise<Metadata> {
  const found = getEntry((await params).slug);
  if (!found) return {};
  const { entry } = found;
  return {
    title: `${plain(entry.title)} · Rohan Pant`,
    description: entry.dek,
    alternates: { canonical: entry.original?.url ?? `${site.url}/notebook/${entry.slug}/` },
  };
}

const MAIL = `mailto:${EMAIL}?subject=${encodeURIComponent("About your Notebook post")}`;
const host = (url: string) => new URL(url).hostname.replace(/^www\./, "");

function Links({ items, numbered }: { items: Ref[]; numbered?: boolean }) {
  const List = numbered ? "ol" : "ul";
  return (
    <List className={numbered ? "nb-sources" : "nb-resources"}>
      {items.map((r) => (
        <li key={r.url}>
          <a href={r.url} rel="noopener">
            <span className="nb-link-title">{r.label} ↗</span>
            <span className="nb-link-meta">
              {r.by}
              {r.note && ` · ${r.note}`}
              {numbered && ` · ${host(r.url)}`}
            </span>
          </a>
        </li>
      ))}
    </List>
  );
}

export default async function NotebookEntryPage({ params }: PageProps<"/notebook/[slug]">) {
  const { entry, html, headings, minutes } = getEntry((await params).slug)!;

  const entries = getWriting();
  const next = entries[(entries.findIndex((e) => e.slug === entry.slug) + 1) % entries.length];

  const rail = [...headings];
  if (entry.resources?.length) rail.push({ id: "resources", label: "Resources" });
  if (entry.sources?.length) rail.push({ id: "sources", label: "Sources" });

  return (
    <main className="home nb nb-post">
      <SiteNav mail={MAIL} />
      <ProseTools target="post" />

      <header className="nb-post-head">
        <div className="nb-post-intro">
          <p className="case-back">
            <Link href="/notebook/">← Notebook</Link>
          </p>
          <p className="nb-meta">
            <span className="nb-type">{entry.type}</span>
            <time dateTime={entry.date}>{formatDate(entry.date)}</time>
            <span>{minutes} min read</span>
          </p>
          <h1>
            <Accent text={entry.title} />
          </h1>
          <p className="nb-post-dek">{entry.dek}</p>
          {entry.original && (
            <p className="nb-post-origin">
              First published on <a href={entry.original.url}>{entry.original.site} ↗</a>
            </p>
          )}
        </div>
        <Cover word={accentWord(entry.title)} motif={entry.motif ?? ""} kicker={entry.type} />
      </header>

      <section className="nb-glance" aria-label="At a glance">
        <div>
          <p className="nb-label">Key takeaways</p>
          <ol className="nb-takeaways">
            {entry.takeaways?.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ol>
        </div>
        <div>
          {entry.youNeed && (
            <>
              <p className="nb-label">You’ll need</p>
              <ul className="nb-needs">
                {entry.youNeed.map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ul>
            </>
          )}
          <p className="nb-label">Topics</p>
          <p className="nb-tags">
            {entry.tags.map((t) => (
              <span key={t}>{t}</span>
            ))}
          </p>
        </div>
      </section>

      <div className="case-layout nb-layout">
        {rail.length > 1 && (
          <Contents
            items={rail}
            links={[
              { href: MAIL, label: "Email me" },
              { href: LINKEDIN, label: "LinkedIn" },
            ]}
          />
        )}
        <div className="nb-body">
          <article id="post" className="nb-prose" dangerouslySetInnerHTML={{ __html: html }} />
          {entry.resources?.length ? (
            <section className="nb-refs" aria-labelledby="resources">
              <h2 id="resources">Resources</h2>
              <p className="nb-refs-note">Everything this guide uses, to go further on your own.</p>
              <Links items={entry.resources} />
            </section>
          ) : null}
          {entry.sources?.length ? (
            <section className="nb-refs" aria-labelledby="sources">
              <h2 id="sources">Sources</h2>
              <p className="nb-refs-note">Where the figures in this post come from. Most are early, and several are the companies’ own numbers.</p>
              <Links items={entry.sources} numbered />
            </section>
          ) : null}
        </div>
      </div>

      {next.slug !== entry.slug && (
        <nav className="nb-next" aria-label="Next in the Notebook">
          <a href={`/notebook/${next.slug}/`}>
            <Cover word={accentWord(next.title)} motif={next.motif ?? ""} size="sm" />
            <span className="nb-next-text">
              <span className="nb-label">Next in the Notebook</span>
              <span className="nb-card-title">
                <Accent text={next.title} />
              </span>
              <span className="nb-card-dek">{next.dek}</span>
            </span>
          </a>
        </nav>
      )}

      <Close />
    </main>
  );
}

function Close() {
  return (
    <section className="close" aria-labelledby="close">
      <h2 id="close">Building something like this? Let’s talk.</h2>
      <a className="close-mail" href={MAIL}>
        {EMAIL}
      </a>
      <p className="close-links">
        <a href={GITHUB}>GitHub ↗</a>
        <a href={LINKEDIN}>LinkedIn ↗</a>
      </p>
    </section>
  );
}
