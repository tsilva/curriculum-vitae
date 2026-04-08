import type { NextConfig } from "next";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { withSentryConfig } from "@sentry/nextjs";

function loadOptionalEnvFile(fileName: string) {
  const filePath = join(process.cwd(), fileName);

  if (!existsSync(filePath)) {
    return;
  }

  for (const rawLine of readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line || line.startsWith("#")) {
      continue;
    }

    const normalizedLine = line.startsWith("export ") ? line.slice(7) : line;
    const separatorIndex = normalizedLine.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = normalizedLine.slice(0, separatorIndex).trim();

    if (!key || process.env[key] !== undefined) {
      continue;
    }

    const value = normalizedLine.slice(separatorIndex + 1).trim();
    process.env[key] = value.replace(/^['"]|['"]$/g, "");
  }
}

loadOptionalEnvFile(".env.sentry-build-plugin");

const sentryOrg = process.env.SENTRY_ORG?.trim() || "tsilva";
const sentryProject = process.env.SENTRY_PROJECT?.trim() || "curriculum-vitae";
const sentryBuildEnabled = Boolean(process.env.SENTRY_AUTH_TOKEN);

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
  org: sentryOrg,
  project: sentryProject,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  sourcemaps: {
    disable: !sentryBuildEnabled,
  },
  webpack: {
    treeshake: {
      removeDebugLogging: true,
    },
  },
});
