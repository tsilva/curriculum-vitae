#!/usr/bin/env node

import { readFileSync } from "node:fs";

const dependencyFields = [
  "dependencies",
  "devDependencies",
  "optionalDependencies",
  "peerDependencies",
];
const forbiddenSpec = /^(?:file|git|git\+[^:]+|https?|link|workspace):/i;
const failures = [];

for (const path of ["package.json", "web/package.json"]) {
  const manifest = JSON.parse(readFileSync(path, "utf8"));

  for (const field of dependencyFields) {
    for (const [name, specifier] of Object.entries(manifest[field] ?? {})) {
      if (typeof specifier === "string" && forbiddenSpec.test(specifier)) {
        failures.push(`${path}: ${field}.${name} uses forbidden source ${specifier}`);
      }
    }
  }
}

const npmLock = JSON.parse(readFileSync("web/package-lock.json", "utf8"));

for (const [path, entry] of Object.entries(npmLock.packages ?? {})) {
  if (!entry.resolved) continue;

  if (!entry.resolved.startsWith("https://registry.npmjs.org/")) {
    failures.push(`web/package-lock.json: ${path} resolves outside the npm registry`);
  }
}

const pnpmLock = readFileSync("pnpm-lock.yaml", "utf8");

for (const pattern of [/\b(?:file|git|git\+[^:]+|https?|link|workspace):/gi, /^\s*tarball:/gim]) {
  if (pattern.test(pnpmLock)) {
    failures.push(`pnpm-lock.yaml contains a forbidden non-registry source (${pattern})`);
  }
}

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("Dependency manifests and locks use registry-only sources.");
