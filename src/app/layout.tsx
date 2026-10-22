import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans, IBM_Plex_Serif } from "next/font/google";
import { SiteHeader } from "@/components/site/SiteHeader";
import { MotionProvider } from "@/lib/motion/MotionProvider";
import { nav, site } from "@/content/site";
import "./globals.css";

// Lead-owned. IBM Plex because Hollerith's 1890 machine (scene 4) is IBM's root.
const serif = IBM_Plex_Serif({ variable: "--font-plex-serif", subsets: ["latin"], weight: ["400", "600"], display: "swap" });
const sans = IBM_Plex_Sans({ variable: "--font-plex-sans", subsets: ["latin"], weight: ["400", "600"], display: "swap" });
// Mono is only for years and card numerals: no preload, it is never the LCP.
const mono = IBM_Plex_Mono({ variable: "--font-plex-mono", subsets: ["latin"], weight: ["400", "500"], display: "swap", preload: false });

const OG_ALT = `${site.name}: ${site.line}`;

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.title, template: `%s · ${site.name}` },
  description: site.description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: site.name,
    title: site.title,
    description: site.description,
    locale: "en_US",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: OG_ALT, type: "image/png" }],
  },
  twitter: { card: "summary_large_image", title: site.title, description: site.description, images: [{ url: "/og.png", alt: OG_ALT }] },
  icons: { icon: [{ url: "/icon.svg", type: "image/svg+xml" }], apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }] },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f3efe4" },
    { media: "(prefers-color-scheme: dark)", color: "#121315" },
  ],
};

// Runs while the HTML parses, before first paint: follows the system theme,
// live. <html data-theme> drives the page tokens; <body data-theme> drives the
// anatomy kit's tokens (.iso[data-theme]).
const THEME_SCRIPT = `(function(){var q=window.matchMedia("(prefers-color-scheme: dark)");function set(){var t=q.matches?"dark":"light";document.documentElement.dataset.theme=t;document.body.dataset.theme=t}set();q.addEventListener("change",set)})()`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable} ${mono.variable}`} suppressHydrationWarning>
      <body className="iso" data-theme="light" suppressHydrationWarning>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        {/* JS off: the odometer strip cannot move, so it is not shown. */}
        <noscript>
          <style>{`.strip{display:none!important}`}</style>
        </noscript>
        <a href="#main" className="skip-link">
          {nav.skip}
        </a>
        <SiteHeader />
        {children}
        <MotionProvider />
      </body>
    </html>
  );
}
