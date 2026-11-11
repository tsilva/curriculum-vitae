import assert from "node:assert/strict";
import { test } from "node:test";
import { syncState } from "./merge-cv-sync.mjs";

const sha = "a".repeat(40);
const pr = () => ({ headRefOid: sha, baseRefName: "main", headRefName: "codex/automated-cv-sync",
  state: "OPEN", isCrossRepository: false, files: [{ path: "web/src/data/github-data.json" }],
  statusCheckRollup: ["Verify", "Dependency review", "Scan committed secrets"].map(name => ({
    __typename: "CheckRun", name, status: "COMPLETED", conclusion: "SUCCESS",
  })),
});

test("merge waits for all three exact-revision checks", () => {
  assert.equal(syncState(pr(), sha), "ready");
  for (let i = 0; i < 3; i++) {
    const value = pr(); value.statusCheckRollup.splice(i, 1);
    assert.equal(syncState(value, sha), "pending");
  }
});

test("merge rejects code changes, forks, changed revisions and unexpected branches", () => {
  for (const override of [{ headRefOid: "b".repeat(40) }, { baseRefName: "other" },
    { headRefName: "other" }, { isCrossRepository: true }, { state: "CLOSED" },
    { files: [] }, { files: [{ path: ".github/workflows/ci.yml" }] }]) {
    assert.throws(() => syncState({ ...pr(), ...override }, sha));
  }
});

test("failed, cancelled and approval-required checks prevent merging", () => {
  for (const conclusion of ["FAILURE", "CANCELLED", "ACTION_REQUIRED", "TIMED_OUT"]) {
    const value = pr(); value.statusCheckRollup[0].conclusion = conclusion;
    assert.throws(() => syncState(value, sha));
  }
  const value = pr(); value.statusCheckRollup.push({ __typename: "StatusContext", state: "FAILURE" });
  assert.throws(() => syncState(value, sha));
});
