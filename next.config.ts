import type { NextConfig } from "next";

const _nextConfig: NextConfig = {
  output: "standalone",
  images: {
    domains: ["images.seeklogo.com"], // Tambahkan domain ini
  },
  experimental: {
    turbo: {
      resolveAlias: {
        canvas: "./empty-module.ts",
      },
    },
  },
};

export default _nextConfig;
