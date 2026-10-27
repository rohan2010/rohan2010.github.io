import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { Marked, type Tokens } from "marked";

// The Notebook: writing, one folder per post in src/content/notebook/<slug>/ (entry.json and
// post.md). Server-only: reads the file system at build time.

export type Link = { label: string; by: string; url: string; note?: string };

export type Entry = {
  slug: string;
  type: string; // Tutorial, Experiment
  title: string; // the one serif word goes in *asterisks*
  dek: string;
  date: string; // YYYY-MM-DD
  tags: string[];
  motif?: string; // the drawing on the cover (src/notebook/Cover.tsx)
  takeaways?: string[];
  youNeed?: string[];
  resources?: Link[]; // to go further
  sources?: Link[]; // where the post's facts and figures come from
  // Where the post was first published; the page names it and points search engines there.
  original?: { site: string; url: string };
};

export type Heading = { id: string; label: string };

const DIR = join(process.cwd(), "src", "content", "notebook");
const WORDS_PER_MINUTE = 220;
// "> [!NOTE] Optional title" turns a quote into a callout.
const CALLOUTS: Record<string, string> = { NOTE: "Note", TIP: "Tip", CAUTION: "Careful" };

const escape = (text: string) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/<[^>]+>/g, "")
    .replace(/&[a-z]+;|&#\d+;/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export function getEntries(): Entry[] {
  return readdirSync(DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => ({ slug: entry.name, ...JSON.parse(readFileSync(join(DIR, entry.name, "entry.json"), "utf8")) }) as Entry)
    .sort((a, b) => b.date.localeCompare(a.date));
}

/** One entry with its body rendered. Section headings (##) get ids for the contents rail. */
export function getEntry(slug: string) {
  const entry = getEntries().find((e) => e.slug === slug);
  if (!entry) return null;
  const file = join(DIR, slug, "post.md");
  const markdown = existsSync(file) ? readFileSync(file, "utf8") : "";

  const headings: Heading[] = [];
  const marked = new Marked({
    renderer: {
      heading({ tokens, depth, text }: Tokens.Heading) {
        const html = this.parser.parseInline(tokens);
        if (depth !== 2) return `<h${depth}>${html}</h${depth}>\n`;
        const id = slugify(text);
        headings.push({ id, label: text.replace(/^Part \d+:\s*/, "") });
        return `<h2 id="${id}"><a class="nb-anchor" href="#${id}" aria-hidden="true" tabindex="-1">#</a>${html}</h2>\n`;
      },
      code({ text, lang }: Tokens.Code) {
        const label = lang && lang !== "text" ? `<span class="nb-code-lang">${lang}</span>` : "";
        return `<figure class="nb-code">${label}<button class="nb-copy" type="button">Copy</button><pre><code>${escape(text)}</code></pre></figure>\n`;
      },
      image({ href, text }: Tokens.Image) {
        // Plain <img>: marked wraps it in a <p>, where a <figure> isn't allowed.
        return `<img class="nb-img" src="${href}" alt="${escape(text)}" loading="lazy" />`;
      },
      link({ href, tokens }: Tokens.Link) {
        const outside = /^https?:/.test(href);
        return `<a href="${href}"${outside ? ' rel="noopener"' : ""}>${this.parser.parseInline(tokens)}</a>`;
      },
      table(token: Tokens.Table) {
        const cell = (c: Tokens.TableCell, tag: "th" | "td") => `<${tag}>${this.parser.parseInline(c.tokens)}</${tag}>`;
        const head = `<tr>${token.header.map((c) => cell(c, "th")).join("")}</tr>`;
        const rows = token.rows.map((r) => `<tr>${r.map((c) => cell(c, "td")).join("")}</tr>`).join("");
        return `<div class="nb-table"><table><thead>${head}</thead><tbody>${rows}</tbody></table></div>\n`;
      },
      blockquote({ tokens }: Tokens.Blockquote) {
        const body = this.parser.parse(tokens);
        const m = body.match(/^<p>\[!(NOTE|TIP|CAUTION)\]([^\n<]*)\n?/);
        if (!m) return `<blockquote>${body}</blockquote>\n`;
        const kind = m[1].toLowerCase();
        const title = m[2].trim() || CALLOUTS[m[1]];
        const rest = `<p>${body.slice(m[0].length)}`.replace(/<p>\s*<\/p>/g, "");
        return `<aside class="nb-callout is-${kind}"><p class="nb-callout-title">${title}</p>${rest}</aside>\n`;
      },
    },
  });
  const html = marked.parse(markdown, { async: false });
  const words = markdown.replace(/```[\s\S]*?```/g, " ").split(/\s+/).filter(Boolean).length;

  return { entry, html, headings, minutes: Math.max(1, Math.round(words / WORDS_PER_MINUTE)) };
}

export const getWriting = getEntries;

/** "2026-10-27" → "27 Oct 2026", fixed so the build and every visitor agree. */
export function formatDate(date: string) {
  const [y, m, d] = date.split("-").map(Number);
  return `${d} ${["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][m - 1]} ${y}`;
}
