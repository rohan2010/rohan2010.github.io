import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // GitHub Pages only serves static files: build to `out/` with no server.
  output: "export",
  // /x/ is written as x/index.html, so deep links like /work/<slug>/ work on
  // GitHub Pages (tech-motion.md, G2). Write internal links with the slash.
  trailingSlash: true,
  // The default next/image loader needs a server; serve images as-is.
  images: { unoptimized: true },
  // cacheComponents/partialPrefetching are left off: they turn on PPR,
  // which fails the build with "PPR cannot be enabled in export mode".
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
