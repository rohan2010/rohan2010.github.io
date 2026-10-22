import type { Metadata, Viewport } from "next";
import { hero, site, skipLabel } from "@/content/story";

const OG_ALT = `${site.name}: ${hero.title}`;
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: site.title,
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
    { media: "(prefers-color-scheme: light)", color: "#f4f2ec" },
    { media: "(prefers-color-scheme: dark)", color: "#0e1012" },
  ],
};

// Runs while the HTML parses, before first paint: picks the theme from the
// system setting and follows it if it changes. The kit's `.iso[data-theme]`
// tokens and the page tokens both key off `body[data-theme]`.
const THEME_SCRIPT = `(function(){var q=window.matchMedia("(prefers-color-scheme: dark)");var b=document.body;function set(){b.dataset.theme=q.matches?"dark":"light"}set();q.addEventListener("change",set)})()`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <body className="iso" data-theme="light" suppressHydrationWarning>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        <a href="#main" className="skip-link">
          {skipLabel}
        </a>
        {children}
      </body>
    </html>
  );
}
