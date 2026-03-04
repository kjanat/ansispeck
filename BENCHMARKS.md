# Benchmarks

Measured with [mitata](https://github.com/evanwashere/mitata) on GCP (`Intel(R) Xeon(R) CPU @ 2.80GHz`).
Snapshot from forced-color benchmark commands:
`FORCE_COLOR=1 bun --bun bench.ts -f overview` and
`FORCE_COLOR=1 node bench.ts -f overview`.
Rankings shown per column (`*` = fastest, `#N` = Nth place).
Bottom row: ansispeck vs the fastest external library (ratio).

## Suites

| Suite         | What it measures                                                     |
| ------------- | -------------------------------------------------------------------- |
| **simple**    | Single `red()` call — raw per-call overhead                          |
| **complex**   | 10 nested/chained style calls — real-world formatting                |
| **recursion** | `blue(red(input).repeat(10_000))` — large string with nested escapes |
| **loading**   | `await import(...)` — module parse + init time                       |

## ansispeck exports in tables

- `ansispeck`: root auto mode; picks `raw` or `noop` once at import (`FORCE_COLOR` / `--color` wins)
- `ansispeck/auto`: same as `ansispeck`, direct subpath import
- `ansispeck/raw`: always emit ANSI (fast path, no close-code repair)
- `ansispeck/safe`: template-tag API that preserves style over interpolations
- `ansispeck/rope`: chunk builder (O(1) compose + O(n) render)
- `ansispeck/noop`: control path (no ANSI, plain strings)

## Bun 1.3.10

```text
                         simple         complex       recursion         loading
───────────────  ──────────────  ──────────────  ──────────────  ──────────────
ansispeck          72.28 ns  #2   176.97 ns  #3   434.11 ns  #4     2.22 µs   *
ansispeck/auto     73.62 ns  #3   181.31 ns  #4   424.75 ns  #3     2.42 µs  #6
ansispeck/raw      76.30 ns  #4   172.95 ns  #2   424.38 ns  #2     2.31 µs  #4
ansispeck/safe    154.10 ns  #5   338.46 ns  #5   456.32 ns  #5     2.27 µs  #3
ansispeck/rope    933.63 ns #12     4.43 µs #12     1.63 ms #11     2.26 µs  #2
ansispeck/noop     71.76 ns   *    76.33 ns   *   395.09 ns   *     2.38 µs  #5
picocolors        172.69 ns  #7   801.98 ns  #6   854.10 µs  #9     3.35 µs #12
colorette         168.76 ns  #6   888.19 ns  #7     1.76 ms #12     2.84 µs  #8
kleur             187.27 ns  #9     1.40 µs  #9   653.42 µs  #7     3.24 µs #10
kleur/colors      178.84 ns  #8     1.03 µs  #8   629.58 µs  #6     2.94 µs  #9
chalk             189.12 ns #10     1.60 µs #10     1.49 ms #10     2.81 µs  #7
ansi-colors       329.21 ns #11     2.07 µs #11   660.49 µs  #8     3.24 µs #11
───────────────  ──────────────  ──────────────  ──────────────  ──────────────
ansispeck/ext#1               —               —               —               —
```

## Node 25.7.0

```text
                         simple         complex       recursion         loading
───────────────  ──────────────  ──────────────  ──────────────  ──────────────
ansispeck          53.96 ns  #3   228.39 ns  #2   184.68 ns  #4     7.52 µs  #8
ansispeck/auto     51.99 ns  #2   231.83 ns  #3   182.81 ns  #3     5.40 µs   *
ansispeck/raw      54.51 ns  #4   233.72 ns  #4   181.38 ns  #2     5.41 µs  #2
ansispeck/safe     85.73 ns  #5   438.67 ns  #6   251.43 ns  #5     5.44 µs  #3
ansispeck/rope    691.47 ns #12     3.76 µs #12     3.23 ms #11     5.45 µs  #4
ansispeck/noop     39.94 ns   *    49.66 ns   *   155.81 ns   *     5.47 µs  #5
picocolors         91.41 ns  #7   342.58 ns  #5   765.72 µs  #9    12.30 µs #12
colorette          87.24 ns  #6   542.95 ns  #7               —    10.68 µs #11
kleur             104.44 ns  #9   779.65 ns  #9   662.07 µs  #7    10.66 µs #10
kleur/colors       99.81 ns  #8   682.76 ns  #8   655.60 µs  #6     8.11 µs  #9
chalk             110.67 ns #10   981.54 ns #10     1.32 ms #10     6.14 µs  #6
ansi-colors       325.17 ns #11     2.51 µs #11   679.63 µs  #8     6.97 µs  #7
───────────────  ──────────────  ──────────────  ──────────────  ──────────────
ansispeck/ext#1               —               —               —           1.22x
```

`*` = fastest, `—` = ansispeck beats fastest external lib

## Run locally

```sh
just bench        # both runtimes, current env
just bench-bun    # bun only, current env
just bench-node   # node only, current env

# CI-parity runs
just bench-md-forced
just bench-md-auto

# Explicit env behavior (useful if .envrc sets FORCE_COLOR)
just bench-node-forced
just bench-node-auto
```
