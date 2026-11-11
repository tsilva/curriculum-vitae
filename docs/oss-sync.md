# Open-source project synchronization

The website imports `web/src/data/github-data.json` at build time. The daily
`Sync CV Data` workflow refreshes it, regenerates the CV and web data, and
opens or updates `codex/automated-cv-sync`. Collection includes all public owned
repositories across pages, then excludes forks, archived repositories and the
profile/CV repositories. The website additionally hides sandbox and template
repositories. Descriptions, languages, stars, homepages and update times come
from GitHub; `data/oss/` remains the curated source for the exported Markdown CV.

## Unattended publication

Install a dedicated GitHub App on **only `tsilva/curriculum-vitae`**, granting:

- Contents: read and write.
- Pull requests: read and write.
- Checks: read.
- Metadata: read (automatic).

In the repository's Actions settings, configure the variable
`CV_SYNC_APP_CLIENT_ID` and secret `CV_SYNC_APP_PRIVATE_KEY`. Configure the
private key directly in GitHub; do not copy a personal CLI login into Actions.
Leave automatic merging enabled and retain the repository's required checks.
The workflow refuses to publish without this configuration instead of falling
back to `GITHUB_TOKEN`, whose automated PR runs can require manual approval.

After lint, data tests, collector tests and a build, the workflow mints a
short-lived token restricted to this repository. It opens the generated-data PR
and waits for `Verify`, `Dependency review` and `Scan committed secrets` to
succeed on that exact head SHA. It then requests a normal squash merge, with no
administrator bypass. Unexpected files, branches, forks, changed revisions,
failed checks or a 20-minute wait timeout prevent merging. The token is revoked
when the job ends. The existing main-push CI and [production delivery](production-delivery.md)
publish the merged revision. A successful sync job alone does not prove the
production deployment is ready.

Metadata synchronization preserves the saved gallery version to avoid commits
caused only by a different sync commit hash. Production builds continue to
version gallery assets using the release commit.

To verify setup, manually dispatch **Sync CV Data** on `main`, inspect the
generated-data PR and its checks, and verify the merged commit's Production
delivery reaches READY on the configured domains. No-change runs create no PR.

## Collection and recovery

On a provisioned Mac, run `npm --prefix web run sync`. Local collection uses its
reviewed sandboxed public GitHub Vault route, with no GitHub credential. The REST
client requests 100 records per page and stops at the first short page. A
100-page safety bound, duplicate records or a failure on any page cause failure
without replacing the existing snapshot. Source/runtime pins must pass trusted
review before a changed local collector runs.

Hosted Linux collection uses GitHub CLI pagination with a 10,000-record safety
bound. Reaching the bound or failing collection fails the workflow while keeping
the saved output. Both routes preserve the existing generated schema and final
update-time/name ordering.

If synchronization fails, repair the named configuration or upstream problem and
rerun the workflow on `main`. If a PR check fails, fix that check; do not bypass
it. If publishing fails after a merge, use the recovery steps in the production
delivery guide. Existing production remains live while a replacement fails.
