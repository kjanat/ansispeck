#!/usr/bin/env bash
set -euo pipefail

# Determine color mode from environment
if [[ -n "${FORCE_COLOR:-}" ]]; then
  mode="COLOR"
elif [[ -n "${NO_COLOR:-}" ]]; then
  mode="NOCOLOR"
else
  echo "Either FORCE_COLOR or NO_COLOR must be set" >&2; exit 1
fi

# Build var name: e.g. BUN_BENCH_COLOR, NODE_BENCH_NOCOLOR
var="${RUNTIME^^}_BENCH_${mode}"

# Build command based on runtime
case "$RUNTIME" in
  bun)  set -- bun --bun bench.ts -f markdown ;;
  node) set -- node bench.ts -f markdown ;;
  *)    echo "Unknown runtime: $RUNTIME" >&2; exit 1 ;;
esac

output="$("$@")"

emit() {
  local key="$1" target="$2"
  {
    echo "${key}<<${key}_EOF"
    printf '%s\n' "$output"
    echo "${key}_EOF"
  } >> "$target"
}

echo "::group::${var}"
printf '%s\n' "$output"
echo "::endgroup::"

emit "$var" "$GITHUB_ENV"
emit result "$GITHUB_OUTPUT"
