import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { pos, SCALE_END } from "@/components/ruler/scale";
import { site } from "@/content/site";

// The share card, rendered once at build time to out/og.png. A route handler,
// not the opengraph-image convention: that exports a file with no extension,
// which GitHub Pages would serve as application/octet-stream.
// The ruler from 1843 to the present, sepia drifting to teal, the Lovelace
// line and the name. Set in IBM Plex Serif when Google Fonts is reachable at
// build time (next/font needs it too); otherwise in the bundled Geist.

export const dynamic = "force-static";
const size = { width: 1200, height: 630 };

const QUOTE = "“It can do whatever we know how to order it to perform.”";
const TEXT = `${QUOTE}${site.name}${site.role}Ada Lovelace, Note G, 18432026`;

async function plexSerif(weight: 400 | 600): Promise<ArrayBuffer | null> {
  try {
    const css = await (await fetch(`https://fonts.googleapis.com/css2?family=IBM+Plex+Serif:wght@${weight}&text=${encodeURIComponent(TEXT)}`)).text();
    const url = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/)?.[1];
    return url ? await (await fetch(url)).arrayBuffer() : null;
  } catch {
    return null;
  }
}

const geist = () => readFile(join(process.cwd(), "node_modules/next/dist/compiled/@vercel/og/Geist-Regular.ttf"));

const TICKS = [1843, 1890, 1950, 1989, 2017, 2022, 2026];

export async function GET() {
  const [regular, bold] = await Promise.all([plexSerif(400), plexSerif(600)]);
  const fonts = regular && bold
    ? [
        { name: "Plex", data: regular, style: "normal" as const, weight: 400 as const },
        { name: "Plex", data: bold, style: "normal" as const, weight: 600 as const },
      ]
    : [{ name: "Plex", data: await geist(), style: "normal" as const, weight: 400 as const }];

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#f3efe4", fontFamily: "Plex", color: "#1b1a17" }}>
        <div style={{ width: 96, height: "100%", display: "flex", position: "relative", borderRight: "2px solid #ddd6c6" }}>
          {TICKS.map((year) => (
            <div
              key={year}
              style={{ position: "absolute", right: 0, top: 40 + (pos(year) / SCALE_END) * 540, display: "flex", alignItems: "center", gap: 8, fontSize: 18, color: "#55524a" }}
            >
              {year}
              <div style={{ width: 18, height: 2, background: "#55524a" }} />
            </div>
          ))}
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "64px 72px 56px 64px" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 68, lineHeight: 1.05, letterSpacing: -1.5 }}>{QUOTE}</div>
            <div style={{ fontSize: 24, color: "#55524a", marginTop: 20 }}>Ada Lovelace, Note G, 1843</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", height: 6, width: "100%", backgroundImage: "linear-gradient(90deg, #8a5a2b, #0f8b8d)" }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 24 }}>
              <div style={{ fontSize: 44, fontWeight: 600 }}>{site.name}</div>
              <div style={{ fontSize: 26, color: "#0a6466" }}>{site.role}</div>
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
