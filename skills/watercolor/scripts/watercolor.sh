#!/usr/bin/env bash
# Resolve and run the watercolor CLI from wherever this skill is installed.
#   1. a `watercolor` binary on PATH
#   2. this repository's own build (installed + built on first use)
#   3. npx watercolor-cli
set -euo pipefail
here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
repo="$(cd "$here/../../.." && pwd)"

if command -v watercolor >/dev/null 2>&1; then
  exec watercolor "$@"
fi

if [ -f "$repo/package.json" ] && grep -q '"name": "watercolor-cli"' "$repo/package.json"; then
  if [ ! -f "$repo/dist/cli.js" ]; then
    echo "watercolor: first run — installing dependencies and building (one time)…" >&2
    (cd "$repo" && npm install --no-audit --no-fund >&2 && npm run build >&2)
  fi
  exec node "$repo/dist/cli.js" "$@"
fi

exec npx -y watercolor-cli "$@"
