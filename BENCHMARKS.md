# Benchmarks

Measured with [mitata](https://github.com/evanwashere/mitata) in CI (GitHub
Actions `ubuntu-latest`, AMD EPYC 7763), one run per color mode × runtime, at
the pinned commit below. The bench CI workflow regenerates these tables on every
push to master.

Rankings are per column: 🥇🥈🥉 then `#N`. `†` rows are unranked — their
behavior does not match the table's color mode (`noop` does no work in a colored
run; `raw` ignores a no-color run). The `ansispeck/ext#1` footer compares
ansispeck's auto entrypoint against the fastest **external** library (Welch's
t-test CI95; `~` = not significant, `—` = ansispeck is faster).

## Suites

| Suite              | What it measures                                                        |
| ------------------ | ----------------------------------------------------------------------- |
| **simple**         | Single `red()` call — raw per-call overhead                             |
| **complex**        | 10 nested/chained style calls — real-world formatting                   |
| **recursion**      | `blue(red(input).repeat(10_000))` — large string with nested escapes    |
| **deferred-build** | 32-layer wrap pipeline × 32-repeat input — repeated wrap + flatten cost |
| **loading**        | `await import(...)` — module parse + init time                          |

## Size

| Package                            | Runtime     | Gzip    | Types   |
| ---------------------------------- | ----------- | ------- | ------- |
| [ansispeck] ([7cb5b5f][as-commit]) | **5.02 KB** | 2.14 KB | 6.09 KB |

[ansispeck]: https://npm.im/package/ansispeck/v/0.1.0
[as-commit]: https://github.com/kjanat/ansispeck/commit/7cb5b5f

## Benchmarks (FORCE_COLOR=1)

### bun 1.3.14

> AMD EPYC 7763 64-Core Processor

<!-- -->

> ansispeck exports in this table:
>
> - `ansispeck`: auto mode — picks raw or noop once at import;
>   FORCE_COLOR/`--color` wins
> - `ansispeck/auto`: same behavior as the root export, via explicit subpath
> - `ansispeck/raw`: always emits ANSI codes — the fastest path
> - `ansispeck/safe`: template-tag API preserving style across interpolations
> - `ansispeck/rope`: chunk builder — O(1) compose + O(n) render
> - `ansispeck/noop`: control path — returns plain strings

<!-- -->

> † unranked — behavior does not match this color mode

| Library                    |                      Simple |                     Complex |                   Recursion |              Deferred-build |                   Loading |
| -------------------------- | --------------------------: | --------------------------: | --------------------------: | --------------------------: | ------------------------: |
| ansispeck[^ansispeck]      |          ***117.67 ns*** 🥈 |                900.10 ns #6 |                494.71 µs #8 |                 27.86 µs #5 |                3.94 µs #5 |
| ansispeck/auto[^ansispeck] |                122.33 ns #4 |                924.52 ns #8 |                487.06 µs #6 |                 27.69 µs #4 |                3.93 µs #4 |
| ansispeck/raw[^ansispeck]  |              *121.51 ns* 🥉 |                919.70 ns #7 |                482.28 µs #5 |               *27.34 µs* 🥉 |          ***3.88 µs*** 🥈 |
| ansispeck/safe[^ansispeck] | <ins>**109.13 ns**</ins> 🥇 | <ins>**297.41 ns**</ins> 🥇 | <ins>**242.69 ns**</ins> 🥇 | <ins>**516.47 ns**</ins> 🥇 | <ins>**3.86 µs**</ins> 🥇 |
| ansispeck/rope[^ansispeck] |               265.35 ns #10 |                 3.87 µs #11 |                 1.15 ms #10 |          ***516.96 ns*** 🥈 |              *3.92 µs* 🥉 |
| ansispeck/noop[^ansispeck] |                  47.48 ns † |                  52.11 ns † |                 212.71 ns † |                 320.63 ns † |                 3.88 µs † |
| picocolors[^picocolors]    |                139.03 ns #7 |          ***515.12 ns*** 🥈 |                491.27 µs #7 |                 28.54 µs #6 |               4.96 µs #11 |
| colorette[^colorette]      |                127.79 ns #5 |              *631.09 ns* 🥉 |                 1.19 ms #11 |                 28.70 µs #7 |                4.71 µs #8 |
| kleur[^kleur]              |                133.63 ns #6 |                  1.02 µs #9 |                403.50 µs #4 |                74.30 µs #11 |                4.64 µs #6 |
| kleur/colors[^kleur]       |                156.18 ns #8 |                737.20 ns #4 |          ***389.53 µs*** 🥈 |                 70.47 µs #9 |                4.75 µs #9 |
| chalk[^chalk]              |                238.08 ns #9 |                895.96 ns #5 |                835.36 µs #9 |                 66.19 µs #8 |                4.65 µs #7 |
| ansi-colors[^ansi-colors]  |               410.10 ns #11 |                 1.66 µs #10 |              *402.92 µs* 🥉 |                74.18 µs #10 |               4.88 µs #10 |
| **ansispeck/ext#1**        |                           — |                       1.75x |                       1.27x |                           — |                         — |

[^ansispeck]: ansispeck [v0.1.0](https://npm.im/package/ansispeck/v/0.1.0 "NPM")

[^picocolors]: picocolors
    [v1.1.1](https://npm.im/package/picocolors/v/1.1.1 "NPM")

[^colorette]: colorette
    [v2.0.20](https://npm.im/package/colorette/v/2.0.20 "NPM")

[^kleur]: kleur [v4.1.5](https://npm.im/package/kleur/v/4.1.5 "NPM")

[^chalk]: chalk [v5.6.2](https://npm.im/package/chalk/v/5.6.2 "NPM")

[^ansi-colors]: ansi-colors
    [v4.1.3](https://npm.im/package/ansi-colors/v/4.1.3 "NPM")

### node 26.3.0

> AMD EPYC 7763 64-Core Processor

<!-- -->

> † unranked — behavior does not match this color mode

| Library                    |                     Simple |                     Complex |                   Recursion |              Deferred-build |                   Loading |
| -------------------------- | -------------------------: | --------------------------: | --------------------------: | --------------------------: | ------------------------: |
| ansispeck[^ansispeck]      |                72.96 ns #6 |                355.76 ns #5 |                508.09 µs #8 |                 16.40 µs #7 |                4.90 µs #9 |
| ansispeck/auto[^ansispeck] |                74.49 ns #7 |                350.02 ns #4 |                454.08 µs #7 |               *16.13 µs* 🥉 |              *4.61 µs* 🥉 |
| ansispeck/raw[^ansispeck]  |                71.89 ns #4 |              *344.39 ns* 🥉 |                448.27 µs #5 |                 16.38 µs #5 | <ins>**4.59 µs**</ins> 🥇 |
| ansispeck/safe[^ansispeck] | <ins>**62.82 ns**</ins> 🥇 |          ***289.16 ns*** 🥈 | <ins>**172.91 ns**</ins> 🥇 |            ***1.51 µs*** 🥈 |          ***4.61 µs*** 🥈 |
| ansispeck/rope[^ansispeck] |              239.27 ns #10 |                 1.20 µs #10 |                 1.37 ms #10 | <ins>**405.70 ns**</ins> 🥇 |                4.62 µs #6 |
| ansispeck/noop[^ansispeck] |                 35.24 ns † |                  39.86 ns † |                 110.86 ns † |                 357.78 ns † |                 4.59 µs † |
| picocolors[^picocolors]    |              *68.32 ns* 🥉 | <ins>**273.64 ns**</ins> 🥇 |                452.29 µs #6 |                 16.13 µs #4 |               5.96 µs #11 |
| colorette[^colorette]      |          ***67.93 ns*** 🥈 |                387.15 ns #6 |                           — |                 16.40 µs #6 |                4.80 µs #8 |
| kleur[^kleur]              |                78.19 ns #8 |                588.20 ns #8 |              *359.85 µs* 🥉 |                42.53 µs #10 |                4.77 µs #7 |
| kleur/colors[^kleur]       |                72.06 ns #5 |                504.99 ns #7 |          ***359.21 µs*** 🥈 |                 42.02 µs #8 |                4.62 µs #5 |
| chalk[^chalk]              |                82.25 ns #9 |                660.39 ns #9 |                714.64 µs #9 |                 42.18 µs #9 |                4.62 µs #4 |
| ansi-colors[^ansi-colors]  |              269.88 ns #11 |                 1.96 µs #11 |                367.98 µs #4 |                43.39 µs #11 |               5.83 µs #10 |
| **ansispeck/ext#1**        |                      1.07x |                       1.30x |                       1.41x |                     1.02x ~ |                     1.06x |

## Benchmarks (NO_COLOR=1)

### bun 1.3.14

> AMD EPYC 7763 64-Core Processor

<!-- -->

> † unranked — behavior does not match this color mode

| Library                    |                     Simple |                    Complex |                   Recursion |              Deferred-build |                   Loading |
| -------------------------- | -------------------------: | -------------------------: | --------------------------: | --------------------------: | ------------------------: |
| ansispeck[^ansispeck]      | <ins>**41.80 ns**</ins> 🥇 | <ins>**51.14 ns**</ins> 🥇 |          ***208.12 ns*** 🥈 |          ***176.34 ns*** 🥈 |                3.95 µs #4 |
| ansispeck/auto[^ansispeck] |          ***44.60 ns*** 🥈 |          ***51.70 ns*** 🥈 |                213.39 ns #6 | <ins>**167.80 ns**</ins> 🥇 |              *3.88 µs* 🥉 |
| ansispeck/raw[^ansispeck]  |                130.29 ns † |                545.70 ns † |                 470.37 µs † |                  28.51 µs † |                 3.88 µs † |
| ansispeck/safe[^ansispeck] |               102.25 ns #8 |               203.28 ns #8 |                241.06 ns #8 |                538.82 ns #9 | <ins>**3.84 µs**</ins> 🥇 |
| ansispeck/rope[^ansispeck] |               107.45 ns #9 |               523.95 ns #9 |                320.73 µs #9 |              *241.08 ns* 🥉 |          ***3.88 µs*** 🥈 |
| ansispeck/noop[^ansispeck] |                 45.92 ns † |                 52.23 ns † |                 211.68 ns † |                 317.70 ns † |                 3.91 µs † |
| picocolors[^picocolors]    |              *49.51 ns* 🥉 |                53.38 ns #6 |                213.21 ns #5 |                314.60 ns #5 |                4.97 µs #9 |
| colorette[^colorette]      |                49.59 ns #4 |                52.66 ns #5 |                212.41 ns #4 |                312.86 ns #4 |                4.70 µs #7 |
| kleur[^kleur]              |                52.06 ns #6 |              *51.74 ns* 🥉 | <ins>**207.96 ns**</ins> 🥇 |                486.39 ns #7 |                4.61 µs #6 |
| kleur/colors[^kleur]       |                54.00 ns #7 |                52.08 ns #4 |              *208.68 ns* 🥉 |                352.70 ns #6 |                4.74 µs #8 |
| chalk[^chalk]              |                51.66 ns #5 |                81.66 ns #7 |                231.10 ns #7 |                527.75 ns #8 |                4.60 µs #5 |
| ansi-colors[^ansi-colors]  |              244.05 ns #10 |                1.60 µs #10 |               436.62 µs #10 |                78.71 µs #10 |               5.10 µs #10 |
| **ansispeck/ext#1**        |                          — |                          — |                     1.00x ~ |                           — |                         — |

### node 26.3.0

> AMD EPYC 7763 64-Core Processor

<!-- -->

> † unranked — behavior does not match this color mode

| Library                    |                     Simple |                    Complex |                   Recursion |              Deferred-build |                   Loading |
| -------------------------- | -------------------------: | -------------------------: | --------------------------: | --------------------------: | ------------------------: |
| ansispeck[^ansispeck]      |              *34.62 ns* 🥉 | <ins>**38.04 ns**</ins> 🥇 |                117.93 ns #7 |              *251.65 ns* 🥉 |                4.97 µs #8 |
| ansispeck/auto[^ansispeck] | <ins>**34.12 ns**</ins> 🥇 |          ***38.28 ns*** 🥈 |              *111.93 ns* 🥉 |          ***250.95 ns*** 🥈 |              *4.69 µs* 🥉 |
| ansispeck/raw[^ansispeck]  |                 74.47 ns † |                366.34 ns † |                 563.95 µs † |                  16.24 µs † |                 4.71 µs † |
| ansispeck/safe[^ansispeck] |                55.53 ns #8 |               203.67 ns #8 |                154.61 ns #8 |                970.66 ns #9 |          ***4.68 µs*** 🥈 |
| ansispeck/rope[^ansispeck] |                99.66 ns #9 |               490.11 ns #9 |                270.75 µs #9 | <ins>**117.50 ns**</ins> 🥇 |                4.70 µs #4 |
| ansispeck/noop[^ansispeck] |                 33.27 ns † |                 39.51 ns † |                 111.99 ns † |                 350.11 ns † |                 4.71 µs † |
| picocolors[^picocolors]    |                40.16 ns #7 |               100.88 ns #6 |                115.76 ns #5 |                292.48 ns #6 |                6.04 µs #9 |
| colorette[^colorette]      |                38.45 ns #6 |                97.06 ns #5 |                115.77 ns #6 |                286.87 ns #5 |                4.86 µs #7 |
| kleur[^kleur]              |                36.74 ns #4 |                81.76 ns #4 |          ***110.16 ns*** 🥈 |                286.79 ns #4 |                4.83 µs #5 |
| kleur/colors[^kleur]       |          ***34.51 ns*** 🥈 |              *40.60 ns* 🥉 |                113.86 ns #4 |                307.01 ns #7 |                4.85 µs #6 |
| chalk[^chalk]              |                36.81 ns #5 |               106.88 ns #7 | <ins>**107.71 ns**</ins> 🥇 |                407.84 ns #8 | <ins>**4.66 µs**</ins> 🥇 |
| ansi-colors[^ansi-colors]  |              254.78 ns #10 |                1.97 µs #10 |               531.04 µs #10 |                44.41 µs #10 |               6.22 µs #10 |
| **ansispeck/ext#1**        |                    1.00x ~ |                          — |                       1.09x |                           — |                     1.07x |

## Run locally

```sh
bun run bench          # both runtimes, auto color detection
just bench             # same, via justfile
just bench-forced      # FORCE_COLOR=1, both runtimes
just bench-md-forced   # markdown output, FORCE_COLOR=1

# CI-parity single runs
FORCE_COLOR=1 bun --bun bench.ts -f markdown
FORCE_COLOR=1 node bench.ts -f markdown
NO_COLOR=1 bun --bun bench.ts -f markdown
NO_COLOR=1 node bench.ts -f markdown
```
