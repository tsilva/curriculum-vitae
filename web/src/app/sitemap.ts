import type { MetadataRoute } from "next";
import fs from "node:fs";
import path from "node:path";
import { siteUrl } from "@/lib/site-config";

export const dynamic = "force-static";

function walkFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) {
    return [];
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkFiles(fullPath));
      continue;
    }
    files.push(fullPath);
  }

  return files;
}

function getLatestContentUpdate(): Date {
  const root = path.resolve(process.cwd(), "..");
  const candidates = [
    path.join(root, "data"),
    path.join(process.cwd(), "src", "data"),
    path.join(process.cwd(), "src", "app"),
  ];

  let latest = 0;

  for (const candidate of candidates) {
    for (const file of walkFiles(candidate)) {
      const stats = fs.statSync(file);
      latest = Math.max(latest, stats.mtimeMs);
    }
  }

  return latest > 0 ? new Date(latest) : new Date();
}

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = getLatestContentUpdate();
  const siteRoutes = ["/"];

  return siteRoutes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified,
    changeFrequency: "monthly" as const,
    priority: route === "/" ? 1 : 0.8,
  }));
}
