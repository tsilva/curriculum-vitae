import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

interface GitHubRepoRaw {
  name: string;
  description: string | null;
  primaryLanguage: { name: string } | null;
  createdAt: string;
  updatedAt: string;
  pushedAt: string;
  url: string;
  homepageUrl: string;
  stargazerCount: number;
  forkCount: number;
  isArchived: boolean;
  isFork: boolean;
  visibility: string;
}

interface GitHubRepo {
  id: string;
  name: string;
  description: string;
  stars: number;
  forks: number;
  language: string | null;
  updatedAt: string;
  createdAt: string;
  url: string;
  homepageUrl: string | null;
  commits: number;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");
const OUTPUT_PATH = path.join(ROOT, "web", "src", "data", "github-data.json");
const HOMEPAGE_OVERRIDES: Record<string, string | null> = {
  scummweb: "https://scummweb.tsilva.eu",
};

function fetchRepos(): GitHubRepoRaw[] {
  // gh follows GraphQL pages up to this safety bound. Refuse a possibly
  // truncated result rather than silently publishing an incomplete catalog.
  const cmd = `gh repo list tsilva --visibility public --limit 10000 --json name,description,primaryLanguage,createdAt,updatedAt,pushedAt,url,homepageUrl,stargazerCount,forkCount,isArchived,isFork,visibility`;
  
  try {
    const output = execSync(cmd, { encoding: "utf-8", cwd: ROOT, stdio: ["ignore", "pipe", "pipe"] });
    const repos = JSON.parse(output);
    if (!Array.isArray(repos) || repos.length >= 10000) {
      throw new Error("Repository pagination bound reached");
    }
    return repos;
  } catch {
    throw new Error("GitHub collection failed; existing data was not replaced");
  }
}

export function processRepos(repos: GitHubRepoRaw[]): GitHubRepo[] {
  const filteredRepos = repos.filter((repo) => {
    if (repo.visibility !== "PUBLIC") return false;
    if (repo.isFork) return false;
    if (repo.isArchived) return false;
    if (repo.name === "curriculum-vitae") return false;
    if (repo.name === "tsilva") return false;
    return true;
  });
  
  const processedRepos: GitHubRepo[] = filteredRepos.map((repo) => ({
    id: repo.name,
    name: repo.name,
    description: repo.description || "",
    stars: repo.stargazerCount,
    forks: repo.forkCount,
    language: repo.primaryLanguage?.name || null,
    updatedAt: repo.updatedAt,
    createdAt: repo.createdAt,
    url: repo.url,
    homepageUrl: repo.name in HOMEPAGE_OVERRIDES
      ? HOMEPAGE_OVERRIDES[repo.name]
      : repo.homepageUrl || null,
    commits: 0, // Not fetched to keep builds fast
  }));
  
  // Sort by most recent repository update, newest first.
  return processedRepos.sort((a, b) => {
    const diff = new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    return diff !== 0 ? diff : a.name.localeCompare(b.name);
  });
}

async function generateReposData() {
  console.log("Fetching GitHub repositories...");
  const rawRepos = fetchRepos();
  
  if (rawRepos.length === 0) {
    if (fs.existsSync(OUTPUT_PATH)) {
      console.log("No repositories fetched. Keeping existing github-data.json.");
      return;
    }

    console.log("No repositories fetched and no cached github-data.json exists. Writing an empty dataset.");
    fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
    fs.writeFileSync(OUTPUT_PATH, JSON.stringify([], null, 2));
    return;
  }
  
  const processedRepos = processRepos(rawRepos);
  
  const outputDir = path.dirname(OUTPUT_PATH);
  fs.mkdirSync(outputDir, { recursive: true });
  
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(processedRepos, null, 2));
  
  console.log(`Generated: github-data.json (${processedRepos.length} repos)`);
  
  const languages = new Map<string, number>();
  processedRepos.forEach((repo) => {
    if (repo.language) {
      languages.set(repo.language, (languages.get(repo.language) || 0) + 1);
    }
  });
  
  console.log("\nTop languages:");
  Array.from(languages.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .forEach(([lang, count]) => {
      console.log(`  ${lang}: ${count}`);
    });
  
  const totalStars = processedRepos.reduce((sum, repo) => sum + repo.stars, 0);
  console.log(`\nTotal stars: ${totalStars}`);
}

// Imports expose only the pure mapping. Hosted execution retains its gh flow.
const isMain = process.argv[1] && path.resolve(process.argv[1]) === __filename;
if (isMain) {
  if (process.platform === "linux" && process.env.CV_GITHUB_TRANSPORT !== "agent-vault-public" &&
      (process.env.GITHUB_ACTIONS === "true" || process.env.VERCEL === "1")) {
    generateReposData().catch((error) => {
      console.error(error.message);
      process.exitCode = 1;
    });
  } else {
    console.error("Use the reviewed local GitHub Vault launcher; no cached-token fallback.");
    process.exitCode = 1;
  }
}
