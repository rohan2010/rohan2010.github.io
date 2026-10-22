import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // GitHub Pages only serves static files: build to `out/` with no server.
  output: "export",
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
