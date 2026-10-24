import type { Metadata } from "next";
import { B612, B612_Mono, Pixelify_Sans } from "next/font/google";
import { site } from "@/content/site";
import "./globals.css";

// B612: the typeface Airbus drew for cockpit displays. The site is set like an engineering drawing sheet.
const b612 = B612({ variable: "--font-b612", subsets: ["latin"], weight: ["400", "700"], display: "swap" });
const b612Mono = B612_Mono({ variable: "--font-b612-mono", subsets: ["latin"], weight: ["400"], display: "swap", preload: false });
// rohanOS chrome: a pixel face in the spirit of System 7.
const pixel = Pixelify_Sans({ variable: "--font-pixel", subsets: ["latin"], weight: ["500", "700"], display: "swap", preload: false });
export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: site.title,
  description: site.description,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${b612.variable} ${b612Mono.variable} ${pixel.variable}`}>
      <body>{children}</body>
    </html>
  );
}
