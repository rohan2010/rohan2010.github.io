// Colour schemes on trial for the identity: one source for the colour lab page, the
// previews and the ?scheme= switch on the home page. Each one keeps the desk's paper
// and ink idea and adds olive and brown in different roles.

export type Scheme = {
  id: string;
  name: string;
  idea: string;
  why: string[];
  risk: string;
  dark?: boolean;
  tokens: {
    paper: string; // page
    paper2: string; // inset surfaces
    ink: string; // text, lines
    ink2: string; // secondary text
    rule: string; // hairlines
    brand: string; // the identity colour: buttons, the closing band, banner ground
    brandInk: string; // text on brand
    deep: string; // the one dark object (the controller), footers, print headers
    signal: string; // small marks: status dot, rings, focus (non-text)
    signalInk: string; // the signal when it has to be text
    lift: string; // what lit faces of the desk mix toward
  };
};

export const SCHEMES: Scheme[] = [
  {
    id: "field-notes",
    name: "Field Notes",
    idea: "Olive is the identity; brown is the pencil that marks it up.",
    why: [
      "Olive reads as considered and calm, and almost no tech portfolio uses it, so it's memorable without shouting.",
      "The warm paper and espresso ink look like a field notebook, which suits someone who watches how people use things (HCI) and writes it down.",
      "A rust-brown marker keeps the redline idea from the engineering drawing, warmer than orange.",
    ],
    risk: "Quiet. It depends on the work and the desk for energy.",
    tokens: {
      paper: "#f5f2e9",
      paper2: "#ebe6d8",
      ink: "#26231c",
      ink2: "#5a5548",
      rule: "#d9d3c3",
      brand: "#4f5a2b",
      brandInk: "#f5f2e9",
      deep: "#2e3320",
      signal: "#a5532c",
      signalInk: "#94481f",
      lift: "#ffffff",
    },
  },
  {
    id: "olive-drab",
    name: "Olive Drab & Stencil",
    idea: "Military-surplus olive with a stencil-orange mark: equipment, not decoration.",
    why: [
      "Olive drab (#4B5320) is a real, named colour with a story: field gear built to work. That matches 'AI that does the paperwork'.",
      "The orange stencil mark is high-visibility, so calls to action and status dots still pop on a muted page.",
      "Strong enough to carry a LinkedIn banner or a résumé header on its own.",
    ],
    risk: "The most opinionated. Too much of the orange and it turns into a hiking brand.",
    tokens: {
      paper: "#f1f0e8",
      paper2: "#e6e5d9",
      ink: "#1e2017",
      ink2: "#55574a",
      rule: "#d6d5c6",
      brand: "#4b5320",
      brandInk: "#f1f0e8",
      deep: "#2b2f17",
      signal: "#d9622b",
      signalInk: "#a8461a",
      lift: "#ffffff",
    },
  },
  {
    id: "walnut",
    name: "Walnut Desk",
    idea: "Brown is the identity, like a wooden desk; olive is the plant on it.",
    why: [
      "Walnut brown feels crafted and personal, a maker's colour more than a corporate one.",
      "It ties straight to the desk: the brand colour is the desk's wood, the olive is the snake plant.",
      "Brown prints well and looks good on cream paper for a résumé.",
    ],
    risk: "Brown can read as old-fashioned or 'coffee shop' if the type isn't sharp.",
    tokens: {
      paper: "#f6f1e9",
      paper2: "#ece4d7",
      ink: "#2a1f18",
      ink2: "#5f5146",
      rule: "#dcd1c2",
      brand: "#6a4630",
      brandInk: "#f6f1e9",
      deep: "#3a281c",
      signal: "#6f7a3a",
      signalInk: "#55602a",
      lift: "#ffffff",
    },
  },
  {
    id: "kraft-moss",
    name: "Kraft & Moss",
    idea: "The paper itself is the colour: kraft-brown pages, moss-green ink for actions.",
    why: [
      "A kraft-paper ground makes 'paperwork' literal: the whole site feels like a document folder.",
      "Moss green on kraft is earthy and distinctive, and still passes contrast for buttons.",
      "Works on things you hand to people: printed cards, folders, a portfolio PDF.",
    ],
    risk: "A tinted background makes the white desk sit differently; screenshots look warmer than other sites.",
    tokens: {
      paper: "#ede4d3",
      paper2: "#e2d6c0",
      ink: "#2b241a",
      ink2: "#5b4f3d",
      rule: "#d2c4a8",
      brand: "#536030",
      brandInk: "#f4eee2",
      deep: "#33391c",
      signal: "#8b4a2b",
      signalInk: "#7a3f22",
      lift: "#fbf7ef",
    },
  },
  {
    id: "herbarium",
    name: "Herbarium",
    idea: "Pressed-plant paper: sage-olive for the identity, dried-rose brown for the mark.",
    why: [
      "Softer and greener than Field Notes, like a botanist's specimen sheet, which still fits the drawing-sheet idea.",
      "The dried-rose brown is a warmer, more human mark than orange or rust.",
      "Gentle enough for long reading, so it suits the blog and notes you want to publish.",
    ],
    risk: "Can drift toward wellness or florist branding if the type isn't technical.",
    tokens: {
      paper: "#f3f1e7",
      paper2: "#e8e5d6",
      ink: "#22251b",
      ink2: "#565a4a",
      rule: "#d7d5c3",
      brand: "#56633a",
      brandInk: "#f3f1e7",
      deep: "#2c3322",
      signal: "#9a5444",
      signalInk: "#8a4738",
      lift: "#ffffff",
    },
  },
  {
    id: "library",
    name: "Library Green",
    idea: "A reading room: deep library olive, leather-brown marks, parchment paper.",
    why: [
      "The darkest olive of the set reads as serious and scholarly, which backs up the NeurIPS paper and the HCI degree.",
      "Leather brown as the mark feels like bookbinding: a quiet reason the site doubles as a place to learn.",
      "Very high contrast on parchment, so it prints sharply on a résumé.",
    ],
    risk: "Can feel academic and heavy if it covers big areas.",
    tokens: {
      paper: "#f4eedf",
      paper2: "#e9e1cc",
      ink: "#231f17",
      ink2: "#5a5243",
      rule: "#dcd2bb",
      brand: "#3e4a2f",
      brandInk: "#f4eedf",
      deep: "#262d1c",
      signal: "#8a552c",
      signalInk: "#7a4a24",
      lift: "#fffdf6",
    },
  },
  {
    id: "olive-ink",
    name: "Olive Ink",
    idea: "One hue for everything: even the text is a very dark olive, not black. Brown is the only other colour.",
    why: [
      "A single-hue system is the most 'designed' choice: every grey on the page is secretly olive, and people feel it without seeing it.",
      "It makes the identity hard to copy and very consistent across the site, résumé and banners.",
      "Brown appears only as the mark, so actions are unmistakable.",
    ],
    risk: "Everything greenish can look tinted on cheap or uncalibrated screens.",
    tokens: {
      paper: "#f2f3ea",
      paper2: "#e6e8da",
      ink: "#1f2414",
      ink2: "#535a43",
      rule: "#d5d8c5",
      brand: "#3b4223",
      brandInk: "#f2f3ea",
      deep: "#262b17",
      signal: "#8a5a3b",
      signalInk: "#7b4f33",
      lift: "#ffffff",
    },
  },
  {
    id: "terminal-olive",
    name: "Terminal Olive",
    idea: "An old terminal's case and a phosphor-amber cursor: olive hardware, amber signal.",
    why: [
      "Nods to the engineer side: olive like old lab equipment, amber like a terminal cursor and the desk's agent log.",
      "Amber is the warmest possible mark that still stays in the brown family.",
      "Makes the RUN logs, code and mono labels feel native rather than decorative.",
    ],
    risk: "Retro-computing is a known trope; it needs restraint to not look like a theme.",
    tokens: {
      paper: "#eef0e4",
      paper2: "#e2e5d4",
      ink: "#1c2014",
      ink2: "#50563f",
      rule: "#d2d6c0",
      brand: "#3f4a1f",
      brandInk: "#eef0e4",
      deep: "#252b13",
      signal: "#b37518",
      signalInk: "#8a5810",
      lift: "#ffffff",
    },
  },
  {
    id: "tobacco-brass",
    name: "Tobacco & Brass",
    idea: "Brown-led and a little luxurious: tobacco brown, brass marks, ivory paper.",
    why: [
      "Tobacco brown with brass feels like well-made tools and instruments, a craftsman's palette.",
      "Distinctive on LinkedIn, where almost every banner is blue.",
      "Olive is kept as a supporting tone in shading, so the family still connects to the plant on the desk.",
    ],
    risk: "Brass can look gold, and gold reads as luxury or finance rather than engineering.",
    tokens: {
      paper: "#f6f2e8",
      paper2: "#ebe4d4",
      ink: "#261d16",
      ink2: "#5d5044",
      rule: "#dcd2c0",
      brand: "#5a3d2b",
      brandInk: "#f6f2e8",
      deep: "#33241a",
      signal: "#9c7a1e",
      signalInk: "#7a5f14",
      lift: "#ffffff",
    },
  },
  {
    id: "espresso-pistachio",
    name: "Espresso & Pistachio",
    idea: "Brown-led and friendlier: espresso brown for the identity, pistachio-olive for the marks.",
    why: [
      "Same family as Walnut but more contrast and more personality; the green mark feels fresh rather than corporate.",
      "Reads warm and approachable, which helps for a first impression with recruiters.",
      "Works nicely as stickers, avatars and small social graphics.",
    ],
    risk: "Food-brand associations (coffee, gelato) if the illustrations go cute.",
    tokens: {
      paper: "#f7f3ec",
      paper2: "#ede6da",
      ink: "#271c15",
      ink2: "#5e5045",
      rule: "#ddd3c4",
      brand: "#4a3022",
      brandInk: "#f7f3ec",
      deep: "#2e1f16",
      signal: "#6f7f2e",
      signalInk: "#56631f",
      lift: "#ffffff",
    },
  },
  {
    id: "matcha",
    name: "Matcha Studio",
    idea: "Light and modern: a pale matcha brand colour with dark text on it, cocoa as the mark.",
    why: [
      "The only option where the brand colour is light, so buttons and banners feel airy and contemporary, like a design studio.",
      "Cocoa brown keeps it grounded and supplies all the contrast.",
      "Stands out among dark-button portfolios.",
    ],
    risk: "Light brand colours have less punch; the call to action relies on dark text, not a dark block.",
    tokens: {
      paper: "#f6f6ef",
      paper2: "#ebecdf",
      ink: "#20221a",
      ink2: "#55584a",
      rule: "#d9dacb",
      brand: "#b9c28a",
      brandInk: "#22261a",
      deep: "#2f3324",
      signal: "#7a4a2c",
      signalInk: "#6b4026",
      lift: "#ffffff",
    },
  },
  {
    id: "night-field",
    name: "Night Field",
    idea: "The dark version: olive-black ground, sage for actions, tan as the mark.",
    why: [
      "A dark olive ground looks premium and suits banners, slides and video thumbnails.",
      "Sage on olive-black stays calm, and the tan mark keeps the brown in the family.",
      "Useful as the dark twin of whichever light scheme wins, rather than the main site.",
    ],
    risk: "Dark portfolios are common. On its own it's the least distinctive of the five.",
    dark: true,
    tokens: {
      paper: "#1f2119",
      paper2: "#282b20",
      ink: "#ece6d4",
      ink2: "#b3ad98",
      rule: "#3a3d30",
      brand: "#a3ad6b",
      brandInk: "#1a1c14",
      deep: "#0f100b",
      signal: "#c98a54",
      signalInk: "#d49a68",
      lift: "#3a3d30",
    },
  },
  {
    id: "espresso-night",
    name: "Espresso Night",
    idea: "The other dark twin: espresso-brown ground, light olive for actions, copper as the mark.",
    why: [
      "Warmer than Night Field; brown-black is rarer than the usual near-black, so it still feels like yours.",
      "Light olive buttons on espresso are calm but clearly clickable.",
      "Pairs with the brown-led light schemes (Walnut, Tobacco, Espresso & Pistachio) as their dark mode.",
    ],
    risk: "Brown-dark can look muddy on low-quality screens and projectors.",
    dark: true,
    tokens: {
      paper: "#1e1814",
      paper2: "#29211b",
      ink: "#efe7da",
      ink2: "#b8ab99",
      rule: "#3b3129",
      brand: "#b5bd7c",
      brandInk: "#1e1814",
      deep: "#120e0b",
      signal: "#d08b5b",
      signalInk: "#dc9c70",
      lift: "#3b3129",
    },
  },
];

// The chosen identity (2026-10-26). Every page renders with it; ?scheme= trials others.
export const DEFAULT_SCHEME = "tobacco-brass";

export const schemeById = (id: string | null | undefined) => SCHEMES.find((s) => s.id === id);

// WCAG contrast ratio between two #rrggbb colours.
const luminance = (hex: string) => {
  const [r, g, b] = [1, 3, 5]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
export const contrast = (a: string, b: string) => {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

// CSS for every scheme, scoped by [data-scheme]. The desk's own variables are derived
// from paper and ink, so it takes on each scheme without a second set of hexes.
export function schemesCss() {
  const vars = ({ tokens: t, dark }: Scheme) =>
    `--paper:${t.paper};--paper-2:${t.paper2};--ink:${t.ink};--ink-2:${t.ink2};--ink-3:color-mix(in oklab,${t.ink} 45%,${t.paper});--rule:${t.rule};` +
    `--brand:${t.brand};--brand-ink:${t.brandInk};--brand-text:${contrast(t.brand, t.paper) >= 4.5 ? t.brand : t.deep};--deep:${t.deep};--on-deep:${dark ? t.ink : t.paper};--signal:${t.signal};--signal-ink:${t.signalInk};--lift:${t.lift};`;
  const rules = SCHEMES.map(
    (s) =>
      `[data-scheme="${s.id}"],[data-scheme="${s.id}"] .home,[data-scheme="${s.id}"] .xp-track{${vars(s)}}` +
      `:root[data-scheme="${s.id}"],:root[data-scheme="${s.id}"] body{background:${s.tokens.paper}}`,
  ).join("");
  const desk =
    `[data-scheme] .iso[data-theme="light"]{` +
    `--anatomy-card:var(--paper);--anatomy-paper:var(--paper);--anatomy-page:var(--paper-2);` +
    `--anatomy-face:color-mix(in oklab,var(--paper),var(--lift) 65%);--anatomy-top:color-mix(in oklab,var(--paper),var(--lift) 65%);--anatomy-lit-top:color-mix(in oklab,var(--paper),var(--lift) 80%);` +
    `--anatomy-shade-0:color-mix(in oklab,var(--paper),var(--ink) 14%);--anatomy-shade-1:color-mix(in oklab,var(--paper),var(--ink) 10%);--anatomy-shade-2:color-mix(in oklab,var(--paper),var(--ink) 7%);--anatomy-shade-3:color-mix(in oklab,var(--paper),var(--ink) 4%);--anatomy-lit-shade:color-mix(in oklab,var(--paper),var(--ink) 6%);` +
    `--anatomy-hi:var(--ink);--anatomy-mid:color-mix(in oklab,var(--ink) 50%,var(--paper));--anatomy-lo:color-mix(in oklab,var(--ink) 32%,var(--paper));--anatomy-faint:color-mix(in oklab,var(--ink) 18%,var(--paper));--anatomy-lit:var(--ink);` +
    `--anatomy-strong:var(--ink);--anatomy-text:var(--ink-2);--anatomy-halo:color-mix(in oklab,var(--ink) 70%,var(--paper));--anatomy-dot:var(--ink)}` +
    `[data-scheme] .iso[data-theme="light"] .desk-black>.iso-fill{fill:var(--deep)}` +
    `[data-scheme] .iso[data-theme="light"] .desk-black>.iso-top{fill:color-mix(in oklab,var(--deep),#fff 12%)}` +
    `[data-scheme] .iso[data-theme="light"] .desk-black>.iso-shade{fill:color-mix(in oklab,var(--deep),#000 15%)}` +
    `[data-scheme] .iso[data-theme="light"] .desk-black>.iso-edge{stroke:color-mix(in oklab,var(--deep),#000 40%)}`;
  return rules + desk;
}
