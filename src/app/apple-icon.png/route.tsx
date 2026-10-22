import { ImageResponse } from "next/og";
import { NOTCHES } from "@/components/figures/bench/model";

// The home-screen icon, written to out/apple-icon.png at build time: a cartridge
// front with its key notches (Claude's pattern).
export const dynamic = "force-static";
const size = { width: 180, height: 180 };

export function GET() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#f4f2ec" }}>
        <div style={{ width: 92, height: 112, display: "flex", flexDirection: "column", alignItems: "center", padding: "16px 12px", border: "9px solid #121416", borderRadius: "8px 8px 20px 20px" }}>
          <div style={{ display: "flex", gap: 6 }}>
            {NOTCHES[0]!.map((on, notch) => (
              <div key={notch} style={{ width: 11, height: 11, borderRadius: 3, background: on ? "#121416" : "transparent", border: "3px solid #121416" }} />
            ))}
          </div>
          <div style={{ width: "100%", height: 6, background: "#121416", borderRadius: 3, marginTop: 22 }} />
          <div style={{ width: "100%", height: 6, background: "#121416", borderRadius: 3, marginTop: 9 }} />
        </div>
      </div>
    ),
    { ...size },
  );
}
