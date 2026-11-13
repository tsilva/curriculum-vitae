import assert from "node:assert/strict";
import { test } from "node:test";
import { spawnSync } from "node:child_process";
import { readFileSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { processRepos } from "./fetch-github.ts";
import { installSession, normalizePublicRepositories, run, QUERY, MAX_PAGES } from "./github-public.mjs";

const rows = JSON.parse(readFileSync(new URL("./fixtures/github_public_data.json", import.meta.url)));
const env = { CV_GITHUB_TRANSPORT: "agent-vault-public", CV_GITHUB_API_BASE: "https://api.github.com",
  HTTP_PROXY: "http://agent:synthetic-cap@127.0.0.1:8283", HTTPS_PROXY: "http://agent:synthetic-cap@127.0.0.1:8283",
  NODE_USE_ENV_PROXY: "1", NO_PROXY: "", no_proxy: "" };

test("REST mapping preserves the original output fields, filters and ordering", () => {
  const result = processRepos(normalizePublicRepositories(rows));
  assert.deepEqual(result, [
    { id: "scummweb", name: "scummweb", description: "Synthetic public project", stars: 3, forks: 0,
      language: "JavaScript", updatedAt: "2026-03-01T00:00:00Z", createdAt: "2024-01-01T00:00:00Z",
      url: "https://github.com/tsilva/scummweb", homepageUrl: "https://scummweb.tsilva.eu", commits: 0 },
    { id: "alpha", name: "alpha", description: "", stars: 2, forks: 1, language: null,
      updatedAt: "2026-01-01T00:00:00Z", createdAt: "2024-01-01T00:00:00Z",
      url: "https://github.com/tsilva/alpha", homepageUrl: null, commits: 0 },
  ]);
  assert.equal(QUERY.sort, "pushed");
  assert.equal(QUERY.per_page, "100");
});

test("private, unrelated or malformed repository data fails closed", () => {
  for (const patch of [{ private: true }, { owner: { login: "other" } }, { stargazers_count: -1 }, { html_url: "https://example.invalid" }]) {
    assert.throws(() => normalizePublicRepositories([{ ...rows[0], ...patch }]));
  }
  assert.throws(() => normalizePublicRepositories(Array(101).fill(rows[0])));
});

test("actual hosted collector keeps its gh command and generated schema without a real call or write", () => {
  const script = fileURLToPath(new URL("./fetch-github.ts", import.meta.url));
  const code = `
    import fs from 'node:fs'; import cp from 'node:child_process';
    import {syncBuiltinESMExports} from 'node:module'; import {pathToFileURL} from 'node:url';
    import assert from 'node:assert/strict';
    const input=JSON.parse(process.argv[1]);const script=process.argv[2];let output=null,calls=0;
    cp.execSync=(command,options)=>{
      assert.equal(command,'gh repo list tsilva --visibility public --limit 10000 --json name,description,primaryLanguage,createdAt,updatedAt,pushedAt,url,homepageUrl,stargazerCount,forkCount,isArchived,isFork,visibility');
      assert.equal(process.env.GH_TOKEN,'synthetic-hosted-token');calls++;return JSON.stringify(input);
    };
    fs.mkdirSync=()=>{};
    fs.writeFileSync=(file,data)=>{assert.ok(String(file).endsWith('/web/src/data/github-data.json'));output=JSON.parse(data);};
    syncBuiltinESMExports();Object.defineProperty(process,'platform',{value:'linux'});
    process.argv[1]=script;await import(pathToFileURL(script).href);
    console.log('HOSTED_RESULT='+JSON.stringify({calls,output}));
  `;
  const q = spawnSync(process.execPath, ["--input-type=module", "-e", code,
    JSON.stringify(normalizePublicRepositories(rows)), script], {
    env: { HOME: process.env.HOME, PATH: process.env.PATH, GITHUB_ACTIONS: "true", GH_TOKEN: "synthetic-hosted-token" },
    encoding: "utf8",
  });
  assert.equal(q.status, 0);
  const result = JSON.parse(q.stdout.split("HOSTED_RESULT=")[1]);
  assert.equal(result.calls, 1);
  assert.deepEqual(result.output, processRepos(normalizePublicRepositories(rows)));
});

test("client sends one exact public query without auth and blocks alternative requests", async () => {
  const original = globalThis.fetch; const calls = [];
  try {
    globalThis.fetch = async (url, init) => { calls.push({ url: new URL(url), init }); return Response.json(rows); };
    installSession(env.CV_GITHUB_API_BASE, env);
    assert.deepEqual(await run("check", env), { ok: true, read_only: true, credential_mode: "none",
      source: "public-github-rest", fetched: 6, selected: 2, output: "not-written" });
    assert.equal(calls.length, 1);
    assert.deepEqual(Object.fromEntries(calls[0].url.searchParams), QUERY);
    assert.equal(calls[0].init.headers.has("Authorization"), false);
    await assert.rejects(fetch(calls[0].url, { method: "POST" }));
    await assert.rejects(fetch("https://api.github.com/user"));
    await assert.rejects(fetch(calls[0].url, { headers: { Authorization: "Bearer synthetic" } }));
    const duplicate = new URL(calls[0].url); duplicate.searchParams.append("page", "2");
    await assert.rejects(fetch(duplicate));
    for (const page of ["0", "01", String(MAX_PAGES + 1), "1.5", "NaN"]) {
      const invalid = new URL(calls[0].url); invalid.searchParams.set("page", page);
      await assert.rejects(fetch(invalid));
    }
    assert.equal(calls.length, 1);
  } finally { globalThis.fetch = original; }
});

function fullPage(page) {
  return Array.from({ length: 100 }, (_, index) => ({ ...rows[0],
    name: `page-${page}-${index}`, html_url: `https://github.com/tsilva/page-${page}-${index}`,
  }));
}

test("pagination collects repositories beyond the first hundred through the guarded session", async () => {
  const original = globalThis.fetch; const pages = [];
  try {
    globalThis.fetch = async url => {
      const page = Number(new URL(url).searchParams.get("page")); pages.push(page);
      return Response.json(page === 1 ? fullPage(page) : rows);
    };
    installSession(env.CV_GITHUB_API_BASE, env);
    const result = await run("check", env);
    assert.deepEqual(pages, [1, 2]);
    assert.equal(result.fetched, 106);
    assert.equal(result.selected, 102);
  } finally { globalThis.fetch = original; }
});

test("later-page failures, duplicate pages and pagination exhaustion retain the existing output", async () => {
  const directory = mkdtempSync(path.join(tmpdir(), "cv-github-pages-"));
  const target = path.join(directory, "github-data.json"); const original = globalThis.fetch;
  try {
    const childEnv = { ...env, CV_GITHUB_OUTPUT: target };
    globalThis.fetch = async () => Response.json(rows); installSession(env.CV_GITHUB_API_BASE, childEnv);
    await run("collect", childEnv);
    const saved = readFileSync(target, "utf8");
    for (const scenario of ["rejected", "duplicate", "exhausted"]) {
      globalThis.fetch = async url => {
        const page = Number(new URL(url).searchParams.get("page"));
        if (page === 2 && scenario === "rejected") return new Response("synthetic-private-body", { status: 403 });
        return Response.json(fullPage(scenario === "duplicate" ? 1 : page));
      };
      installSession(env.CV_GITHUB_API_BASE, childEnv);
      await assert.rejects(run("collect", childEnv));
      assert.equal(readFileSync(target, "utf8"), saved);
    }
  } finally { globalThis.fetch = original; rmSync(directory, { recursive: true }); }
});

test("raw credentials and bypass settings are rejected before requests", () => {
  for (const override of [{ GH_TOKEN: "synthetic" }, { NODE_OPTIONS: "synthetic" }, { NO_PROXY: "*" }, { NODE_TLS_REJECT_UNAUTHORIZED: "0" }]) {
    assert.throws(() => installSession(env.CV_GITHUB_API_BASE, { ...env, ...override }));
  }
});

test("collection writes the existing schema, retains empty-result data and hides failed bodies", async () => {
  const directory = mkdtempSync(path.join(tmpdir(), "cv-github-public-"));
  const target = path.join(directory, "github-data.json"); const original = globalThis.fetch;
  try {
    const childEnv = { ...env, CV_GITHUB_OUTPUT: target };
    globalThis.fetch = async () => Response.json(rows); installSession(env.CV_GITHUB_API_BASE, childEnv);
    assert.equal((await run("collect", childEnv)).output, "updated");
    const saved = readFileSync(target, "utf8");
    assert.deepEqual(JSON.parse(saved), processRepos(normalizePublicRepositories(rows)));
    globalThis.fetch = async () => Response.json([]); installSession(env.CV_GITHUB_API_BASE, childEnv);
    assert.equal((await run("collect", childEnv)).output, "kept-existing-empty-response");
    assert.equal(readFileSync(target, "utf8"), saved);
    globalThis.fetch = async () => new Response("synthetic-reflected-credential", { status: 403 });
    installSession(env.CV_GITHUB_API_BASE, childEnv);
    await assert.rejects(run("collect", childEnv), error => error.httpStatus === 403 && !error.message.includes("synthetic-reflected"));
    assert.equal(readFileSync(target, "utf8"), saved);
  } finally { globalThis.fetch = original; rmSync(directory, { recursive: true }); }
});
