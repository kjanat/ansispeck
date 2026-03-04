#!/usr/bin/env bash
# Report local dist sizes for ansispeck.
# Usage: scripts/compare-size.sh [--table|--markdown]
#   --table     terminal table (default)
#   --markdown  GitHub-flavored markdown table
set -euo pipefail

git_root=$(git rev-parse --show-toplevel)
cd "${git_root}" || exit 1

package=$(bun pm pkg get name | tr -d '"')

FMT=table
for arg in "$@"; do
	case "${arg}" in
		--table) FMT=table ;;
		--markdown) FMT=markdown ;;
		-*)
			printf 'unknown flag: %s\n' "${arg}" >&2
			exit 1
			;;
		*) ;;
	esac
done

# Build package output.
bunx --bun tsdown -l error >/dev/null 2>&1

runtime="${git_root}/dist/index.js"
types="${git_root}/dist/index.d.ts"

rt_bytes=$(wc -c <"${runtime}")
gz_bytes=$(gzip -c "${runtime}" | wc -c)
ts_bytes=$(wc -c <"${types}")
version=$(bun pm pkg get version | tr -d '"')
commit=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")

kb() { awk "BEGIN { printf \"%.2f KB\", $1 / 1024 }"; }

rt_kb=$(kb "${rt_bytes}")
gz_kb=$(kb "${gz_bytes}")
ts_kb=$(kb "${ts_bytes}")

repo_url=$(git remote get-url origin 2>/dev/null | sed -e 's/\.git$//' -e 's|^git@\([^:]*\):|https://\1/|' || echo "")
npm_url="https://www.npmjs.com/package/${package}/v/${version}"
commit_url="${repo_url:+${repo_url}/commit/${commit}}"

link() {
	local url="${1}" label="${2}"
	if [[ -t 1 && -n ${url} ]]; then
		printf '\033]8;;%s\033\\%s\033]8;;\033'\\\\ "${url}" "${label}"
	else
		printf '%s' "${label}"
	fi
}

case "${FMT}" in
	table)
		printf '\n'
		printf '  %-14s %10s %10s %10s\n' '' 'Runtime' 'Gzip' 'Types'
		printf '  %-14s %10s %10s %10s\n' '──────────────' '──────────' '──────────' '──────────'
		as_label=$(link "${npm_url}" "ansispeck")
		printf '  %-14s %10s %10s %10s\n' "${as_label}" "${rt_kb}" "${gz_kb}" "${ts_kb}"
		printf '\n'
		as_ver_label=$(link "${npm_url}" "${version}")
		as_sha_label=$(link "${commit_url}" "${commit}")
		if [[ -n "${commit_url}" ]]; then
			printf '  ansispeck %s (%s)\n' "${as_ver_label}" "${as_sha_label}"
		else
			printf '  ansispeck %s\n' "${as_ver_label}"
		fi
		printf '\n'
		;;
	markdown)
		printf '| Package | Runtime | Gzip | Types |\n'
		printf '| --- | --- | --- | --- |\n'
		if [[ -n "${commit_url}" ]]; then
			printf '| ansispeck (%s)[^ansispeck] | **%s** | %s | %s |\n' "${commit}" "${rt_kb}" "${gz_kb}" "${ts_kb}"
		else
			printf '| ansispeck[^ansispeck] | **%s** | %s | %s |\n' "${rt_kb}" "${gz_kb}" "${ts_kb}"
		fi
		printf '\n'
		if [[ -n "${commit_url}" ]]; then
			printf '[^ansispeck]: ansispeck [v%s](%s "NPM") [%s](%s "GitHub")\n' "${version}" "${npm_url}" "${commit}" "${commit_url}"
		else
			printf '[^ansispeck]: ansispeck [v%s](%s "NPM")\n' "${version}" "${npm_url}"
		fi
		;;
	*)
		printf 'unknown format: %s\n' "${FMT}" >&2
		exit 1
		;;
esac
