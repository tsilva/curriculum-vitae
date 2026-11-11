"""Public GitHub collection through a pinned native Vault session and sandbox."""
import hashlib
import json
import os
from pathlib import Path
import stat
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[2]
PREFIX = Path.home() / ".config/infisical"
PROFILE = PREFIX / "github-readers/curriculum-vitae.json"
VAULT_PROJECT = "5078c850-3f93-46d8-8afe-82107df8b931"
NATIVE_SHA = "cd9a009a91be45d07a13696d71ed66a0279ba4a59090bd2a039d2187317d194a"
FILES = {
    "scripts/fetch-github.ts", "scripts/github-entry.mjs",
    "scripts/infisical/github_vault.py", "scripts/infisical/github_public_client.mjs",
    "scripts/infisical/github_public.sb",
}
EXPECTED = {
    "version": 1, "repository": "curriculum-vitae", "repo_path": str(ROOT),
    "native_project": "140a6006-81fa-4133-9b8d-f83108e32e07",
    "vault_project": VAULT_PROJECT, "bundle": "local-curriculum-vitae-github-public",
    "credential_mode": "none", "api_base": "https://api.github.com",
    "output_file": str(ROOT / "web/src/data/github-data.json"),
    "node": str(PREFIX / "runtimes/node-v24.22.1-darwin-arm64/bin/node"),
    "infisical": str(PREFIX / "cli/0.45.6/infisical"),
    "ca_file": str(PREFIX / "agent-vault-ca.pem"),
    "ca_fingerprint": "SHA256:37:B2:E0:81:45:EC:C0:58:46:2E:D1:2F:E1:2B:E6:AE:2B:78:B1:B3:F0:21:CD:8F:EC:54:CC:30:2D:36:9E:37",
}


def digest(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def protected(path):
    info = path.lstat()
    if not stat.S_ISREG(info.st_mode) or info.st_uid != os.getuid() or info.st_mode & 0o077:
        raise ValueError("Expected owner-only protected metadata")


def profile():
    protected(PROFILE)
    data = json.loads(PROFILE.read_text())
    if (set(data) != set(EXPECTED) | {"code_sha256", "runtime_sha256"}
            or type(data["version"]) is not int
            or any(data[k] != v for k, v in EXPECTED.items())):
        raise ValueError("Unreviewed public GitHub binding")
    native = ROOT / ".infisical.json"
    if (ROOT / ".infisical.yaml").exists() or native.is_symlink() or digest(native) != NATIVE_SHA:
        raise ValueError("Native repository identity changed")
    if set(data["code_sha256"]) != FILES:
        raise ValueError("Incomplete source pins")
    for name, sha in data["code_sha256"].items():
        path = ROOT / name
        if path.is_symlink() or digest(path) != sha:
            raise ValueError("Changed source requires trusted review")
    if set(data["runtime_sha256"]) != {"node", "infisical", "ca_file"}:
        raise ValueError("Incomplete runtime pins")
    for name, sha in data["runtime_sha256"].items():
        path = Path(data[name])
        if path.is_symlink() or digest(path) != sha:
            raise ValueError("Changed runtime requires trusted review")
    package = ROOT / "web/package.json"
    if package.is_symlink() or json.loads(package.read_text())["scripts"]["fetch:github"] != "node ../scripts/github-entry.mjs":
        raise ValueError("Local entry changed; review required")
    output = Path(data["output_file"])
    for path in [output, *output.parents]:
        if path.is_symlink():
            raise ValueError("Symlink output path rejected")
    if not output.parent.is_dir() or (output.exists() and not output.is_file()):
        raise ValueError("Generated-data directory or file unavailable")
    return data


def command(data, mode, client=None, client_args=None):
    if mode not in {"check", "collect"}:
        raise ValueError("Use check or collect")
    parameters = {
        "USER_HOME": str(Path.home()), "REPO_ROOT": str(ROOT),
        "NODE_BIN": data["node"], "NODE_ROOT": str(Path(data["node"]).parent.parent),
        "CA_FILE": data["ca_file"],
        # Read-only checks cannot write the generated file even if client code tries.
        "OUTPUT_FILE": data["output_file"] if mode == "collect" else "/dev/null",
    }
    sandbox = ["/usr/bin/sandbox-exec"]
    for key, value in parameters.items():
        sandbox += ["-D", key + "=" + value]
    sandbox += ["-f", str(ROOT / "scripts/infisical/github_public.sb")]
    return [
        data["infisical"], "agent-vault", "run", "--domain=https://app.infisical.com",
        "--project-id=" + VAULT_PROJECT, "--access-bundle=" + data["bundle"],
        "--proxy=127.0.0.1:8283", "--ca-fingerprint=" + data["ca_fingerprint"],
        "--ttl=10m", "--no-ca-trust", "--no-skills", "--silent", "--telemetry=false",
        "--", "/usr/bin/env", "CV_GITHUB_TRANSPORT=agent-vault-public",
        "CV_GITHUB_API_BASE=" + data["api_base"], "CV_GITHUB_OUTPUT=" + data["output_file"],
        "NODE_USE_ENV_PROXY=1", "NO_PROXY=", "no_proxy=",
        "NODE_EXTRA_CA_CERTS=" + data["ca_file"], *sandbox,
        data["node"], "--use-env-proxy", str(client or ROOT / "scripts/infisical/github_public_client.mjs"),
        *(client_args if client_args is not None else [mode]),
    ]


def main(args):
    if args not in (["check"], ["collect"]):
        raise ValueError("Use check or collect; no scope overrides")
    data = profile()
    q = subprocess.run(command(data, args[0]), cwd=ROOT,
                       env={"HOME": str(Path.home()), "PATH": "/usr/bin:/bin"},
                       capture_output=True, text=True, timeout=70)
    rows = [json.loads(line) for line in q.stdout.splitlines() if line.startswith('{"ok":')]
    if len(rows) != 1:
        raise ValueError("No sanitized collection result")
    print(json.dumps(rows[0]))
    return q.returncode


if __name__ == "__main__":
    try:
        sys.exit(main(sys.argv[1:]))
    except Exception:
        print(json.dumps({"ok": False, "reason": "Public GitHub Vault binding, login or route unavailable; no fallback"}))
        sys.exit(1)
