import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";

const GENERATED_FILES = new Set(["CV.md", "web/src/data/cv-data.json", "web/src/data/github-data.json"]);
const REQUIRED_CHECKS = ["Verify", "Dependency review", "Scan committed secrets"];

export function syncState(pr, sha) {
  if (pr.headRefOid !== sha || pr.baseRefName !== "main" ||
      pr.headRefName !== "codex/automated-cv-sync" || pr.state !== "OPEN" || pr.isCrossRepository ||
      !pr.files?.length || pr.files.some(file => !GENERATED_FILES.has(file.path))) {
    throw new Error("Sync PR identity, revision or generated-file scope changed");
  }
  const checks = pr.statusCheckRollup ?? [];
  const failed = checks.some(check => check.__typename === "StatusContext"
    ? ["ERROR", "FAILURE"].includes(check.state)
    : check.status === "COMPLETED" && !["SUCCESS", "NEUTRAL", "SKIPPED"].includes(check.conclusion));
  if (failed) throw new Error("A sync PR check failed; merge was not requested");
  return REQUIRED_CHECKS.every(name => checks.some(check => check.name === name &&
    check.status === "COMPLETED" && check.conclusion === "SUCCESS")) ? "ready" : "pending";
}

async function main() {
  const [number, sha] = process.argv.slice(2);
  if (process.argv.length !== 4 || !/^[1-9][0-9]*$/.test(number ?? "") ||
      !/^[a-f0-9]{40}$/.test(sha ?? "") || process.env.GITHUB_REPOSITORY !== "tsilva/curriculum-vitae") {
    throw new Error("Expected the fixed repository, PR number and immutable sync SHA");
  }
  const fields = "headRefOid,baseRefName,headRefName,state,isCrossRepository,files,statusCheckRollup";
  const gh = args => execFileSync("gh", args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  for (let attempt = 0; attempt < 40; attempt++) {
    const pr = JSON.parse(gh(["pr", "view", number, "--repo", process.env.GITHUB_REPOSITORY, "--json", fields]));
    if (syncState(pr, sha) === "ready") {
      // No admin bypass. GitHub still enforces its current repository rules.
      gh(["pr", "merge", number, "--repo", process.env.GITHUB_REPOSITORY,
        "--auto", "--squash", "--match-head-commit", sha]);
      console.log("Requested merge of the verified generated-data revision.");
      return;
    }
    await new Promise(resolve => setTimeout(resolve, 30000));
  }
  throw new Error("Timed out waiting for CI, dependency review and secret scanning; PR remains open");
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(() => {
    console.error("CV sync merge failed or checks did not pass; inspect the PR and workflow status.");
    process.exitCode = 1;
  });
}
