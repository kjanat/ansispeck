#!/usr/bin/env bash
# Report local dist sizes for ansispeck.
# Usage: scripts/compare-size.sh [--table|--markdown]
#   --table     terminal table (default)
#   --markdown  GitHub-flavored markdown table
set -euo pipefail

FMT=table
for arg in "$@"; do
	case "${arg}" in
		--table) FMT=table ;;
		--markdown) FMT=markdown ;;
		-*)
			printf 'unknown flag: %s\n' "${arg}" >&2
			exit 1
			;;
		*)
			printf 'unknown argument: %s\n' "${arg}" >&2
			exit 1
			;;
	esac
done

# Build package output.
run build:quiet >/dev/null 2>&1

# Measure the default entry's full import chain (entry file + shared chunks),
# resolved by walking static relative imports.
chain() {
	# shellcheck disable=SC2016
	node -e '
		const { existsSync, readFileSync } = require("node:fs");
		const { gzipSync } = require("node:zlib");
		const path = require("node:path");
		const seen = new Set();
		const queue = [process.argv[1]];
		const parts = [];
		while (queue.length > 0) {
			let file = queue.shift();
			// d.ts chunks are imported via .js specifiers
			if (!existsSync(file)) file = file.replace(/\.js$/, ".d.ts");
			if (seen.has(file)) continue;
			seen.add(file);
			const src = readFileSync(file, "utf8");
			parts.push(src);
			for (const m of src.matchAll(/from\s*"(\.\/[^"]+)"/g)) {
				queue.push(path.join(path.dirname(file), m[1]));
			}
		}
		const total = Buffer.from(parts.join(""));
		process.stdout.write(`${total.length} ${gzipSync(total, { level: 9 }).length}`);
	' "$1"
}

read -r rt_bytes gz_bytes <<<"$(chain dist/index.js)"
read -r ts_bytes _ <<<"$(chain dist/index.d.ts)"
name=$(node -p "require('./package.json').name")
version=$(node -p "require('./package.json').version")
commit=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
full_commit=$(git rev-parse HEAD 2>/dev/null || echo "$commit")

kb() { awk "BEGIN { printf \"%.2f KB\", $1 / 1024 }"; }

rt_kb=$(kb "${rt_bytes}")
gz_kb=$(kb "${gz_bytes}")
ts_kb=$(kb "${ts_bytes}")

repo_url=$(git remote get-url origin 2>/dev/null | sed -e 's/\.git$//' -e 's|^git@\([^:]*\):|https://\1/|' || echo "")
npm_url="https://npm.im/package/${name}/v/${version}"
commit_url="${repo_url:+${repo_url}/commit/${full_commit}}"

osc8() {
	local url="${1}" label id="${3:-}"
	label="${2:-$url}"

	if [[ -n "$url" ]]; then
		printf '\e]8;id=%s;%s\a%s\e]8;;\a' "$id" "$url" "$label"
	else
		printf '%s' "$label"
	fi
}

link() { osc8 "$@"; }

case "${FMT}" in
	table)
		# dynamic widths from actual content (plain text only)
		pkg_plain=ansispeck
		rt_plain=$rt_kb
		gz_plain=$gz_kb
		ts_plain=$ts_kb
		h0=Package
		h1=Runtime
		h2=Gzip
		h3=Types
		w0=$((${#h0} > ${#pkg_plain} ? ${#h0} : ${#pkg_plain}))
		w1=$((${#h1} > ${#rt_plain} ? ${#h1} : ${#rt_plain}))
		w2=$((${#h2} > ${#gz_plain} ? ${#h2} : ${#gz_plain}))
		w3=$((${#h3} > ${#ts_plain} ? ${#h3} : ${#ts_plain}))
		# numeric cols get +2 breathing so right-align has visible effect and table has some air (widths still driven by real content)
		w1=$((w1 + 2))
		w2=$((w2 + 2))
		w3=$((w3 + 2))

		# render one (plain, optional-url) cell padded to w; align L or R
		# padding is always *visible* (based on plain), escapes don't affect it
		cell() {
			local plain=$1 url=$2 w=$3 align=${4:-L}
			local styled pad vis
			if [[ -n $url ]]; then
				styled=$(osc8 "$url" "$plain")
			else
				styled=$plain
			fi
			vis=${#plain}
			pad=$((w - vis))
			[[ $pad -lt 0 ]] && pad=0
			if [[ $align == L ]]; then
				printf '%s%*s' "$styled" "$pad" ''
			else
				printf '%*s%s' "$pad" '' "$styled"
			fi
		}
		dashes() { printf '%*s' "$1" '' | tr ' ' '-'; }

		# header (plain, L for pkg col, R for the rest)
		body=$(
			printf '  '
			cell "$h0" '' "$w0" L
			printf ' '
			cell "$h1" '' "$w1" R
			printf ' '
			cell "$h2" '' "$w2" R
			printf ' '
			cell "$h3" '' "$w3" R
		)
		hdr=$body$'\n'
		# separator: exact dashes per computed width, same spacing
		body=$(
			printf '  '
			dashes "$w0"
			printf ' '
			dashes "$w1"
			printf ' '
			dashes "$w2"
			printf ' '
			dashes "$w3"
		)
		sep=$body$'\n'
		# data row: only pkg col gets the link, others plain; widths from plains
		body=$(
			printf '  '
			cell "$pkg_plain" "$npm_url" "$w0" L
			printf ' '
			cell "$rt_plain" '' "$w1" R
			printf ' '
			cell "$gz_plain" '' "$w2" R
			printf ' '
			cell "$ts_plain" '' "$w3" R
		)
		row=$body$'\n'

		# footer re-uses links for ver/sha (natural spacing, not forced into cols)
		as_ver_label=$(osc8 "${npm_url}" "${version}")
		as_sha_label=$(osc8 "${commit_url}" "${commit}")
		if [[ -n "${commit_url}" ]]; then
			ver=$(printf '  ansispeck %s (%s)\n' "${as_ver_label}" "${as_sha_label}")
		else
			ver=$(printf '  ansispeck %s\n' "${as_ver_label}")
		fi

		cat <<EOF

${hdr}${sep}${row}
${ver}
EOF
		;;
	markdown)
		if [[ -n "${commit_url}" ]]; then
			cat <<EOF
| Package | Runtime | Gzip | Types |
| --- | --- | --- | --- |
| [ansispeck] ([${commit}][as-commit]) | **${rt_kb}** | ${gz_kb} | ${ts_kb} |

[ansispeck]: ${npm_url}
[as-commit]: ${commit_url}
EOF
		else
			cat <<EOF
| Package | Runtime | Gzip | Types |
| --- | --- | --- | --- |
| [ansispeck] | **${rt_kb}** | ${gz_kb} | ${ts_kb} |

[ansispeck]: ${npm_url}
EOF
		fi
		;;
	*)
		printf 'unknown format: %s\n' "${FMT}" >&2
		exit 1
		;;
esac
