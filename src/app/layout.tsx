import type { Metadata } from "next";
import { site } from "@/content/site";
import "./globals.css";

// Blank shell. The design is being re-planned from scratch.
export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: site.title,
  description: site.description,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
