#!/usr/bin/env bash
set -euo pipefail

: GITHUB_ENV="${GITHUB_ENV:-/dev/stderr}"
: GITHUB_OUTPUT="${GITHUB_OUTPUT:-/dev/stdout}"
: RUNTIME="${RUNTIME:-}"
: COLOR="${COLOR:-}"
: COMPACT="${COMPACT:-}"

# Set color env from input
case "${COLOR}" in
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
		echo "Unknown color mode: ${COLOR} (expected 'force' or 'none')" >&2
		exit 1
		;;
esac

# Build var name: e.g. BUN_BENCH_COLOR, NODE_BENCH_NOCOLOR
var="${RUNTIME^^}_BENCH_${mode}"

# Build command based on runtime
case "${RUNTIME}" in
	bun) set -- bun --bun benchmarks/bench.ts -f markdown ;;
	node) set -- node benchmarks/bench.ts -f markdown ;;
	deno) set -- deno run -A benchmarks/bench.ts -f markdown ;;
	*)
		echo "Unknown runtime: ${RUNTIME}" >&2
		exit 1
		;;
esac

case "${COMPACT}" in
	true) set -- "$@" --compact ;;
	false) ;;
	*)
		echo "Unknown compact mode: ${COMPACT} (expected 'true' or 'false')" >&2
		exit 1
		;;
esac

# Prepare the package and loading fixture once per job. GITHUB_ENV makes the
# marker available to later invocations of this composite action.
if [[ "${BENCH_MULTI:-}" != "1" ]]; then
	bun --bun scripts/prepare-benchmark-package.ts
	export BENCH_MULTI=1
	echo "BENCH_MULTI=1" >>"${GITHUB_ENV}"
fi

output="$("$@")"
if formatted="$(printf '%s\n' "${output}" | dprint fmt --stdin md)"; then
	output="${formatted}"
fi

emit() {
	local key="$1" target="$2"
	{
		echo "${key}<<${key}_EOF"
		printf '%s\n' "${output}"
		echo "${key}_EOF"
	} >>"${target}"
}

echo "::group::${var}"
printf '%s\n' "${output}"
echo "::endgroup::"

emit "${var}" "${GITHUB_ENV}"
emit result "${GITHUB_OUTPUT}"
