import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

type Options = {
  days: number;
  limit: number;
  query?: string;
  status: "all" | "resolved" | "unresolved";
};

type Issue = {
  count?: string;
  culprit?: string;
  lastSeen?: string;
  level?: string;
  permalink?: string;
  shortId?: string;
  title?: string;
};

type Project = {
  id?: string;
};

const DEFAULT_BASE_URL = "https://sentry.io";
const DEFAULT_ORG = "tsilva";
const DEFAULT_PROJECT = "curriculum-vitae";
const DEFAULT_OPTIONS: Options = {
  days: 7,
  limit: 20,
  status: "unresolved",
};

function printHelp() {
  console.log(`Usage: pnpm sentry:issues [options]

List recent Sentry issues using credentials from .env, .env.sentry-mcp, or the shell.

Options:
  --days <n>        Look back n days (default: 7)
  --limit <n>       Maximum issues to return (default: 20)
  --status <value>  all | resolved | unresolved (default: unresolved)
  --query <text>    Extra Sentry search query to append
  --help            Show this message

Environment:
  SENTRY_AUTH_TOKEN
  SENTRY_ORG        Optional, defaults to ${DEFAULT_ORG}
  SENTRY_PROJECT    Optional, defaults to ${DEFAULT_PROJECT}
  SENTRY_BASE_URL   Optional, defaults to https://sentry.io
`);
}

function loadOptionalEnvFile(filePath: string) {
  if (!existsSync(filePath)) {
    return false;
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

  return true;
}

function parseArgs(argv: string[]): Options | null {
  const options = { ...DEFAULT_OPTIONS };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--help" || arg === "-h") {
      printHelp();
      return null;
    }

    if (arg === "--days") {
      const value = Number(argv[index + 1]);
      if (!Number.isFinite(value) || value <= 0) {
        throw new Error("--days must be a positive number");
      }
      options.days = value;
      index += 1;
      continue;
    }

    if (arg === "--limit") {
      const value = Number(argv[index + 1]);
      if (!Number.isFinite(value) || value <= 0) {
        throw new Error("--limit must be a positive number");
      }
      options.limit = value;
      index += 1;
      continue;
    }

    if (arg === "--query") {
      const value = argv[index + 1];
      if (!value) {
        throw new Error("--query requires a value");
      }
      options.query = value;
      index += 1;
      continue;
    }

    if (arg === "--status") {
      const value = argv[index + 1] as Options["status"] | undefined;
      if (!value || !["all", "resolved", "unresolved"].includes(value)) {
        throw new Error("--status must be one of: all, resolved, unresolved");
      }
      options.status = value;
      index += 1;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  return options;
}

function getRequiredEnv(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(
      `Missing ${name}. Set it in the shell, .env, or .env.sentry-mcp and try again.`,
    );
  }

  return value;
}

function getEnvWithDefault(name: string, fallback: string): string {
  return process.env[name]?.trim() || fallback;
}

function normalizeBaseUrl(value: string): string {
  const trimmed = value.trim().replace(/\/$/, "");

  if (trimmed.endsWith("/api/0")) {
    return trimmed;
  }

  return `${trimmed}/api/0`;
}

async function fetchSentryJson<T>(url: URL | string, token: string): Promise<T> {
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    const body = await response.text();
    let details = body;

    try {
      const parsed = JSON.parse(body) as { detail?: string };
      details = parsed.detail ?? body;
    } catch {
      // Keep the raw response body when it is not JSON.
    }

    throw new Error(
      `Sentry API request failed (${response.status} ${response.statusText}): ${details}`,
    );
  }

  return (await response.json()) as T;
}

async function fetchProjectId(
  baseUrl: string,
  token: string,
  org: string,
  project: string,
): Promise<string> {
  const projectUrl = new URL(`${baseUrl}/projects/${org}/${project}/`);
  const projectResponse = await fetchSentryJson<Project>(projectUrl, token);
  const projectId = projectResponse.id?.trim();

  if (!projectId) {
    throw new Error(`Could not resolve a numeric project id for ${org}/${project}.`);
  }

  return projectId;
}

async function main() {
  const envFiles = [
    resolve(process.cwd(), ".env"),
    resolve(process.cwd(), "..", ".env"),
    resolve(process.cwd(), ".env.sentry-mcp"),
    resolve(process.cwd(), "..", ".env.sentry-mcp"),
  ];

  for (const envFile of envFiles) {
    loadOptionalEnvFile(envFile);
  }

  const options = parseArgs(process.argv.slice(2));
  if (!options) {
    return;
  }

  const token = getRequiredEnv("SENTRY_AUTH_TOKEN");
  const org = getEnvWithDefault("SENTRY_ORG", DEFAULT_ORG);
  const project = getEnvWithDefault("SENTRY_PROJECT", DEFAULT_PROJECT);
  const baseUrl = normalizeBaseUrl(process.env.SENTRY_BASE_URL?.trim() || DEFAULT_BASE_URL);
  const projectId = await fetchProjectId(baseUrl, token, org, project);

  const queryParts = [
    options.status === "all" ? undefined : `is:${options.status}`,
    `firstSeen:-${options.days}d`,
    options.query,
  ].filter(Boolean);

  const url = new URL(`${baseUrl}/organizations/${org}/issues/`);
  url.searchParams.set("limit", String(options.limit));
  url.searchParams.set("sort", "freq");
  url.searchParams.set("project", projectId);
  url.searchParams.set("query", queryParts.join(" "));
  const issues = await fetchSentryJson<Issue[]>(url, token);

  if (issues.length === 0) {
    console.log(`No issues found for ${org}/${project} in the last ${options.days} day(s).`);
    return;
  }

  console.log(
    `Found ${issues.length} issue(s) for ${org}/${project} in the last ${options.days} day(s):`,
  );

  for (const issue of issues) {
    const parts = [
      issue.shortId ?? "unknown",
      issue.level ?? "unknown",
      issue.count ? `${issue.count} events` : undefined,
      issue.lastSeen ? `last seen ${issue.lastSeen}` : undefined,
    ].filter(Boolean);

    console.log(`- ${parts.join(" | ")}`);
    console.log(`  ${issue.title ?? "Untitled issue"}`);

    if (issue.culprit) {
      console.log(`  ${issue.culprit}`);
    }

    if (issue.permalink) {
      console.log(`  ${issue.permalink}`);
    }
  }
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Error: ${message}`);
  process.exitCode = 1;
});
