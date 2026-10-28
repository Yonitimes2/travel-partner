import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  // the indicator sits on top of the bottom navigation; errors still surface without it
  devIndicators: false,
  partialPrefetching: true,
  // the destination photos are made ahead of time with a hash in their names: cache them for a year
  async headers() {
    return [{ source: "/photos/:file*", headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }] }];
  },
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
