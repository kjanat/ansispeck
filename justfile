# https://just.systems

set shell := ["bash", "-eu", "-o", "pipefail", "-c"]

unexport FORCE_COLOR
unexport NO_COLOR

# shared benchmark commands

bench_bun_command := "bun --bun bench.ts"
bench_node_command := "node bench.ts"
prepack_backup_marker := ".git/.prepack-backup-dir"

# list recipes
default:
    @just --list --unsorted

# benchmarks

# bun bench (auto)
[arg('FORMAT', pattern='overview|json|quiet|mitata|markdown|md', help='overview|json|quiet|mitata|markdown|md')]
[group('benchmarks')]
bench-bun FORMAT="overview": build
    {{ bench_bun_command }} -f {{ FORMAT }}

# node bench (auto)
[arg('FORMAT', pattern='overview|json|quiet|mitata|markdown|md', help='overview|json|quiet|mitata|markdown|md')]
[group('benchmarks')]
bench-node FORMAT="overview": build
    {{ bench_node_command }} -f {{ FORMAT }}

# both benches (auto)
[group('benchmarks')]
bench: bench-bun bench-node

# aliases for auto-color recipes
alias bench-auto := bench
alias bench-bun-auto := bench-bun
alias bench-node-auto := bench-node

# bun bench (forced)
[arg('FORMAT', pattern='overview|json|quiet|mitata|markdown|md', help='overview|json|quiet|mitata|markdown|md')]
[group('benchmarks')]
bench-bun-forced FORMAT="overview" $FORCE_COLOR="1": build
    {{ bench_bun_command }} -f {{ FORMAT }}

# node bench (forced)
[arg('FORMAT', pattern='overview|json|quiet|mitata|markdown|md', help='overview|json|quiet|mitata|markdown|md')]
[group('benchmarks')]
bench-node-forced FORMAT="overview" $FORCE_COLOR="1": build
    {{ bench_node_command }} -f {{ FORMAT }}

# both benches (forced)
[group('benchmarks')]
bench-forced: bench-bun-forced bench-node-forced

# markdown variants

# markdown benches (auto)
[group('benchmarks')]
[group('markdown')]
bench-md-auto: (bench-bun "markdown") (bench-node "markdown")

# markdown benches (forced)
[group('benchmarks')]
[group('markdown')]
bench-md-forced: (bench-bun-forced "markdown") (bench-node-forced "markdown")

# release hooks

# prepare package contents
[group('release')]
prepack:
    if [[ -f {{ prepack_backup_marker }} ]]; then echo "prepack backup marker exists; run just postpack first" >&2; exit 1; fi
    backup_dir="$(mktemp -d -t ansispeck-prepack.XXXXXX)" && cp package.json README.md "$backup_dir"/ && printf '%s' "$backup_dir" > {{ prepack_backup_marker }}
    bun --bun bd -l error
    bun scripts/prepack.ts
    bunx prettier README.md --write >/dev/null

# restore files changed by prepack
[group('release')]
postpack:
    if [[ ! -f {{ prepack_backup_marker }} ]]; then echo "missing prepack backup marker; refusing silent no-op" >&2; exit 1; fi
    backup_dir="$(cat {{ prepack_backup_marker }})"; if [[ -z "$backup_dir" || ! -d "$backup_dir" ]]; then echo "invalid prepack backup dir: $backup_dir" >&2; exit 1; fi; cp "$backup_dir/package.json" package.json; cp "$backup_dir/README.md" README.md; rm -rf "$backup_dir" {{ prepack_backup_marker }}

# run publish checks
[group('release')]
prepublishOnly: test typecheck

# core

# watch build
[group('core')]
dev:
    bunx --bun tsdown --watch

# lint source
[group('core')]
lint:
    bunx @biomejs/biome check

# run tests
[group('core')]
test:
    bun test

# type-check
[group('core')]
typecheck:
    bun typecheck

# print packed tarball filename
[group('core')]
tar:
    bun pm pack --quiet | awk 'NF{line=$0} END{print line}'

# build distribution
[group('core')]
build:
    bun bd
