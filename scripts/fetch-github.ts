import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";

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
}

const ROOT = path.resolve(__dirname, "..");
const OUTPUT_PATH = path.join(ROOT, "web", "src", "data", "github-data.json");

function fetchRepos(): GitHubRepoRaw[] {
  const cmd = `gh repo list tsilva --limit 100 --json name,description,primaryLanguage,createdAt,updatedAt,pushedAt,url,stargazerCount,forkCount,isArchived,isFork`;
  
  try {
    const output = execSync(cmd, { encoding: "utf-8", cwd: ROOT });
    return JSON.parse(output);
  } catch (error) {
    console.error("Failed to fetch GitHub repos:", error);
    return [];
  }
}

function processRepos(repos: GitHubRepoRaw[]): GitHubRepo[] {
  return repos
    .filter((repo) => {
      // Exclude forks and archived repos
      if (repo.isFork) return false;
      if (repo.isArchived) return false;
      // Exclude the curriculum-vitae repo itself (it's the website, not a project)
      if (repo.name === "curriculum-vitae") return false;
      // Exclude profile README repo
      if (repo.name === "tsilva") return false;
      return true;
    })
    .map((repo) => ({
      id: repo.name,
      name: repo.name,
      description: repo.description || "",
      stars: repo.stargazerCount,
      forks: repo.forkCount,
      language: repo.primaryLanguage?.name || null,
      updatedAt: repo.pushedAt,
      createdAt: repo.createdAt,
      url: repo.url,
    }))
    .sort((a, b) => {
      // Sort by stars (desc), then by updated date (desc)
      if (b.stars !== a.stars) return b.stars - a.stars;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
}

function generateReposData() {
  console.log("Fetching GitHub repositories...");
  const rawRepos = fetchRepos();
  
  if (rawRepos.length === 0) {
    console.log("No repositories fetched. Skipping GitHub data generation.");
    return;
  }
  
  const processedRepos = processRepos(rawRepos);
  
  // Ensure output directory exists
  const outputDir = path.dirname(OUTPUT_PATH);
  fs.mkdirSync(outputDir, { recursive: true });
  
  // Write data file
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(processedRepos, null, 2));
  
  console.log(`Generated: github-data.json (${processedRepos.length} repos)`);
  
  // Print summary
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
