import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

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
  experimental: {
    optimizePackageImports: ["lucide-react"],
    // Disable features that can hurt performance
    optimizeServerReact: false,
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  // Optimize bundle by excluding certain polyfills
  webpack: (config, { isServer }) => {
    // Only apply to client-side bundle
    if (!isServer) {
      // Exclude certain heavy polyfills that aren't needed for modern browsers
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
  // Enable trailing slashes for better SEO
  trailingSlash: true,
  // Disable powered by header
  poweredByHeader: false,
};

export default withSentryConfig(nextConfig, {
  silent: !process.env.CI,
  sourcemaps: {
    disable: true,
  },
});
