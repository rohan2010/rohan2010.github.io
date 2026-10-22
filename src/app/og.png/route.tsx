import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { CARTRIDGES, NOTCHES } from "@/components/figures/bench/model";
import { hero, site } from "@/content/story";

// The share card (design pass, section 9.2), rendered once at build time to
// out/og.png. A route handler, not the opengraph-image file convention: the
// convention exports the file without an extension, and GitHub Pages would
// then serve it as application/octet-stream.
// No bench drawing: Satori would not apply iso.css, and a mis-shaded bench is
// worse than none. The cartridge tags carry the bench's key-notch patterns.

export const dynamic = "force-static";
const size = { width: 1200, height: 630 };

const geist = readFile(join(process.cwd(), "node_modules/next/dist/compiled/@vercel/og/Geist-Regular.ttf"));

const TAGS = ["Claude", "GPT-4o", "Gemini", "Local LLM"] satisfies readonly (typeof CARTRIDGES)[number][];

export async function GET() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#f4f2ec", fontFamily: "Geist" }}>
        <div style={{ width: 6, height: "100%", background: "#0f8b8d" }} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "64px 72px 60px 66px" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 44, color: "#121416" }}>{site.name}</div>
            <div style={{ fontSize: 26, color: "#5c6066", marginTop: 8 }}>Full-stack + AI engineer</div>
          </div>
          <div style={{ fontSize: 84, color: "#121416", letterSpacing: -2, lineHeight: 1.05 }}>{hero.title}</div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", gap: 16 }}>
              {TAGS.map((name, index) => (
                <div
                  key={name}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    padding: "10px 16px 10px",
                    border: "2px solid #3f444a",
                    borderRadius: "4px 4px 10px 10px",
                    background: "#fbfaf7",
                  }}
                >
                  <div style={{ display: "flex", gap: 6 }}>
                    {NOTCHES[index]!.map((on, notch) => (
                      <div key={notch} style={{ width: 9, height: 5, borderRadius: 2, background: on ? "#3f444a" : "#dcd8ce" }} />
                    ))}
                  </div>
                  <div style={{ fontSize: 24, color: "#121416", marginTop: 6 }}>{name}</div>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 26, color: "#0a6466", marginTop: 28 }}>my day job · Purdue M.S. HCI · NeurIPS 2024</div>
          </div>
        </div>
      </div>
    ),
    { ...size, fonts: [{ name: "Geist", data: await geist, style: "normal", weight: 400 }] },
  );
}
