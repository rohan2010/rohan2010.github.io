import type { Metadata } from "next";
import { B612, B612_Mono, Instrument_Sans, Instrument_Serif, JetBrains_Mono, Pixelify_Sans } from "next/font/google";
import { site } from "@/content/site";
import { DEFAULT_SCHEME, schemesCss } from "@/theme/schemes";
import "./globals.css";

// B612: the typeface Airbus drew for cockpit displays. The site is set like an engineering drawing sheet.
const b612 = B612({ variable: "--font-b612", subsets: ["latin"], weight: ["400", "700"], display: "swap" });
const b612Mono = B612_Mono({ variable: "--font-b612-mono", subsets: ["latin"], weight: ["400"], display: "swap", preload: false });
// Home: Instrument Sans for text, Instrument Serif italic for the one word that matters,
// JetBrains Mono for labels and notes. All three are free under the SIL Open Font License.
const sans = Instrument_Sans({ variable: "--font-sans", subsets: ["latin"], weight: ["400", "500", "600"], display: "swap" });
const serif = Instrument_Serif({ variable: "--font-serif", subsets: ["latin"], weight: "400", style: "italic", display: "swap" });
const mono = JetBrains_Mono({ variable: "--font-mono", subsets: ["latin"], weight: ["400", "500"], display: "swap" });
// rohanOS chrome: a pixel face in the spirit of System 7.
const pixel = Pixelify_Sans({ variable: "--font-pixel", subsets: ["latin"], weight: ["500", "700"], display: "swap", preload: false });
export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: site.title,
  description: site.description,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" data-scheme={DEFAULT_SCHEME} className={`${b612.variable} ${b612Mono.variable} ${sans.variable} ${serif.variable} ${mono.variable} ${pixel.variable}`}>
      <head>
        <style>{schemesCss()}</style>
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
