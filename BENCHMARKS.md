# Benchmarks

Measured with [mitata](https://github.com/evanwashere/mitata) on GCP (`Intel(R) Xeon(R) CPU @ 2.80GHz`).
Snapshot from forced-color benchmark commands:
`FORCE_COLOR=1 bun --bun bench.ts -f overview` and
`FORCE_COLOR=1 node bench.ts -f overview`.
Rankings shown per column (`*` = fastest, `#N` = Nth place).
Bottom row: ansispeck vs the fastest external library (ratio).

## Suites

| Suite              | What it measures                                                                        |
| ------------------ | --------------------------------------------------------------------------------------- |
| **simple**         | Single `red()` call — raw per-call overhead                                             |
| **complex**        | 10 nested/chained style calls — real-world formatting                                   |
| **recursion**      | `blue(red(input).repeat(10_000))` — large string with nested escapes                    |
| **deferred-build** | 32 staged wrappers over repeated payload; rope only builds chunk tree (render deferred) |
| **loading**        | `await import(...)` — module parse + init time                                          |

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
ansispeck          56.96 ns   *   129.91 ns  #4   331.61 ns  #4     1.64 µs   *
ansispeck/auto     59.73 ns  #3   128.69 ns  #2   329.94 ns  #3     1.76 µs  #4
ansispeck/raw      60.53 ns  #4   128.84 ns  #3   326.50 ns  #2     1.76 µs  #5
ansispeck/safe    123.30 ns  #5   240.90 ns  #5   365.02 ns  #5     1.75 µs  #2
ansispeck/rope    310.66 ns #12     3.71 µs #12     1.18 ms #11     1.78 µs  #6
ansispeck/noop     58.03 ns  #2    63.82 ns   *   297.92 ns   *     1.75 µs  #3
picocolors        144.87 ns  #8   603.19 ns  #6   660.85 µs  #9     2.48 µs #12
colorette         134.29 ns  #6   698.55 ns  #7     1.33 ms #12     2.24 µs  #9
kleur             151.20 ns #10     1.10 µs #10   483.55 µs  #8     2.20 µs  #8
kleur/colors      137.47 ns  #7   804.98 ns  #8   464.18 µs  #6     2.28 µs #10
chalk             146.46 ns  #9   844.53 ns  #9     1.12 ms #10     2.17 µs  #7
ansi-colors       250.63 ns #11     1.66 µs #11   480.52 µs  #7     2.46 µs #11
───────────────  ──────────────  ──────────────  ──────────────  ──────────────
ansispeck/ext#1               —               —               —               —
```

## Node 25.7.0

```text
                         simple         complex       recursion         loading
───────────────  ──────────────  ──────────────  ──────────────  ──────────────
ansispeck          44.04 ns  #4   174.98 ns  #4   166.18 ns  #2     5.03 µs  #9
ansispeck/auto     42.60 ns  #2   171.90 ns  #3   167.39 ns  #4     4.94 µs  #6
ansispeck/raw      43.51 ns  #3   170.36 ns  #2   166.86 ns  #3     4.92 µs  #5
ansispeck/safe     62.07 ns  #5   301.34 ns  #6   213.71 ns  #5     4.88 µs  #4
ansispeck/rope    531.32 ns #12     2.86 µs #12     2.18 ms #11     4.83 µs   *
ansispeck/noop     32.17 ns   *    38.19 ns   *   155.43 ns   *     4.86 µs  #3
picocolors         70.10 ns  #6   256.74 ns  #5   572.43 µs  #9     5.79 µs #12
colorette          70.10 ns  #7   398.28 ns  #7               —     5.57 µs #10
kleur              84.50 ns  #9   593.96 ns  #9   523.49 µs  #7     4.95 µs  #7
kleur/colors       75.11 ns  #8   496.00 ns  #8   521.47 µs  #6     4.85 µs  #2
chalk              85.01 ns #10   835.04 ns #10   944.52 µs #10     4.99 µs  #8
ansi-colors       275.53 ns #11     2.01 µs #11   534.66 µs  #8     5.74 µs #11
───────────────  ──────────────  ──────────────  ──────────────  ──────────────
ansispeck/ext#1               —               —               —           1.04x
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
