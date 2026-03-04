# Benchmarks

Measured with [mitata](https://github.com/evanwashere/mitata) on AMD Ryzen 9 3900X.
Each runtime table uses median values across 5 full benchmark runs.
Rankings shown per column (`*` = fastest, `#N` = Nth place).
Bottom row: ansispeck vs the fastest library (median ratio).

## Suites

| Suite         | What it measures                                                     |
| ------------- | -------------------------------------------------------------------- |
| **simple**    | Single `red()` call — raw per-call overhead                          |
| **complex**   | 10 nested/chained style calls — real-world formatting                |
| **recursion** | `blue(red(input).repeat(10_000))` — large string with nested escapes |
| **loading**   | `await import(...)` — module parse + init time                       |

## Bun 1.3.10

```text
                      simple         complex       recursion         loading
────────────  ──────────────  ──────────────  ──────────────  ──────────────
ansispeck       43.30 ns   *    53.97 ns  #5   142.95 ns   *     1.48 µs   *
picocolors      44.16 ns  #2    50.12 ns  #4   146.63 ns  #2     2.17 µs  #6
colorette       47.41 ns  #4    50.02 ns  #3   158.80 ns  #6     1.98 µs  #4
kleur           50.41 ns  #5    49.53 ns   *   148.50 ns  #3     1.95 µs  #2
kleur/colors    47.38 ns  #3    49.55 ns  #2   149.19 ns  #4     2.03 µs  #5
chalk           53.07 ns  #6    75.53 ns  #6   155.34 ns  #5     1.96 µs  #3
ansi-colors    249.51 ns  #7     1.53 µs  #7   449.38 µs  #7     2.17 µs  #7
────────────  ──────────────  ──────────────  ──────────────  ──────────────
ansispeck/#1               —           1.09x               —               —
```

## Node 25.7.0

```text
                      simple         complex       recursion         loading
────────────  ──────────────  ──────────────  ──────────────  ──────────────
ansispeck       29.29 ns   *    38.45 ns  #2    65.58 ns   *     4.69 µs  #7
picocolors      35.15 ns  #6   104.66 ns  #4    69.52 ns  #6     4.59 µs  #5
colorette       31.72 ns  #3   105.36 ns  #5    69.51 ns  #5     4.60 µs  #6
kleur           33.51 ns  #5    90.32 ns  #3    67.57 ns  #3     4.56 µs  #2
kleur/colors    33.14 ns  #4    34.30 ns   *    67.46 ns  #2     4.53 µs   *
chalk           30.75 ns  #2   123.93 ns  #6    67.79 ns  #4     4.56 µs  #3
ansi-colors    270.79 ns  #7     1.92 µs  #7   480.77 µs  #7     4.58 µs  #4
────────────  ──────────────  ──────────────  ──────────────  ──────────────
ansispeck/#1               —           1.12x               —           1.04x
```

`*` = fastest, `—` = ansispeck is #1

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
