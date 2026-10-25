import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  // the indicator sits on top of the bottom navigation; errors still surface without it
  devIndicators: false,
  partialPrefetching: true,
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
