# BENCHMARK KNOWLEDGE BASE

## OVERVIEW

`benchmarks/` defines suite registration units consumed by `../bench.ts` for runtime comparison (every ansispeck entrypoint vs external libs) and markdown reporting.

## WHERE TO LOOK

| Task                               | Location       | Notes                                                  |
| ---------------------------------- | -------------- | ------------------------------------------------------ |
| Single-call overhead suite         | `simple.ts`    | Local sink + `do_not_optimize`                         |
| Chained realistic formatting suite | `complex.ts`   | Multi-style composition incl. nesting                  |
| Large repeated-string suite        | `recursion.ts` | Varying input avoids constant-folding artifacts        |
| Deferred-build composition suite   | `deferred.ts`  | Staged wrapping cost; rope render deliberately skipped |
| Import/init overhead suite         | `loading.ts`   | Dynamic import timings; requires `count === 1`         |
| Bundle size table                  | `size.ts`      | Standalone; CI size summary uses compare-size.sh       |
| Aggregation and ranking            | `../bench.ts`  | CI95 row `ansispeck/ext#1` compares root vs fastest    |
|                                    |                | EXTERNAL lib (internal `ansispeck/*` rows excluded)    |

## CONVENTIONS

- Import ansispeck via `#dist/ansispeck` / `#dist/ansispeck/*` aliases (built output), never `src/*`.
- Suite column order is fixed: `simple`, `complex`, `recursion`, `deferred-build`, `loading` (`SUITES` in bench.ts maps mitata group ids in registration order).
- Library row order is `LIB_ORDER` in bench.ts: ansispeck entrypoints first, then external libs.
- `ansispeck/noop` is the control path; interpret its wins separately.
- `bench.ts` rebuilds dist via `bun bd:ci` before running; flags: `-f/--format` (overview|markdown|md|json|quiet|mitata), `-F/--filter` regex.

## ANTI-PATTERNS

- Do not remove `do_not_optimize` calls from mutating benchmarks.
- Do not benchmark constant inputs without entropy; the optimizer skews ns-level results.
- Do not include internal `ansispeck/*` rows in the CI95 baseline comparison.
- Do not move bench.ts dispatch above its function declarations (TDZ hazard).

## NOTES

- CI bench workflow: `.github/workflows/bench.yml` + composite action `.github/actions/bench/` (runs `bench.ts -f markdown` per runtime/color mode).
- `benchmarks/internal/wasm-rust/` is a separate experiment, not registered in bench.ts.
