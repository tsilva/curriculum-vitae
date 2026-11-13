import { existsSync, lstatSync, writeFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { processRepos } from "./fetch-github.ts";

export const REPOSITORIES_PATH = "/users/tsilva/repos";
export const QUERY = { type: "owner", sort: "pushed", direction: "desc", per_page: "100", page: "1" };
export const MAX_PAGES = 100;
const PRIVATE_ENV = ["GITHUB_TOKEN", "GH_TOKEN", "GITHUB_ENTERPRISE_TOKEN", "GH_ENTERPRISE_TOKEN", "GH_CONFIG_DIR", "GIT_ASKPASS", "NODE_OPTIONS", "NODE_PATH", "INFISICAL_TOKEN", "INFISICAL_CLIENT_SECRET"];

export function installSession(base, env = process.env) {
  const origin = new URL(base);
  const proxy = new URL(env.HTTP_PROXY);
  if (env.CV_GITHUB_TRANSPORT !== "agent-vault-public" || env.CV_GITHUB_API_BASE !== base ||
      origin.username || origin.password || origin.search || origin.hash || origin.pathname !== "/" ||
      !["http:", "https:"].includes(origin.protocol) ||
      proxy.href !== new URL(env.HTTPS_PROXY).href || proxy.protocol !== "http:" ||
      proxy.host !== "127.0.0.1:8283" || !proxy.password ||
      env.NO_PROXY || env.no_proxy || env.NODE_USE_ENV_PROXY !== "1" ||
      env.NODE_TLS_REJECT_UNAUTHORIZED === "0" || PRIVATE_ENV.some(name => env[name]) ||
      ["http_proxy", "https_proxy"].some(name => env[name] && new URL(env[name]).href !== proxy.href)) {
    throw new Error("Expected the reviewed credential-free GitHub Vault session");
  }
  const original = globalThis.fetch;
  globalThis.fetch = async (input, init) => {
    const url = new URL(typeof input === "string" || input instanceof URL ? input : input.url);
    const headers = new Headers(init?.headers ?? input.headers);
    if (url.origin !== origin.origin || url.username || url.password || url.hash ||
        url.pathname !== REPOSITORIES_PATH || (init?.method ?? input.method ?? "GET") !== "GET" ||
        headers.has("authorization") || headers.has("cookie") || headers.has("proxy-authorization") ||
        [...url.searchParams.keys()].length !== Object.keys(QUERY).length ||
        Object.entries(QUERY).some(([key, value]) => url.searchParams.getAll(key).length !== 1 ||
          (key === "page" ? !/^[1-9][0-9]*$/.test(url.searchParams.get(key) ?? "") ||
            Number(url.searchParams.get(key)) > MAX_PAGES : url.searchParams.get(key) !== value))) {
      throw new Error("Request outside the reviewed public GitHub query");
    }
    let response;
    try {
      response = await original(url, { ...init, headers, method: "GET", redirect: "error", signal: AbortSignal.timeout(20000) });
    } catch {
      throw new Error("GitHub transport failed; diagnostics withheld");
    }
    if (!response.ok) {
      await response.body?.cancel();
      const error = new Error("GitHub request rejected; provider body withheld");
      error.httpStatus = response.status;
      throw error;
    }
    return response;
  };
}

export function normalizePublicRepositories(rows) {
  if (!Array.isArray(rows) || rows.length > 100) throw new Error("Unexpected public repository response");
  return rows.map(row => {
    if (row.private !== false || row.owner?.login?.toLowerCase() !== "tsilva" ||
        typeof row.name !== "string" || !/^[a-zA-Z0-9_.-]{1,100}$/.test(row.name) ||
        row.html_url !== `https://github.com/tsilva/${row.name}` ||
        typeof row.fork !== "boolean" || typeof row.archived !== "boolean" ||
        !Number.isSafeInteger(row.stargazers_count) || row.stargazers_count < 0 ||
        !Number.isSafeInteger(row.forks_count) || row.forks_count < 0 ||
        (row.description !== null && typeof row.description !== "string") ||
        (row.language !== null && typeof row.language !== "string") ||
        (row.homepage !== null && typeof row.homepage !== "string") ||
        !Number.isFinite(Date.parse(row.created_at)) || !Number.isFinite(Date.parse(row.updated_at))) {
      throw new Error("Public repository identity or schema mismatch");
    }
    return {
      name: row.name, description: row.description,
      primaryLanguage: row.language === null ? null : { name: row.language },
      createdAt: row.created_at, updatedAt: row.updated_at, pushedAt: row.pushed_at,
      url: row.html_url, homepageUrl: row.homepage,
      stargazerCount: row.stargazers_count, forkCount: row.forks_count,
      isArchived: row.archived, isFork: row.fork, visibility: "PUBLIC",
    };
  });
}

export async function run(mode, env = process.env) {
  if (!["check", "collect"].includes(mode)) throw new Error("Use check or collect");
  const url = new URL(REPOSITORIES_PATH, env.CV_GITHUB_API_BASE);
  for (const [key, value] of Object.entries(QUERY)) url.searchParams.set(key, value);
  const raw = [];
  const names = new Set();
  for (let page = 1; page <= MAX_PAGES; page++) {
    url.searchParams.set("page", String(page));
    const response = await fetch(url, { headers: { Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2026-03-10" } });
    const batch = normalizePublicRepositories(await response.json());
    for (const repo of batch) {
      const name = repo.name.toLowerCase();
      if (names.has(name)) throw new Error("Repository pages changed during collection; retry the full refresh");
      names.add(name);
      raw.push(repo);
    }
    if (batch.length < Number(QUERY.per_page)) break;
    if (page === MAX_PAGES) throw new Error("Repository pagination bound reached; existing data retained");
  }
  const repos = processRepos(raw);
  let output = "not-written";
  if (mode === "collect") {
    const target = env.CV_GITHUB_OUTPUT;
    if (!target || (existsSync(target) && !lstatSync(target).isFile())) throw new Error("Generated output must be a regular file");
    if (raw.length === 0 && existsSync(target)) {
      output = "kept-existing-empty-response";
    } else {
      writeFileSync(target, JSON.stringify(repos, null, 2), { mode: 0o600 });
      output = "updated";
    }
  }
  return { ok: true, read_only: mode === "check", credential_mode: "none", source: "public-github-rest",
    fetched: raw.length, selected: repos.length, output };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    if (process.argv.length !== 3) throw new Error("No scope overrides");
    process.env.CV_GITHUB_API_BASE ??= "https://api.github.com";
    process.env.CV_GITHUB_OUTPUT ??= fileURLToPath(new URL("../web/src/data/github-data.json", import.meta.url));
    if (process.env.CV_GITHUB_TRANSPORT === "agent-vault-public") installSession(process.env.CV_GITHUB_API_BASE);
    else if (process.env.CV_GITHUB_TRANSPORT || PRIVATE_ENV.some(name => process.env[name])) throw new Error("Public collection accepts no credentials or transport override");
    const result = await run(process.argv[2]);
    console.log(JSON.stringify(process.argv[2] === "check"
      ? {ok:true, read_only:true, credential_mode:"none", item_count:result.fetched} : result));
  } catch (error) {
    console.log(JSON.stringify({ ok: false, http_status: error.httpStatus ?? null,
      reason: "Public GitHub collection failed; no credential or cached-token fallback" }));
    process.exitCode = 1;
  }
}
