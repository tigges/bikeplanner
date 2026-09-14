#!/usr/bin/env bash
# The paper site must run from this repo: graphs/ + data/rides/, no live
# tigges/routeplanner or github.io/routeplanner dependency.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
fail=0

if grep -RIn --include='*.html' --include='*.js' --exclude-dir=graphs \
    -e 'github.io/routeplanner' -e 'github.com/tigges/routeplanner' .; then
  echo "FAIL: product still points at tigges/routeplanner" >&2
  fail=1
else
  echo "ok: no product link to tigges/routeplanner"
fi

if grep -nE '/tmp/rp|docs/.*/index.html' tools/extract_ride_snapshots.mjs; then
  echo "FAIL: extractor still looks like a github.io scrape" >&2
  fail=1
else
  echo "ok: extractor is local graphs/"
fi

missing=0
for slug in japan uk london switzerland switzerland-north-south spain; do
  if [[ ! -f "graphs/$slug/P.json" ]]; then
    echo "FAIL: graphs/$slug/P.json missing" >&2
    missing=1
  fi
done
if [[ $missing -eq 0 ]]; then
  echo "ok: six owned graphs on disk"
fi
fail=$((fail + missing))

n=$(find data/rides -name '*.json' | wc -l | tr -d ' ')
if [[ "$n" -lt 90 ]]; then
  echo "FAIL: expected ≥90 ride snapshots, found $n" >&2
  fail=1
else
  echo "ok: $n ride snapshots"
fi

if [[ ! -f graphs/planner-template.html ]]; then
  echo "FAIL: graphs/planner-template.html missing" >&2
  fail=1
else
  echo "ok: local planner template"
fi

exit "$fail"
