import type { NextConfig } from "next";
import { join } from "node:path";
import { withSentryConfig } from "@sentry/nextjs";

const sentryOrg = process.env.SENTRY_ORG?.trim() || "tsilva";
const sentryProject = process.env.SENTRY_PROJECT?.trim() || "curriculum-vitae";

const nextConfig: NextConfig = {
  output: "export",
  outputFileTracingRoot: join(process.cwd(), ".."),
  env: {
    ASSET_CACHE_TOKEN:
      process.env.ASSET_CACHE_TOKEN ||
      process.env.GIT_COMMIT_HASH ||
      "dev",
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
  webpack: (config, { isServer, webpack }) => {
    // Only apply to client-side bundle
    if (!isServer) {
      const modernPolyfillShim = join(
        process.cwd(),
        "src/lib/empty-polyfill-module.js",
      );

      // Exclude certain heavy polyfills that aren't needed for modern browsers
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };

      // Next injects a legacy polyfill bundle into the App Router client runtime.
      // We only target modern browsers, so replace it with an empty module.
      config.plugins.push(
        new webpack.NormalModuleReplacementPlugin(
          /(?:^|[\\/])build[\\/]polyfills[\\/]polyfill-module(?:\.js)?$/,
          modernPolyfillShim,
        ),
      );
    }
    return config;
  },
  // Enable trailing slashes for better SEO
  trailingSlash: true,
  // Disable powered by header
  poweredByHeader: false,
};

const isHostedBuild = process.env.VERCEL === "1" && Boolean(process.env.VERCEL_DEPLOYMENT_ID);

export default withSentryConfig(nextConfig, {
  useRunAfterProductionCompileHook: isHostedBuild ? undefined : false,
  silent: !process.env.CI,
  org: sentryOrg,
  project: sentryProject,
  authToken: isHostedBuild ? process.env.SENTRY_AUTH_TOKEN : undefined,
  sourcemaps: {
    disable: !isHostedBuild || !process.env.SENTRY_AUTH_TOKEN,
  },
  webpack: {
    disableSentryConfig: !isHostedBuild,
    treeshake: {
      removeDebugLogging: true,
    },
  },
});
