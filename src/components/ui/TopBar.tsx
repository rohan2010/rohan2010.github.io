import { RESUME_HREF, RESUME_READY, chapters, contactLink, menuLabel, resumeLabels, site } from "@/content/story";

// One sticky surface: the name, the chapter rail and Contact. ChapterRail (a
// tiny client component) marks the active chapter; progress through it is a
// CSS view timeline on the bar under each item.
export function TopBar() {
  return (
    <header className="topbar">
      <div className="wrap flex h-full items-center justify-between gap-6">
        <a href="#top" className="shrink-0 text-[15px] font-semibold tracking-[-0.01em]">
          {site.name}
        </a>
        <nav aria-label="Chapters" className="rail hidden h-full md:flex">
          <ol className="flex h-full items-stretch">
            {chapters.map((chapter) => (
              <li key={chapter.id} className="flex">
                <a href={`#${chapter.id}`} className="rail-item" data-ch={chapter.id}>
                  <span className="rail-n">{chapter.n}</span>
                  <span className="rail-word">{chapter.word}</span>
                  <span className="rail-years">{chapter.years}</span>
                  <span className="rail-bar" aria-hidden="true" />
                </a>
              </li>
            ))}
          </ol>
        </nav>
        <div className="hidden shrink-0 items-center gap-6 text-[14px] md:flex">
          <a href={contactLink.href} className="rail-contact">
            {contactLink.label}
          </a>
          {RESUME_READY ? (
            <a href={RESUME_HREF} download className="link">
              {resumeLabels.top}
            </a>
          ) : null}
        </div>
        <div className="flex min-w-0 items-center gap-3 md:hidden">
          <p className="rail-now meta min-w-0 truncate" aria-hidden="true" />
          {RESUME_READY ? (
            <a href={RESUME_HREF} download className="link text-[14px]">
              {resumeLabels.top}
            </a>
          ) : null}
          <details className="topbar-menu relative">
            <summary className="topbar-summary">{menuLabel}</summary>
            <nav aria-label="Chapters" className="card absolute right-0 top-[calc(100%+6px)] flex w-60 flex-col p-2 shadow-lg">
              {chapters.map((chapter) => (
                <a key={chapter.id} href={`#${chapter.id}`} className="menu-item">
                  <span className="mono text-[13px] text-accent-ink">{chapter.n}</span>
                  <span className="flex-1">{chapter.word}</span>
                  <span className="meta">{chapter.years}</span>
                </a>
              ))}
              <a href={contactLink.href} className="menu-item">
                <span className="flex-1">{contactLink.label}</span>
              </a>
            </nav>
          </details>
        </div>
      </div>
      <ol className="rail-phone md:hidden" aria-hidden="true">
        {chapters.map((chapter) => (
          <li key={chapter.id} data-ch={chapter.id}>
            <span className="rail-bar" />
          </li>
        ))}
      </ol>
    </header>
  );
}
