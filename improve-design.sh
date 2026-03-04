#!/bin/bash
# Quick alias for design-improver skill
# Usage: ./improve-design.sh [focus-area] [max-iterations]

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
"${REPO_ROOT}/.opencode/skills/design-improver/run-iteration.sh" "$@"
