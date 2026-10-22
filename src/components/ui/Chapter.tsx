import type { Chapter as ChapterInfo } from "@/content/story";

// The shared chapter opener: a big numeral, the years, the chapter word, the
// H2 and an optional lead, beside the chapter's detail figure. Sides alternate
// (01 and 03 put the marker left); on a phone the marker comes first.
export function Chapter({
  chapter,
  title,
  lead,
  figure,
  side,
}: {
  chapter: ChapterInfo;
  title: string;
  lead?: React.ReactNode;
  figure: React.ReactNode;
  side: "left" | "right";
}) {
  return (
    <div className="chapter-opener" data-side={side}>
      <div className="chapter-marker" data-reveal>
        <p className="numeral" aria-hidden="true">
          {chapter.n}
        </p>
        <p className="mt-5 flex flex-wrap items-baseline gap-x-3">
          <span className="eyebrow">{chapter.word}</span>
          <span className="meta">{chapter.years}</span>
        </p>
        <h2 id={`${chapter.id}-title`} className="h2 mt-4">
          <span className="sr-only">{`${chapter.n} ${chapter.word}, ${chapter.years}: `}</span>
          {title}
        </h2>
        {lead ? <div className="lead text-ink-2 mt-6 max-w-[40ch]">{lead}</div> : null}
      </div>
      <div className="chapter-figure min-w-0" data-reveal data-reveal-delay="">
        {figure}
      </div>
    </div>
  );
}
