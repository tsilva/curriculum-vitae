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

interface DurationPoint {
  year: number;
  month: number;
}

function parseDurationPoint(value: string, referenceDate: Date): DurationPoint | undefined {
  const part = value.trim();

  if (/^present$/i.test(part)) {
    return {
      year: referenceDate.getFullYear(),
      month: referenceDate.getMonth() + 1,
    };
  }

  const tokens = part.split(" ");
  if (tokens.length === 2 && MONTH_MAP[tokens[0]]) {
    return {
      year: parseInt(tokens[1], 10),
      month: MONTH_MAP[tokens[0]],
    };
  }

  const year = parseInt(tokens[0], 10);
  if (Number.isNaN(year)) return undefined;

  return { year, month: 1 };
}

function hasMonthPrecision(value: string): boolean {
  const [firstToken] = value.trim().split(" ");
  return /^present$/i.test(firstToken) || Boolean(MONTH_MAP[firstToken]);
}

function formatYearMonthDuration(totalMonths: number): string {
  if (totalMonths < 12) return "1 year";

  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  const yearPart = `${years} year${years === 1 ? "" : "s"}`;
  const monthPart = months > 0 ? `${months} month${months === 1 ? "" : "s"}` : "";

  return monthPart ? `${yearPart} and ${monthPart}` : yearPart;
}

export function formatDurationLength(
  duration: string,
  referenceDate = new Date()
): string | undefined {
  const existingLength = duration.split(" · ")[1]?.trim();
  if (existingLength) return existingLength;

  const [startRaw, endRaw] = duration.split(" - ");
  if (!startRaw || !endRaw) return undefined;

  const start = parseDurationPoint(startRaw, referenceDate);
  const end = parseDurationPoint(endRaw, referenceDate);
  if (!start || !end) return undefined;

  const inclusiveMonth = hasMonthPrecision(startRaw) && hasMonthPrecision(endRaw) ? 1 : 0;
  const totalMonths = (end.year - start.year) * 12 + (end.month - start.month) + inclusiveMonth;
  return formatYearMonthDuration(Math.max(0, totalMonths));
}

export function formatDurationWithLength(duration: string, referenceDate = new Date()): string {
  if (duration.includes(" · ")) return duration;

  const length = formatDurationLength(duration, referenceDate);
  return length ? `${duration} · ${length}` : duration;
}

export function loadGithubUpdatedAtMap(githubDataPath: string): Map<string, number> {
  const map = new Map<string, number>();
  if (!fs.existsSync(githubDataPath)) return map;
  const repos: { name: string; updatedAt: string }[] =
    JSON.parse(fs.readFileSync(githubDataPath, "utf-8"));
  for (const repo of repos) {
    map.set(repo.name, new Date(repo.updatedAt).getTime());
  }
  return map;
}

export function readYaml(filePath: string): any[] {
  if (!fs.existsSync(filePath)) return [];
  return jsYaml.load(fs.readFileSync(filePath, "utf-8")) || [];
}
