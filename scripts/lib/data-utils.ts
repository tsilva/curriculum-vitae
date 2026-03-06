// Shared utilities for build scripts that process data/**/*.md frontmatter files
import * as fs from "fs";
import * as path from "path";
import { createRequire } from "module";

const webRequire = createRequire(
  path.join(path.resolve(__dirname, "../.."), "web", "package.json")
);
const matter = webRequire("gray-matter");
const jsYaml = webRequire("js-yaml");

export function readFrontmatterFiles(
  dir: string
): { id: string; data: any; content: string }[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => {
      const raw = fs.readFileSync(path.join(dir, f), "utf-8");
      const parsed = matter(raw);
      return {
        id: path.basename(f, ".md"),
        data: parsed.data,
        content: parsed.content.trim(),
      };
    });
}

export const MONTH_MAP: Record<string, number> = {
  Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6,
  Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12,
};

// Parse "2023" or "2023-06" into a comparable number (year * 100 + month)
export function parseStartField(start: string): number {
  if (start.includes("-")) {
    const [y, m] = start.split("-");
    return parseInt(y) * 100 + parseInt(m);
  }
  return parseInt(start) * 100;
}

// Parse start date from duration like "Sep 2016 - May 2024" or "2003 - 2006 · 3 years"
export function parseDurationStart(duration: string): number {
  const startPart = duration.split(" - ")[0].split(" · ")[0].trim();
  const tokens = startPart.split(" ");
  if (tokens.length === 2 && MONTH_MAP[tokens[0]]) {
    return parseInt(tokens[1]) * 100 + MONTH_MAP[tokens[0]];
  }
  return parseInt(tokens[0]) * 100;
}

export function calculateActivityScore(updatedAt: string, stars: number): number {
  const now = new Date();
  const updated = new Date(updatedAt);
  const daysSinceUpdate = (now.getTime() - updated.getTime()) / (1000 * 60 * 60 * 24);
  const recencyScore = Math.exp(-daysSinceUpdate / 30);
  const significanceScore = Math.log1p(stars);
  return recencyScore * 10 + significanceScore;
}

export function loadGithubActivityMap(githubDataPath: string): Map<string, number> {
  const map = new Map<string, number>();
  if (!fs.existsSync(githubDataPath)) return map;
  const repos: { name: string; updatedAt: string; stars: number }[] =
    JSON.parse(fs.readFileSync(githubDataPath, "utf-8"));
  for (const repo of repos) {
    map.set(repo.name, calculateActivityScore(repo.updatedAt, repo.stars));
  }
  return map;
}

export function readYaml(filePath: string): any[] {
  if (!fs.existsSync(filePath)) return [];
  return jsYaml.load(fs.readFileSync(filePath, "utf-8")) || [];
}
