import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/site/SiteFooter";
import { archive } from "@/content/work/archive";
import { workInOrder } from "@/content/work";
import { FORWARD, PageTransition, SharedElement, sharedName } from "@/lib/transitions";
import "./_components/work.css";

// /work/: the archive index. Owner: 1D.
export const metadata: Metadata = {
  title: "Work",
  description: "Project write-ups by Rohan Pant, in ruler order, plus earlier work.",
  alternates: { canonical: "/work/" },
};

export default function WorkIndex() {
  return (
    <PageTransition>
      <main id="main" tabIndex={-1} className="work">
        <header className="work-header">
          <h1 className="t-h1">Work</h1>
          <p className="work-one-line">How each project is built, in the order it sits on the ruler.</p>
        </header>
        <section className="work-body" aria-labelledby="pages">
          <h2 id="pages" className="t-h2">Write-ups</h2>
          <ul className="work-index">
            {workInOrder().map((page) => (
              <li key={page.slug}>
                <Link className="link" href={`/work/${page.slug}/`} transitionTypes={FORWARD}>
                  <SharedElement name={sharedName(page.slug)}>
                    <span>{page.title}</span>
                  </SharedElement>
                </Link>{" "}
                <span className="t-year" data-mono="">{page.year}</span>. {page.oneLine}
              </li>
            ))}
          </ul>
          <h2 className="t-h2">Earlier work</h2>
          <ul className="work-index">
            {archive.map((entry) => (
              <li key={entry.name}>
                <strong>{entry.name}</strong> <span className="t-year" data-mono="">{entry.year}</span>
                {entry.credit ? ` (${entry.credit})` : null}. {entry.line}{" "}
                {entry.href ? (
                  <a className="link" href={entry.href} rel="noreferrer">
                    Code
                  </a>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      </main>
      <SiteFooter />
    </PageTransition>
  );
}
