# https://just.systems

set shell := ["bash", "-eu", "-o", "pipefail", "-c"]

unexport FORCE_COLOR
unexport NO_COLOR

# shared benchmark commands

bench_bun_command := "bun --bun bench.ts"
bench_node_command := "node bench.ts"

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

# prepare package contents (build:quiet + prepack.ts; also runs automatically via `bun pm pack`)
[group('release')]
prepack:
    run prepack

# restore package.json mutated by prepack (delegates to the postpack script)
[group('release')]
postpack:
    run postpack

# run publish checks
[group('release')]
prepublishOnly:
    run -s prepublishOnly

# core

# watch build
[group('core')]
dev:
    run dev

# format everything
[group('core')]
fmt:
    run fmt

# lint source
[group('core')]
lint:
    run lint

# run tests
[group('core')]
test:
    run test

# type-check (requires a build for dist-importing files)
[group('core')]
typecheck:
    run typecheck

# print packed tarball filename
[group('core')]
tar:
    run -s tar

# build distribution
[group('core')]
build:
    run build
