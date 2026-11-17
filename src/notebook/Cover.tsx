// A post's cover: the simulators' tobacco desktop, the title's accent word in the serif,
// and a small drawing of the post's own idea. No stock images; everything is in the tokens.

const MOTIFS: Record<string, () => React.ReactNode> = {
  // Jev: a constrained answer space, one option chosen, and a yes/no probability.
  decide: () => (
    <svg viewBox="0 0 220 150" aria-hidden="true">
      {["frontend", "backend", "design"].map((label, i) => (
        <g key={label} transform={`translate(18 ${16 + i * 34})`}>
          <rect width="120" height="24" rx="12" className={i === 1 ? "cv-pick" : "cv-pill"} />
          <circle cx="14" cy="12" r="4.5" className={i === 1 ? "cv-dot-on" : "cv-dot"} />
          <text x="26" y="16" className={i === 1 ? "cv-text-on" : "cv-text"}>
            {label}
          </text>
        </g>
      ))}
      <g transform="translate(152 16)">
        <text y="10" className="cv-text">
          escalate
        </text>
        <rect y="20" width="48" height="74" rx="6" className="cv-pill" />
        <rect y={20 + 74 * 0.09} width="48" height={74 * 0.91} rx="6" className="cv-pick" />
        <text x="24" y="112" textAnchor="middle" className="cv-text-on">
          91% yes
        </text>
      </g>
    </svg>
  ),
  // LoRA: a textbook that stays the same, with sticky notes on a transparent layer above it.
  layers: () => (
    <svg viewBox="0 0 220 150" aria-hidden="true">
      <rect x="26" y="30" width="120" height="104" rx="6" className="cv-pill" />
      {Array.from({ length: 7 }, (_, i) => (
        <rect key={i} x="40" y={46 + i * 11} width={i % 3 === 2 ? 64 : 92} height="3" rx="1.5" className="cv-line" />
      ))}
      <rect x="62" y="16" width="120" height="104" rx="6" className="cv-glass" />
      <rect x="128" y="34" width="42" height="34" rx="3" className="cv-note" />
      <rect x="96" y="80" width="42" height="30" rx="3" className="cv-note" transform="rotate(-5 117 95)" />
      <rect x="136" y="38" width="26" height="2.5" className="cv-note-line" />
      <rect x="136" y="45" width="18" height="2.5" className="cv-note-line" />
    </svg>
  ),
  // Luck: two runs of the same agent match message for message, then split on a near-tie.
  lucky: () => (
    <svg viewBox="0 0 220 150" aria-hidden="true">
      {Array.from({ length: 6 }, (_, i) => (
        <circle key={i} cx={20 + i * 16} cy="75" r="4.5" className="cv-dot-on cv-run" />
      ))}
      <path d="M100 75 C 122 75, 128 38, 150 38 L 166 38" className="cv-path" />
      <path d="M100 75 C 122 75, 128 112, 150 112 L 166 112" className="cv-path cv-path-off" />
      <circle cx="100" cy="75" r="7" className="cv-fork" />
      <text x="100" y="58" textAnchor="middle" className="cv-text">28</text>
      <rect x="168" y="27" width="40" height="22" rx="11" className="cv-pick" />
      <text x="188" y="42" textAnchor="middle" className="cv-text-dark">pass</text>
      <rect x="168" y="101" width="40" height="22" rx="11" className="cv-pill" />
      <text x="188" y="116" textAnchor="middle" className="cv-text">fail</text>
    </svg>
  ),
};

export function Cover({ word, motif, kicker, size = "lg" }: { word: string; motif: string; kicker?: string; size?: "lg" | "sm" }) {
  const Motif = MOTIFS[motif];
  return (
    <div className={`cv cv-${size}`} aria-hidden="true">
      {kicker && <span className="cv-kicker">{kicker}</span>}
      <span className="cv-word">{word}</span>
      {Motif && <span className="cv-art">{Motif()}</span>}
    </div>
  );
}

/** The accent word of a title ("*Decide*" → "Decide"), for the cover. */
export const accentWord = (title: string) => title.match(/\*([^*]+)\*/)?.[1] ?? title.split(" ")[0];
