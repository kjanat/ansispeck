set shell := ["bash", "-eu", "-o", "pipefail", "-c"]

# recipes start from a clean color env; forced variants opt back in
unexport FORCE_COLOR
unexport NO_COLOR

BENCH_BUN := 'bun --bun bench.ts'
BENCH_NODE := 'node bench.ts'

default:
	@just --list --unsorted

# watch build
[group('core')]
dev:
	bun run dev

# biome check src/
[group('core')]
lint:
	bun run lint

# bun test
[group('core')]
test:
	bun test

# tsgo --noEmit
[group('core')]
typecheck:
	bun run typecheck

# print packed tarball filename; fails loudly if pack produced none
[group('core')]
tar:
	@out="$(bun run tar)" && [[ -n "$out" && -f "$out" ]] && echo "$out" || { echo 'bun run tar produced no tarball' >&2; exit 1; }

# tsdown
[group('core')]
build:
	run build

# run bench.ts under bun (FORMAT: overview|json|quiet|mitata|markdown|md)
[group('benchmarks')]
[arg('FORMAT', pattern = 'overview|json|quiet|mitata|markdown|md')]
bench-bun FORMAT = 'overview': build
	{{ BENCH_BUN }} -f {{ FORMAT }}

# run bench.ts under node (FORMAT: overview|json|quiet|mitata|markdown|md)
[group('benchmarks')]
[arg('FORMAT', pattern = 'overview|json|quiet|mitata|markdown|md')]
bench-node FORMAT = 'overview': build
	{{ BENCH_NODE }} -f {{ FORMAT }}

# bench-bun then bench-node
[group('benchmarks')]
bench: bench-bun bench-node

alias bench-auto := bench
alias bench-bun-auto := bench-bun
alias bench-node-auto := bench-node

# bench-bun with FORCE_COLOR=1
[group('benchmarks')]
[arg('FORMAT', pattern = 'overview|json|quiet|mitata|markdown|md')]
bench-bun-forced FORMAT = 'overview' $FORCE_COLOR = '1': build
	{{ BENCH_BUN }} -f {{ FORMAT }}

# bench-node with FORCE_COLOR=1
[group('benchmarks')]
[arg('FORMAT', pattern = 'overview|json|quiet|mitata|markdown|md')]
bench-node-forced FORMAT = 'overview' $FORCE_COLOR = '1': build
	{{ BENCH_NODE }} -f {{ FORMAT }}

# forced bun + node
[group('benchmarks')]
bench-forced: bench-bun-forced bench-node-forced

# markdown output, auto color detection
[group('benchmarks')]
[group('markdown')]
bench-md-auto: (bench-bun 'markdown') (bench-node 'markdown')

# markdown output, FORCE_COLOR=1
[group('benchmarks')]
[group('markdown')]
bench-md-forced: (bench-bun-forced 'markdown') (bench-node-forced 'markdown')
