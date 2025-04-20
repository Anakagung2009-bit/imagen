import type { NextConfig } from "next";

const _nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    turbo: {
      resolveAlias: {
        canvas: "./empty-module.ts",
      },
    },
  },
};

export default _nextConfig;
