import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { pathToFileURL } from "node:url";

export function selectRoute(platform, env, arguments_) {
  const check = arguments_.length === 1 && arguments_[0] === "--check";
  if (arguments_.length && !check) throw new Error("GitHub collection does not accept scope overrides");
  if (platform === "linux" && (env.GITHUB_ACTIONS === "true" || env.VERCEL === "1")) {
    if (check) throw new Error("The hosted collector has no local Vault check mode");
    return { command: "tsx", args: ["../scripts/fetch-github.ts"], hosted: true };
  }
  if (platform !== "darwin") throw new Error("No reviewed local GitHub sandbox for this platform");
  return {
    command: "/usr/bin/python3",
    args: ["-I", "-S", "-B", fileURLToPath(new URL("./infisical/github_vault.py", import.meta.url)), check ? "check" : "collect"],
    hosted: false,
  };
}

export function childEnvironment(route, env) {
  return route.hosted ? env : { HOME: env.HOME, PATH: "/usr/bin:/bin" };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const route = selectRoute(process.platform, process.env, process.argv.slice(2));
    const env = childEnvironment(route, process.env);
    const child = spawn(route.command, route.args, { env, stdio: "inherit" });
    child.once("error", () => { console.error("GitHub collection launcher unavailable; no fallback."); process.exitCode = 1; });
    child.once("exit", code => { process.exitCode = code ?? 1; });
  } catch {
    console.error("GitHub collection requires its reviewed launcher; no scope or credential fallback.");
    process.exitCode = 1;
  }
}
