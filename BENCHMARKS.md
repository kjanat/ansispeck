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

- `ansispeck`: root auto mode; picks `raw` or `noop` once at import from env/argv/TTY checks
- `ansispeck/auto`: same as `ansispeck`, direct subpath import
- `ansispeck/raw`: always emit ANSI (fast path, no close-code repair)
- `ansispeck/safe`: template-tag API that preserves style over interpolations
- `ansispeck/rope`: chunk builder (O(1) compose + O(n) render)
- `ansispeck/noop`: control path (no ANSI, plain strings)

## Bun 1.3.10

```text
                         simple         complex       recursion         loading
───────────────  ──────────────  ──────────────  ──────────────  ──────────────
ansispeck          70.86 ns  #2   167.50 ns  #2   422.65 ns  #4     2.09 µs   *
ansispeck/auto     73.09 ns  #3   167.53 ns  #3   413.63 ns  #2     2.23 µs  #5
ansispeck/raw      73.69 ns  #4   168.35 ns  #4   417.91 ns  #3     2.20 µs  #2
ansispeck/noop     69.60 ns   *    76.44 ns   *   386.24 ns   *     2.21 µs  #4
ansispeck/safe    151.44 ns  #5   321.79 ns  #5   442.48 ns  #5     2.28 µs  #6
ansispeck/rope    387.84 ns #12     4.38 µs #12     1.70 ms #11     2.20 µs  #3
picocolors        179.22 ns  #8   725.40 ns  #6   877.38 µs  #9     3.18 µs #12
colorette         174.86 ns  #7   857.03 ns  #7     1.73 ms #12     2.73 µs  #8
kleur             186.07 ns #10     1.36 µs #10   647.52 µs  #7     2.77 µs  #9
kleur/colors      172.28 ns  #6   995.84 ns  #8   611.85 µs  #6     2.82 µs #10
chalk             181.16 ns  #9     1.06 µs  #9     1.47 ms #10     2.71 µs  #7
ansi-colors       316.61 ns #11     2.18 µs #11   650.51 µs  #8     3.16 µs #11
───────────────  ──────────────  ──────────────  ──────────────  ──────────────
ansispeck/ext#1               —               —               —               —
```

## Node 25.7.0

```text
                         simple         complex       recursion         loading
───────────────  ──────────────  ──────────────  ──────────────  ──────────────
ansispeck          51.23 ns  #4   225.64 ns  #3   178.32 ns  #2     5.57 µs  #7
ansispeck/auto     48.80 ns  #2   226.33 ns  #4   178.44 ns  #3     5.42 µs  #6
ansispeck/raw      50.39 ns  #3   223.38 ns  #2   178.61 ns  #4     5.38 µs  #3
ansispeck/noop     39.43 ns   *    45.09 ns   *   149.95 ns   *     5.39 µs  #4
ansispeck/safe     84.44 ns  #5   433.94 ns  #6   241.56 ns  #5     5.40 µs  #5
ansispeck/rope    703.68 ns #12     2.67 µs #12     3.19 ms #11     5.37 µs   *
picocolors         91.19 ns  #7   332.45 ns  #5   752.79 µs  #9     7.16 µs #12
colorette          88.03 ns  #6   536.51 ns  #7               —     6.77 µs #10
kleur             101.28 ns  #9   772.04 ns  #9   636.66 µs  #7     5.61 µs  #8
kleur/colors       96.64 ns  #8   630.27 ns  #8   632.12 µs  #6     5.38 µs  #2
chalk             109.28 ns #10   919.60 ns #10     1.27 ms #10     6.47 µs  #9
ansi-colors       327.74 ns #11     2.35 µs #11   652.24 µs  #8     7.01 µs #11
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
