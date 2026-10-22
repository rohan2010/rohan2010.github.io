import { site } from "@/content/site";
import { sources } from "@/content/sources";

// Fine print, below the last viewport (craft-bar R-P2, B12). Lead-owned.
// The history sources are listed here so every claim on the page is checkable.
export function SiteFooter() {
  return (
    <footer className="site-footer">
      <details className="site-sources">
        <summary>Sources for the history</summary>
        <ol>
          {sources.map((s) => (
            <li key={s.id} id={`source-${s.id}`}>
              {s.source}.{" "}
              <a className="link" href={s.url} rel="noreferrer">
                {new URL(s.url).hostname.replace(/^www\./, "")}
              </a>
            </li>
          ))}
        </ol>
      </details>
      <p>© 2026 {site.name}. Set in IBM Plex, drawn with Anatomy.</p>
    </footer>
  );
}
