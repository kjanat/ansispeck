#!/usr/bin/env bash
set -euo pipefail

# Set color env from input
case "$COLOR" in
	force)
		unset NO_COLOR
		export FORCE_COLOR=1
		mode="COLOR"
		;;
	none)
		unset FORCE_COLOR
		export NO_COLOR=1
		mode="NOCOLOR"
		;;
	*)
		echo "Unknown color mode: $COLOR (expected 'force' or 'none')" >&2
		exit 1
		;;
esac

# Build var name: e.g. BUN_BENCH_COLOR, NODE_BENCH_NOCOLOR
var="${RUNTIME^^}_BENCH_${mode}"

# Build command based on runtime
case "$RUNTIME" in
	bun) set -- bun --bun bench.ts -f markdown ;;
	node) set -- node bench.ts -f markdown ;;
	*)
		echo "Unknown runtime: $RUNTIME" >&2
		exit 1
		;;
esac

output="$("$@")"

emit() {
	local key="$1" target="$2"
	{
		echo "${key}<<${key}_EOF"
		printf '%s\n' "$output"
		echo "${key}_EOF"
	} >>"$target"
}

echo "::group::${var}"
printf '%s\n' "$output"
echo "::endgroup::"

emit "$var" "$GITHUB_ENV"
emit result "$GITHUB_OUTPUT"
