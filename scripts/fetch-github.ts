import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";
import { calculateActivityScore } from "./lib/data-utils";

interface GitHubRepoRaw {
  name: string;
  description: string | null;
  primaryLanguage: { name: string } | null;
  createdAt: string;
  updatedAt: string;
  pushedAt: string;
  url: string;
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
  commits: number;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");
const OUTPUT_PATH = path.join(ROOT, "web", "src", "data", "github-data.json");

function fetchRepos(): GitHubRepoRaw[] {
  const cmd = `gh repo list tsilva --visibility public --limit 100 --json name,description,primaryLanguage,createdAt,updatedAt,pushedAt,url,stargazerCount,forkCount,isArchived,isFork,visibility`;
  
  try {
    const output = execSync(cmd, { encoding: "utf-8", cwd: ROOT });
    return JSON.parse(output);
  } catch (error) {
    console.error("Failed to fetch GitHub repos:", error);
    return [];
  }
}

function processRepos(repos: GitHubRepoRaw[]): GitHubRepo[] {
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
    updatedAt: repo.pushedAt,
    createdAt: repo.createdAt,
    url: repo.url,
    commits: 0, // Not fetched to keep builds fast
  }));
  
  // Sort by activity score: primarily recency, with stars as tiebreaker/significance boost
  return processedRepos.sort((a, b) => {
    const scoreA = calculateActivityScore(a.updatedAt, a.stars);
    const scoreB = calculateActivityScore(b.updatedAt, b.stars);
    return scoreB - scoreA;
  });
}

async function generateReposData() {
  console.log("Fetching GitHub repositories...");
  const rawRepos = fetchRepos();
  
  if (rawRepos.length === 0) {
    console.log("No repositories fetched. Skipping GitHub data generation.");
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

generateReposData();
