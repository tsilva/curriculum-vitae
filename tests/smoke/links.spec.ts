import { expect, test, type APIRequestContext } from "@playwright/test";
import { readFileSync } from "node:fs";
import path from "node:path";

type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

type LinkSourceMap = Map<string, Set<string>>;

const ROOT_DIR = path.resolve(__dirname, "../..");
const LINK_FIELD_NAMES = new Set(["url", "headingUrl", "homepageUrl"]);
const USER_AGENT =
  "Mozilla/5.0 (compatible; curriculum-vitae-link-check/1.0; +https://www.tsilva.eu)";
const HTML_HREF_PATTERN = /href=["']([^"']+)["']/g;
const CHECK_CONCURRENCY = 8;
const CHECK_TIMEOUT_MS = 15_000;
const CHECK_RETRIES = 1;
const INCONCLUSIVE_HTTP_STATUSES = new Set([401, 403, 429, 999]);
const KNOWN_BROKEN_HTTP_STATUSES = new Set([404, 410]);

function readJsonFile<T extends JsonValue>(relativePath: string): T {
  return JSON.parse(readFileSync(path.join(ROOT_DIR, relativePath), "utf8")) as T;
}

function normalizeHttpUrl(rawUrl: string): string | null {
  const decodedUrl = rawUrl.replaceAll("&amp;", "&");

  try {
    const url = new URL(decodedUrl);

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return null;
    }

    url.hash = "";
    return url.href;
  } catch {
    return null;
  }
}

function addLink(links: LinkSourceMap, rawUrl: string, source: string) {
  const url = normalizeHttpUrl(rawUrl);

  if (!url) {
    return;
  }

  const sources = links.get(url) ?? new Set<string>();
  sources.add(source);
  links.set(url, sources);
}

function collectHtmlHrefs(links: LinkSourceMap, html: string, source: string) {
  for (const match of html.matchAll(HTML_HREF_PATTERN)) {
    addLink(links, match[1], source);
  }
}

function collectDataLinks(links: LinkSourceMap, value: JsonValue, sourcePath: string) {
  if (typeof value === "string") {
    collectHtmlHrefs(links, value, sourcePath);
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) =>
      collectDataLinks(links, item, `${sourcePath}[${index}]`)
    );
    return;
  }

  if (!value || typeof value !== "object") {
    return;
  }

  for (const [key, child] of Object.entries(value)) {
    const childPath = `${sourcePath}.${key}`;

    if (LINK_FIELD_NAMES.has(key) && typeof child === "string") {
      addLink(links, child, childPath);
    }

    collectDataLinks(links, child, childPath);
  }
}

function collectWebsiteLinks() {
  const links: LinkSourceMap = new Map();
  const cvData = readJsonFile<JsonValue>("web/src/data/cv-data.json");
  const githubData = readJsonFile<JsonValue[]>("web/src/data/github-data.json").filter(
    (repo) =>
      repo &&
      typeof repo === "object" &&
      typeof repo.name === "string" &&
      !repo.name.startsWith("template-") &&
      !repo.name.startsWith("sandbox-")
  );

  collectDataLinks(links, cvData, "web/src/data/cv-data.json");
  collectDataLinks(links, githubData, "web/src/data/github-data.json");

  return links;
}

async function requestUrl(request: APIRequestContext, url: string) {
  for (let attempt = 0; attempt <= CHECK_RETRIES; attempt += 1) {
    let headError: unknown;

    try {
      const headResponse = await request.head(url, {
        headers: { "user-agent": USER_AGENT },
        maxRedirects: 10,
        timeout: CHECK_TIMEOUT_MS,
      });

      if (headResponse.status() === 200) {
        return headResponse;
      }
    } catch (error) {
      headError = error;
    }

    try {
      return await request.get(url, {
        headers: { "user-agent": USER_AGENT },
        maxRedirects: 10,
        timeout: CHECK_TIMEOUT_MS,
      });
    } catch (error) {
      if (attempt === CHECK_RETRIES) {
        const headMessage =
          headError instanceof Error
            ? headError.message
            : headError
              ? String(headError)
              : "HEAD failed";
        const getMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`${headMessage}; GET failed: ${getMessage}`);
      }
    }
  }

  throw new Error(`Unable to request ${url}`);
}

test("external website links are not known broken", async ({ request }) => {
  test.setTimeout(180_000);

  test.skip(
    process.env.CHECK_EXTERNAL_LINKS !== "1",
    "Set CHECK_EXTERNAL_LINKS=1 or run `pnpm run links` to check third-party links."
  );

  const links = collectWebsiteLinks();
  const inconclusive: string[] = [];
  const homepageResponse = await request.get("/");
  expect(homepageResponse.ok()).toBe(true);
  collectHtmlHrefs(links, await homepageResponse.text(), "homepage HTML");

  const failures: string[] = [];
  const urls = Array.from(links.keys()).sort();
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < urls.length) {
      const url = urls[nextIndex];
      nextIndex += 1;

      try {
        const response = await requestUrl(request, url);

        if (KNOWN_BROKEN_HTTP_STATUSES.has(response.status())) {
          failures.push(
            `${response.status()} ${url}\n  sources: ${Array.from(links.get(url) ?? []).join(", ")}`
          );
        } else if (!response.ok() && INCONCLUSIVE_HTTP_STATUSES.has(response.status())) {
          inconclusive.push(
            `${response.status()} ${url}\n  sources: ${Array.from(links.get(url) ?? []).join(", ")}`
          );
        } else if (!response.ok()) {
          inconclusive.push(
            `${response.status()} ${url}\n  sources: ${Array.from(links.get(url) ?? []).join(", ")}`
          );
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        const target = /ENOTFOUND|ERR_NAME_NOT_RESOLVED/i.test(message) ? failures : inconclusive;
        target.push(`${message} ${url}\n  sources: ${Array.from(links.get(url) ?? []).join(", ")}`);
      }
    }
  }

  await Promise.all(Array.from({ length: CHECK_CONCURRENCY }, worker));

  if (inconclusive.length > 0) {
    console.warn(`Inconclusive protected/transient links:\n${inconclusive.join("\n\n")}`);
  }

  expect(failures, `Broken links:\n${failures.join("\n\n")}`).toEqual([]);
});
