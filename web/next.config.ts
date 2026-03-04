import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  env: {
    GIT_COMMIT_HASH: process.env.GIT_COMMIT_HASH || "dev",
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "curriculum-vitae-r2.tsilva.eu",
      },
    ],
  },
};

export default nextConfig;
