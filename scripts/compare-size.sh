#!/usr/bin/env bash
# Compare femtocolors dist sizes against picocolors.
# Usage: scripts/compare-size.sh [--table|--markdown] [picocolors-version]
#   --table     terminal table with Unicode box-drawing (default)
#   --markdown  GitHub-flavored markdown table
#   e.g. scripts/compare-size.sh --markdown 1.1.1
set -euo pipefail

# ── Parse args ───────────────────────────────────────────────────
FMT=table
PICO_VERSION=latest

for arg in "$@"; do
	case "${arg}" in
	--table) FMT=table ;;
	--markdown) FMT=markdown ;;
	-*)
		printf 'unknown flag: %s\n' "${arg}" >&2
		exit 1
		;;
	*) PICO_VERSION="${arg}" ;;
	esac
done

TMPDIR=$(mktemp -d)
trap 'rm -rf "${TMPDIR}"' EXIT

# ── Build femtocolors ─────────────────────────────────────────────
bunx --bun tsdown -l error >/dev/null 2>&1

fc_runtime=dist/index.js
fc_types=dist/index.d.ts

fc_rt_bytes=$(wc -c <"${fc_runtime}")
fc_gz_bytes=$(gzip -c "${fc_runtime}" | wc -c)
fc_ts_bytes=$(wc -c <"${fc_types}")
fc_version=$(node -p "require('./package.json').version")
fc_commit=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")

# ── Fetch picocolors ─────────────────────────────────────────────
npm pack "picocolors@${PICO_VERSION}" --pack-destination "${TMPDIR}" >/dev/null 2>&1
tar xzf "${TMPDIR}"/picocolors-*.tgz -C "${TMPDIR}"

pc_pkg="${TMPDIR}/package"
pc_version=$(node -p "require('${pc_pkg}/package.json').version")
pc_runtime="${pc_pkg}/picocolors.js"
pc_rt_bytes=$(wc -c <"${pc_runtime}")
pc_gz_bytes=$(gzip -c "${pc_runtime}" | wc -c)
pc_ts_bytes=0
for f in "${pc_pkg}"/picocolors.d.ts "${pc_pkg}"/types.d.ts; do
	[[ -f "${f}" ]] && pc_ts_bytes=$((pc_ts_bytes + $(wc -c <"${f}")))
done

# ── Format helpers ───────────────────────────────────────────────
# OSC 8 hyperlink: \e]8;;URL\e\\LABEL\e]8;;\e\\
# Only emit when stdout is interactive (TTY)
link() {
	local url=$1 label=$2
	if [[ -t 1 && -n "${url}" ]]; then
		printf '%s' $'\e]8;;'"${url}"$'\e\\'"${label}"$'\e]8;;\e\\'
	else
		printf '%s' "${label}"
	fi
}
kb() { awk "BEGIN { printf \"%.2f KB\", $1 / 1024 }"; }
delta() {
	local a=$1 b=$2
	if [[ "${b}" -eq 0 ]]; then
		printf "n/a"
	elif [[ "${a}" -lt "${b}" ]]; then
		awk "BEGIN { printf \"-%.0f%%\", (1 - ${a}/${b}) * 100 }"
	elif [[ "${a}" -gt "${b}" ]]; then
		awk "BEGIN { printf \"+%.0f%%\", (${a}/${b} - 1) * 100 }"
	else
		printf "="
	fi
}

fc_rt_kb=$(kb "${fc_rt_bytes}")
fc_gz_kb=$(kb "${fc_gz_bytes}")
fc_ts_kb=$(kb "${fc_ts_bytes}")
pc_rt_kb=$(kb "${pc_rt_bytes}")
pc_gz_kb=$(kb "${pc_gz_bytes}")
pc_ts_kb=$(kb "${pc_ts_bytes}")

rt_delta=$(delta "${fc_rt_bytes}" "${pc_rt_bytes}")
gz_delta=$(delta "${fc_gz_bytes}" "${pc_gz_bytes}")
ts_delta=$(delta "${fc_ts_bytes}" "${pc_ts_bytes}")

repo_url=$(git remote get-url origin 2>/dev/null | sed -e 's/\.git$//' -e 's|^git@\([^:]*\):|https://\1/|' || echo "")
fc_npm_url="https://www.npmjs.com/package/femtocolors/v/${fc_version}"
fc_commit_url="${repo_url:+${repo_url}/commit/${fc_commit}}"
pc_npm_url="https://www.npmjs.com/package/picocolors/v/${pc_version}"

# ── Output ───────────────────────────────────────────────────────
case "${FMT}" in
table)
	printf '\n'
	printf '  %-14s %10s %10s %10s\n' '' 'Runtime' 'Gzip' 'Types'
	printf '  %-14s %10s %10s %10s\n' '──────────────' '──────────' '──────────' '──────────'
	fc_label=$(link "${fc_npm_url}" "femtocolors")
	pc_label=$(link "${pc_npm_url}" "picocolors")
	printf '  %-14s %10s %10s %10s\n' "${fc_label}" "${fc_rt_kb}" "${fc_gz_kb}" "${fc_ts_kb}"
	printf '  %-14s %10s %10s %10s\n' "${pc_label}" "${pc_rt_kb}" "${pc_gz_kb}" "${pc_ts_kb}"
	printf '  %-14s %10s %10s %10s\n' 'delta' "${rt_delta}" "${gz_delta}" "${ts_delta}"
	printf '\n'
	fc_ver_label=$(link "${fc_npm_url}" "${fc_version}")
	fc_sha_label=$(link "${fc_commit_url}" "${fc_commit}")
	pc_ver_label=$(link "${pc_npm_url}" "${pc_version}")
	printf '  femtocolors %s (%s), picocolors %s\n' "${fc_ver_label}" "${fc_sha_label}" "${pc_ver_label}"
	printf '\n'
	;;
markdown)
	printf '| Package | Runtime | Gzip | Types |\n'
	printf '| --- | --- | --- | --- |\n'
	if [[ -n "${fc_commit_url}" ]]; then
		printf '| [femtocolors][fc-npm] ([%s][fc-commit]) | **%s** | %s | %s |\n' "${fc_commit}" "${fc_rt_kb}" "${fc_gz_kb}" "${fc_ts_kb}"
	else
		printf '| [femtocolors][fc-npm] | **%s** | %s | %s |\n' "${fc_rt_kb}" "${fc_gz_kb}" "${fc_ts_kb}"
	fi
	printf '| [picocolors][pc-npm] | %s | %s | %s |\n' "${pc_rt_kb}" "${pc_gz_kb}" "${pc_ts_kb}"
	printf '| delta | %s | %s | %s |\n' "${rt_delta}" "${gz_delta}" "${ts_delta}"
	printf '\n'
	printf '[fc-npm]: %s\n' "${fc_npm_url}"
	[[ -n "${fc_commit_url}" ]] && printf '[fc-commit]: %s\n' "${fc_commit_url}"
	printf '[pc-npm]: %s\n' "${pc_npm_url}"
	;;
*)
	printf 'unknown format: %s\n' "${FMT}" >&2
	exit 1
	;;
esac
