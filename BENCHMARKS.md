# Benchmarks

Measured with [mitata](https://github.com/evanwashere/mitata) on AMD Ryzen 9 3900X.
Rankings shown per column (`*` = fastest, `#N` = Nth place).
Bottom row: femtocolors vs the fastest library (Welch's t-test, 95% CI).

## Suites

| Suite         | What it measures                                                     |
| ------------- | -------------------------------------------------------------------- |
| **simple**    | Single `red()` call — raw per-call overhead                          |
| **complex**   | 10 nested/chained style calls — real-world formatting                |
| **recursion** | `blue(red(input).repeat(10_000))` — large string with nested escapes |
| **loading**   | `await import(...)` — module parse + init time                       |

## Bun 1.3.10

```
                      simple         complex       recursion         loading
────────────  ──────────────  ──────────────  ──────────────  ──────────────
femtocolors     39.05 ns  #2    51.16 ns  #5   141.52 ns   *     1.47 µs   *
picocolors      39.56 ns  #3    48.39 ns  #4   157.03 ns  #5     2.19 µs  #7
colorette       38.70 ns   *    46.34 ns  #2   157.01 ns  #4     1.93 µs  #3
kleur           49.20 ns  #5    46.28 ns   *   151.77 ns  #3     1.92 µs  #2
kleur/colors    45.45 ns  #4    46.44 ns  #3   149.87 ns  #2     2.02 µs  #5
chalk           51.62 ns  #6    78.72 ns  #6   159.87 ns  #6     1.95 µs  #4
ansi-colors    244.36 ns  #7     1.51 µs  #7   440.93 µs  #7     2.15 µs  #6
────────────  ──────────────  ──────────────  ──────────────  ──────────────
femto/#1               1.01x           1.11x               —               —
```

## Node 25.7.0

```
                      simple         complex       recursion         loading
────────────  ──────────────  ──────────────  ──────────────  ──────────────
femtocolors     17.96 ns   *    21.98 ns   *    64.33 ns   *     4.62 µs  #5
picocolors      22.51 ns  #5    62.68 ns  #5    68.31 ns  #4     4.62 µs  #4
colorette       22.62 ns  #6    57.19 ns  #4    68.88 ns  #5     4.65 µs  #6
kleur           19.27 ns  #2    45.14 ns  #3    67.90 ns  #3     4.61 µs  #2
kleur/colors    20.31 ns  #4    24.95 ns  #2    72.72 ns  #6     4.56 µs   *
chalk           20.04 ns  #3    66.15 ns  #6    67.49 ns  #2     4.65 µs  #7
ansi-colors    257.81 ns  #7     1.88 µs  #7   469.06 µs  #7     4.62 µs  #3
────────────  ──────────────  ──────────────  ──────────────  ──────────────
femto/#1                   —               —               —         1.01x ~
```

`*` = fastest, `—` = femtocolors is #1, `~` = not significant

## Run locally

```sh
bun bench        # both runtimes
bun bench:bun    # bun only
bun bench:node   # node only
```
