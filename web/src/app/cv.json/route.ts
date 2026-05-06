import fs from "node:fs";
import path from "node:path";

export const dynamic = "force-static";

const CV_DATA_PATH = path.resolve(process.cwd(), "src", "data", "cv-data.json");
const GITHUB_DATA_PATH = path.resolve(process.cwd(), "src", "data", "github-data.json");

interface GitHubRepo {
  name: string;
  homepageUrl?: string | null;
}

export function GET() {
  const cvData = JSON.parse(fs.readFileSync(CV_DATA_PATH, "utf-8")) as Record<string, unknown>;
  const githubRepos = JSON.parse(fs.readFileSync(GITHUB_DATA_PATH, "utf-8")) as GitHubRepo[];
  const publicGithubRepos = githubRepos.filter(
    (repo) => !repo.name.startsWith("template-") && !repo.name.startsWith("sandbox-"),
  );
  const relatedSites = publicGithubRepos.filter(
    (repo) =>
      repo.homepageUrl &&
      repo.homepageUrl.endsWith(".tsilva.eu") &&
      repo.homepageUrl !== "https://www.tsilva.eu",
  );

  const payload = {
    ...cvData,
    open_source: publicGithubRepos,
    related_sites: relatedSites,
  };

  return new Response(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
