import { getEntries } from "@/content/notebook";
import { site } from "@/content/site";
import { plain } from "@/notebook/Title";

// The Notebook as an RSS feed, written once at build time (static export needs force-static).
export const dynamic = "force-static";

const xml = (text: string) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function GET() {
  const items = getEntries()
    .map((e) => {
      const url = `${site.url}/notebook/${e.slug}/`;
      return `<item><title>${xml(plain(e.title))}</title><link>${url}</link><guid>${url}</guid><pubDate>${new Date(`${e.date}T09:00:00Z`).toUTCString()}</pubDate><description>${xml(e.dek)}</description></item>`;
    })
    .join("");
  const body = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Rohan Pant · Notebook</title><link>${site.url}/notebook/</link><description>Writing on building with AI.</description><language>en</language>${items}</channel></rss>`;
  return new Response(body, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
