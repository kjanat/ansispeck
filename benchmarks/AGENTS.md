# BENCHMARK KNOWLEDGE BASE

## OVERVIEW

`benchmarks/` defines suite registration units consumed by `../bench.ts` for runtime comparison and markdown reporting.

## WHERE TO LOOK

| Task                               | Location       | Notes                                                  |
| ---------------------------------- | -------------- | ------------------------------------------------------ |
| Single-call overhead suite         | `simple.ts`    | Must keep local sink + `do_not_optimize`               |
| Chained realistic formatting suite | `complex.ts`   | Mirrors practical multi-style composition              |
| Large repeated-string suite        | `recursion.ts` | Uses varying input to avoid constant-folding artifacts |
| Import/init overhead suite         | `loading.ts`   | Dynamic import timings for each library/entrypoint     |
| Bundle size comparison             | `size.ts`      | Used by CI markdown summary                            |
| Aggregation and ranking logic      | `../bench.ts`  | CI95 row compares `ansispeck` vs fastest external lib  |

## CONVENTIONS

- Benchmark ansispeck variants via `#dist/ansispeck*` aliases, not direct `src/*` imports.
- Keep `ansispeck/noop` as control-path measurement; interpret its wins separately.
- Preserve suite names (`simple`, `complex`, `recursion`, `loading`) for stable table columns.
- Prefer local mutable `sink` + `do_not_optimize` to reduce harness-side distortion.

## ANTI-PATTERNS

- Do not remove `do_not_optimize` calls from mutating benchmarks.
- Do not benchmark constant recursion inputs without entropy; optimizer can skew ns-level results.
- Do not compare `ansispeck` CI95 baseline against internal `ansispeck/*` variants.
- Do not switch import paths to source-only aliases for published-performance claims.

## NOTES

- `just bench-md-forced` is the reproducible path used for forced-color markdown snapshots.
- CI bench workflow lives in `.github/workflows/bench.yml` and uses a custom action under `.github/actions/bench/`.
