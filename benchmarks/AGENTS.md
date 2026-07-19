# benchmarks/AGENTS.md

## OVERVIEW

mitata suites orchestrated by `../bench.ts` (which builds dist first via
`execSync('run build')`). Every suite file is standalone-runnable
(`import.meta.main` guard) and exports `register(options)` wrapped in exactly
one mitata grouping call — that wrapper assigns `trial.group`, which `bench.ts`
maps back to suite names by first-seen order. Internal rows benchmark the BUILT
dist entrypoints, never `src/*`.

## WHERE TO LOOK

| File           | Wrapper     | Measures                                                                   |
| -------------- | ----------- | -------------------------------------------------------------------------- |
| `simple.ts`    | `boxplot()` | single-call overhead (`red(...)` with `++n` entropy)                       |
| `complex.ts`   | `summary()` | chained realistic composition (dots + bgRed/black ERROR + nested yellows)  |
| `recursion.ts` | `summary()` | large repeated strings (`.repeat(10_000)`) with per-row Counter entropy    |
| `deferred.ts`  | `summary()` | 32-layer staged wrapping; rope row sinks the UNRENDERED chunk (by design)  |
| `loading.ts`   | `group()`   | isolated process importing local-tarball install; requires `count === 1`   |
| `libraries.ts` | —           | canonical alias/package/specifier manifest shared by runner and fixture    |
| `size.ts`      | —           | raw+gzip per-library file size via explicit path table; run directly       |
| `../bench.ts`  | —           | aggregation, LIB_ORDER ranking, Welch CI95 footer, overview/markdown print |

## CONVENTIONS

- Formatting suites import `#ansispeck-dist` (root) and `#ansispeck-dist/*`
  (subpaths). `loading.ts` launches the active runtime against
  `.cache/bench-loading`, whose dependencies are exact local package tarballs
  prepared by `scripts/prepare-loading-fixture.ts`.
- Row aliases: externals use exact npm names (`kleur/colors` included); internal
  rows use the subpath alias (`ansispeck`, `ansispeck/auto`, `ansispeck/raw`,
  `ansispeck/safe`, `ansispeck/rope`, `ansispeck/noop`).
- `ansispeck/noop` is the control path (string coercion only) — it exists to
  bound formatter overhead.
- Suite/column names are STABLE for historical table continuity:
  `simple, complex, recursion, deferred-build,
  loading`. Registration order in
  `bench.ts` must match `SUITES` order (group→suite mapping is positional).
- Anti-DCE: results go to a local `sink` consumed by `do_not_optimize`; string
  inputs carry `++n` or Counter entropy so engines can't constant-fold.
- `register` options take explicit annotations (`{ count?: number }`, deferred:
  `{ layers?: number; repeat?: number }`).

## ANTI-PATTERNS

- Never remove `do_not_optimize` or the `sink` assignment — silent dead-code
  elimination invalidates rows.
- No constant inputs in `recursion`/`deferred` — the Counter/`nextInput` entropy
  is load-bearing.
- The CI95 baseline (`ansispeck/ext#1`) compares root against the fastest
  EXTERNAL library only. Never let it compare against internal `ansispeck/*`
  variants — noop/raw topping the ranking would make the ratio self-referential.
- Do NOT add `rope.render()` to the deferred suite's rope row — the suite
  measures deferred composition cost (O(1) concat); rendering would collapse it
  into a second complex suite.
- `size.ts` keeps its explicit `[name, path]` table. Do not switch to
  `import.meta.resolve` — it picks export-condition-dependent files across
  runtimes and breaks historical size-table comparability.

## NOTES

- Reproducible forced-color markdown run: `just bench-md-forced`. CI path:
  `.github/workflows/bench.yml` + composite action `.github/actions/bench/`
  (bun/node × FORCE_COLOR/NO_COLOR matrix, run inline).
- `--filter` can starve `welchCI95` (<2 samples throws) or empty the first suite
  — `parse()` then falls back to enumerating `trial.alias`.
- `--quiet` is the substrate for `overview`/`markdown`; `json`/`mitata` pass
  straight through.
- `internal/wasm-rust/` is an experiment, not wired into `SUITES`.
