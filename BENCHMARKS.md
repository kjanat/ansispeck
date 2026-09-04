# Benchmarks

Measured with [mitata](https://github.com/evanwashere/mitata) in CI (GitHub Actions `ubuntu-latest`, AMD EPYC 7763), one run per color mode × runtime, at the pinned commit below. The [benchmark workflow](.github/workflows/bench.yml) produces a fresh source report on every push to master; this file records the reviewed snapshot.

Rankings are per column: 🥇🥈🥉 then `#N`. `†` rows are excluded from ranking: `noop` is the control row in both modes, and `raw` is also excluded from no-color runs because it intentionally emits ANSI. The `ansispeck/ext#1` footer compares ansispeck's root entrypoint against the fastest **external** library ([Welch's *t*-test][t-test] CI95; `~` = not significant, `—` = ansispeck is faster). `DNF` means the library failed while running that benchmark, so there is no result to report.

[t-test]: https://en.wikipedia.org/wiki/Welch%27s_t-test

## Suites

| Suite                                        | What it measures                                                                    |
| -------------------------------------------- | ----------------------------------------------------------------------------------- |
| [**simple**](benchmarks/simple.ts)           | One `red()` operation — per-call formatting overhead                                |
| [**complex**](benchmarks/complex.ts)         | Eight formatter calls composing a nested, styled log message                        |
| [**recursion**](benchmarks/recursion.ts)     | `blue(red(input).repeat(10_000))` — large string with nested escapes                |
| [**deferred-build**](benchmarks/deferred.ts) | 32 wrapping stages over 32 repeated inputs — deferred chunks versus eager strings   |
| [**loading**](benchmarks/loading.ts)         | Fresh runtime process importing each package from an isolated local-tarball install |

## Size

| Package                                      | Runtime     | Gzip    | Types    |
| -------------------------------------------- | ----------- | ------- | -------- |
| [ansispeck] ([v0.4.2-4-gb83253f][as-commit]) | **5.54 KB** | 2.44 KB | 15.80 KB |

[ansispeck]: https://npm.im/package/ansispeck/v/0.4.2
[as-commit]: https://github.com/kjanat/ansispeck/commit/b83253f5b6702d6d669c1e094ccc4e400653ddb9

## Benchmarks (FORCE_COLOR=1)

### bun 1.4.0

> AMD EPYC 7763 64-Core Processor

<!-- -->

> ansispeck exports in this table:
>
> - `ansispeck`: auto mode — picks raw or noop once at import; FORCE_COLOR/`--color` wins
> - `ansispeck/auto`: same behavior as the root export, via explicit subpath
> - `ansispeck/raw`: always emits ANSI codes
> - `ansispeck/safe`: template-tag API preserving style across interpolations
> - `ansispeck/rope`: chunk builder — O(1) compose + O(n) render
> - `ansispeck/noop`: control path — returns plain strings

<!-- -->

> † excluded from ranking — `noop` is the control; `raw` is also excluded in no-color runs
>
> Cold load starts an isolated runtime process using packages installed from local tarballs.

| Library                    |                     Simple |                     Complex |                   Recursion |              Deferred-build |                 Cold load |
| -------------------------- | -------------------------: | --------------------------: | --------------------------: | --------------------------: | ------------------------: |
| ansispeck[^ansispeck]      |               109.50 ns #5 |                473.22 ns #4 |                452.05 µs #5 |                 25.71 µs #6 |               21.42 ms #8 |
| ansispeck/auto[^ansispeck] |         ***100.27 ns*** 🥈 |                478.23 ns #5 |                487.19 µs #8 |               *25.44 µs* 🥉 |               21.39 ms #7 |
| ansispeck/raw[^ansispeck]  |               109.97 ns #6 |              *472.96 ns* 🥉 |                470.95 µs #6 |                 25.47 µs #4 |               21.26 ms #6 |
| ansispeck/safe[^ansispeck] | <ins>**89.32 ns**</ins> 🥇 | <ins>**191.99 ns**</ins> 🥇 | <ins>**214.88 ns**</ins> 🥇 | <ins>**508.16 ns**</ins> 🥇 |               21.59 ms #9 |
| ansispeck/rope[^ansispeck] |               209.93 ns #9 |                 1.44 µs #10 |                 1.43 ms #11 |          ***510.60 ns*** 🥈 |              22.07 ms #11 |
| ansispeck/noop[^ansispeck] |                 41.84 ns † |                  47.88 ns † |                 177.75 ns † |                 315.78 ns † |                21.43 ms † |
| picocolors[^picocolors]    |               116.10 ns #7 |          ***469.00 ns*** 🥈 |                477.66 µs #7 |                 25.50 µs #5 | <ins>**7.32 ms**</ins> 🥇 |
| colorette[^colorette]      |              335.95 ns #11 |                599.03 ns #6 |                 1.15 ms #10 |                 26.39 µs #7 |             *19.59 ms* 🥉 |
| kleur[^kleur]              |               108.79 ns #4 |                749.77 ns #8 |          ***430.78 µs*** 🥈 |                73.40 µs #10 |               20.06 ms #5 |
| kleur/colors[^kleur]       |             *105.58 ns* 🥉 |                670.20 ns #7 |                433.83 µs #4 |                 69.68 µs #9 |               19.91 ms #4 |
| chalk[^chalk]              |               121.11 ns #8 |                757.92 ns #9 |                737.06 µs #9 |                 56.22 µs #8 |              21.87 ms #10 |
| ansi-colors[^ansi-colors]  |              231.77 ns #10 |                 1.51 µs #11 |              *433.15 µs* 🥉 |                74.26 µs #11 |          ***8.49 ms*** 🥈 |
| **ansispeck/ext#1**        |                      1.04x |                     1.01x ~ |                     1.05x ~ |                     1.01x ~ |                     2.93x |

[^ansispeck]: ansispeck [v0.4.2-4-gb83253f](https://github.com/kjanat/ansispeck/commit/b83253f5b6702d6d669c1e094ccc4e400653ddb9 "GitHub")

[^picocolors]: picocolors [v1.1.1](https://npm.im/package/picocolors/v/1.1.1 "NPM")

[^colorette]: colorette [v2.0.20](https://npm.im/package/colorette/v/2.0.20 "NPM")

[^kleur]: kleur [v4.1.5](https://npm.im/package/kleur/v/4.1.5 "NPM")

[^chalk]: chalk [v6.0.0](https://npm.im/package/chalk/v/6.0.0 "NPM")

[^ansi-colors]: ansi-colors [v4.1.3](https://npm.im/package/ansi-colors/v/4.1.3 "NPM")

### deno 2.9.6

> AMD EPYC 7763 64-Core Processor

<!-- -->

> † excluded from ranking — `noop` is the control; `raw` is also excluded in no-color runs

| Library                    |                     Simple |                     Complex |                   Recursion |              Deferred-build |                  Cold load |
| -------------------------- | -------------------------: | --------------------------: | --------------------------: | --------------------------: | -------------------------: |
| ansispeck[^ansispeck]      |                68.04 ns #4 |                347.59 ns #4 |                493.25 µs #7 |                 16.03 µs #4 |                41.15 ms #6 |
| ansispeck/auto[^ansispeck] |                70.03 ns #6 |              *343.00 ns* 🥉 |                469.52 µs #6 |                 16.30 µs #7 |                41.07 ms #5 |
| ansispeck/raw[^ansispeck]  |                69.28 ns #5 |                350.77 ns #5 |                427.52 µs #5 |               *15.96 µs* 🥉 |          ***39.16 ms*** 🥈 |
| ansispeck/safe[^ansispeck] | <ins>**57.64 ns**</ins> 🥇 |          ***278.76 ns*** 🥈 | <ins>**169.28 ns**</ins> 🥇 |            ***1.31 µs*** 🥈 |              *40.14 ms* 🥉 |
| ansispeck/rope[^ansispeck] |              235.35 ns #10 |                 1.29 µs #10 |                 1.43 ms #10 | <ins>**590.63 ns**</ins> 🥇 |                40.63 ms #4 |
| ansispeck/noop[^ansispeck] |                 30.87 ns † |                  36.13 ns † |                 108.26 ns † |                 352.05 ns † |                 39.13 ms † |
| picocolors[^picocolors]    |          ***66.66 ns*** 🥈 | <ins>**249.88 ns**</ins> 🥇 |                508.87 µs #8 |                 16.20 µs #5 |                41.93 ms #8 |
| colorette[^colorette]      |              *66.77 ns* 🥉 |                385.78 ns #6 |                         DNF |                 16.23 µs #6 |                42.25 ms #9 |
| kleur[^kleur]              |                79.75 ns #8 |                577.70 ns #8 |          ***353.98 µs*** 🥈 |                42.69 µs #10 |                41.25 ms #7 |
| kleur/colors[^kleur]       |                75.00 ns #7 |                516.54 ns #7 |              *356.58 µs* 🥉 |                 42.30 µs #9 | <ins>**39.08 ms**</ins> 🥇 |
| chalk[^chalk]              |                80.69 ns #9 |                646.20 ns #9 |                735.02 µs #9 |                 42.21 µs #8 |               44.52 ms #11 |
| ansi-colors[^ansi-colors]  |              241.36 ns #11 |                 1.83 µs #11 |                357.81 µs #4 |                43.79 µs #11 |               43.68 ms #10 |
| **ansispeck/ext#1**        |                      1.02x |                       1.39x |                       1.39x |                           — |                    1.05x ~ |

### node 26.7.0

> AMD EPYC 7763 64-Core Processor

<!-- -->

> † excluded from ranking — `noop` is the control; `raw` is also excluded in no-color runs

| Library                    |                     Simple |                     Complex |                   Recursion |              Deferred-build |                  Cold load |
| -------------------------- | -------------------------: | --------------------------: | --------------------------: | --------------------------: | -------------------------: |
| ansispeck[^ansispeck]      |                72.00 ns #5 |              *337.72 ns* 🥉 |                499.55 µs #8 |                 16.13 µs #7 |                29.02 ms #5 |
| ansispeck/auto[^ansispeck] |                73.84 ns #6 |                341.64 ns #5 |                485.30 µs #7 |                 16.04 µs #6 |                29.24 ms #7 |
| ansispeck/raw[^ansispeck]  |          ***68.52 ns*** 🥈 |                341.62 ns #4 |                442.16 µs #5 |                 15.97 µs #5 |                28.97 ms #4 |
| ansispeck/safe[^ansispeck] | <ins>**60.41 ns**</ins> 🥇 |          ***278.53 ns*** 🥈 | <ins>**176.03 ns**</ins> 🥇 |            ***1.59 µs*** 🥈 |                30.20 ms #9 |
| ansispeck/rope[^ansispeck] |              250.19 ns #10 |                 1.28 µs #10 |                 1.35 ms #10 | <ins>**593.62 ns**</ins> 🥇 |                29.67 ms #8 |
| ansispeck/noop[^ansispeck] |                 32.75 ns † |                  39.02 ns † |                 111.97 ns † |                 362.50 ns † |                 29.38 ms † |
| picocolors[^picocolors]    |              *69.06 ns* 🥉 | <ins>**264.04 ns**</ins> 🥇 |                446.09 µs #6 |                 15.78 µs #4 | <ins>**26.96 ms**</ins> 🥇 |
| colorette[^colorette]      |                69.52 ns #4 |                404.22 ns #6 |                         DNF |               *15.75 µs* 🥉 |               30.27 ms #10 |
| kleur[^kleur]              |                87.92 ns #9 |                538.66 ns #8 |              *359.40 µs* 🥉 |                41.96 µs #10 |                29.12 ms #6 |
| kleur/colors[^kleur]       |                78.17 ns #7 |                497.34 ns #7 |          ***356.92 µs*** 🥈 |                 41.83 µs #9 |              *28.34 ms* 🥉 |
| chalk[^chalk]              |                80.17 ns #8 |                643.97 ns #9 |                686.80 µs #9 |                 41.65 µs #8 |               39.52 ms #11 |
| ansi-colors[^ansi-colors]  |              265.11 ns #11 |                 2.08 µs #11 |                367.20 µs #4 |                42.69 µs #11 |          ***28.25 ms*** 🥈 |
| **ansispeck/ext#1**        |                      1.04x |                       1.28x |                       1.40x |                     1.02x ~ |                      1.08x |

## Benchmarks (NO_COLOR=1)

### bun 1.4.0

> AMD EPYC 7763 64-Core Processor

<!-- -->

> † excluded from ranking — `noop` is the control; `raw` is also excluded in no-color runs

| Library                    |                     Simple |                    Complex |                   Recursion |              Deferred-build |                 Cold load |
| -------------------------- | -------------------------: | -------------------------: | --------------------------: | --------------------------: | ------------------------: |
| ansispeck[^ansispeck]      | <ins>**38.18 ns**</ins> 🥇 | <ins>**50.17 ns**</ins> 🥇 | <ins>**192.60 ns**</ins> 🥇 |          ***155.86 ns*** 🥈 |               21.20 ms #8 |
| ansispeck/auto[^ansispeck] |          ***39.88 ns*** 🥈 |                52.36 ns #4 |                198.98 ns #4 | <ins>**154.97 ns**</ins> 🥇 |               20.86 ms #6 |
| ansispeck/raw[^ansispeck]  |                108.74 ns † |                484.64 ns † |                 535.63 µs † |                  26.29 µs † |                21.00 ms † |
| ansispeck/safe[^ansispeck] |                91.76 ns #8 |               190.47 ns #8 |                216.98 ns #8 |                549.61 ns #9 |               21.11 ms #7 |
| ansispeck/rope[^ansispeck] |                97.09 ns #9 |               602.82 ns #9 |                385.91 µs #9 |              *223.38 ns* 🥉 |               21.38 ms #9 |
| ansispeck/noop[^ansispeck] |                 46.12 ns † |                 49.71 ns † |                 184.56 ns † |                 287.91 ns † |                20.75 ms † |
| picocolors[^picocolors]    |                47.21 ns #5 |                53.20 ns #5 |              *196.92 ns* 🥉 |                287.88 ns #5 | <ins>**7.29 ms**</ins> 🥇 |
| colorette[^colorette]      |              *46.24 ns* 🥉 |              *51.89 ns* 🥉 |                200.60 ns #5 |                286.67 ns #4 |             *19.91 ms* 🥉 |
| kleur[^kleur]              |                47.65 ns #6 |          ***51.48 ns*** 🥈 |          ***196.31 ns*** 🥈 |                468.90 ns #7 |               19.93 ms #4 |
| kleur/colors[^kleur]       |                46.29 ns #4 |                53.41 ns #6 |                202.27 ns #6 |                333.06 ns #6 |               19.94 ms #5 |
| chalk[^chalk]              |                51.89 ns #7 |               103.62 ns #7 |                209.92 ns #7 |                513.66 ns #8 |              21.56 ms #10 |
| ansi-colors[^ansi-colors]  |              221.63 ns #10 |                1.61 µs #10 |               428.32 µs #10 |                75.02 µs #10 |          ***8.76 ms*** 🥈 |
| **ansispeck/ext#1**        |                          — |                          — |                           — |                           — |                     2.91x |

### deno 2.9.6

> AMD EPYC 7763 64-Core Processor

<!-- -->

> † excluded from ranking — `noop` is the control; `raw` is also excluded in no-color runs

| Library                    |                     Simple |                    Complex |                   Recursion |              Deferred-build |                  Cold load |
| -------------------------- | -------------------------: | -------------------------: | --------------------------: | --------------------------: | -------------------------: |
| ansispeck[^ansispeck]      | <ins>**30.25 ns**</ins> 🥇 | <ins>**35.36 ns**</ins> 🥇 |                109.82 ns #5 |          ***245.23 ns*** 🥈 |              *39.00 ms* 🥉 |
| ansispeck/auto[^ansispeck] |                37.81 ns #6 |          ***35.54 ns*** 🥈 |              *105.53 ns* 🥉 |              *248.04 ns* 🥉 |                39.74 ms #4 |
| ansispeck/raw[^ansispeck]  |                 70.21 ns † |                359.24 ns † |                 480.57 µs † |                  15.73 µs † |                 39.91 ms † |
| ansispeck/safe[^ansispeck] |                52.28 ns #8 |               192.26 ns #8 |                148.37 ns #8 |                  1.18 µs #9 |                39.81 ms #5 |
| ansispeck/rope[^ansispeck] |                99.38 ns #9 |               556.90 ns #9 |                263.44 µs #9 | <ins>**117.66 ns**</ins> 🥇 |                40.01 ms #6 |
| ansispeck/noop[^ansispeck] |                 31.07 ns † |                 35.99 ns † |                 108.58 ns † |                 348.77 ns † |                 38.06 ms † |
| picocolors[^picocolors]    |                42.06 ns #7 |                97.84 ns #6 |                114.94 ns #6 |                280.52 ns #4 |                41.29 ms #7 |
| colorette[^colorette]      |                36.78 ns #5 |                93.94 ns #5 |                117.32 ns #7 |                281.46 ns #5 |                42.25 ms #8 |
| kleur[^kleur]              |              *33.59 ns* 🥉 |                78.33 ns #4 |                106.91 ns #4 |                283.63 ns #6 |          ***38.36 ms*** 🥈 |
| kleur/colors[^kleur]       |          ***32.31 ns*** 🥈 |              *38.94 ns* 🥉 |          ***105.43 ns*** 🥈 |                298.64 ns #7 | <ins>**37.59 ms**</ins> 🥇 |
| chalk[^chalk]              |                35.56 ns #4 |               114.51 ns #7 | <ins>**104.65 ns**</ins> 🥇 |                402.92 ns #8 |               44.28 ms #10 |
| ansi-colors[^ansi-colors]  |              235.20 ns #10 |                1.94 µs #10 |               528.98 µs #10 |                43.51 µs #10 |                43.86 ms #9 |
| **ansispeck/ext#1**        |                          — |                          — |                       1.05x |                           — |                    1.04x ~ |

### node 26.7.0

> AMD EPYC 7763 64-Core Processor

<!-- -->

> † excluded from ranking — `noop` is the control; `raw` is also excluded in no-color runs

| Library                    |                     Simple |                    Complex |                   Recursion |              Deferred-build |                  Cold load |
| -------------------------- | -------------------------: | -------------------------: | --------------------------: | --------------------------: | -------------------------: |
| ansispeck[^ansispeck]      |              *34.73 ns* 🥉 |          ***38.04 ns*** 🥈 |                110.92 ns #4 |              *251.85 ns* 🥉 |                29.49 ms #7 |
| ansispeck/auto[^ansispeck] | <ins>**33.63 ns**</ins> 🥇 | <ins>**37.75 ns**</ins> 🥇 |              *109.89 ns* 🥉 |          ***250.97 ns*** 🥈 |                28.75 ms #4 |
| ansispeck/raw[^ansispeck]  |                 68.92 ns † |                331.77 ns † |                 553.54 µs † |                  15.87 µs † |                 29.31 ms † |
| ansispeck/safe[^ansispeck] |                53.10 ns #8 |               193.99 ns #8 |                154.42 ns #8 |                  1.02 µs #9 |                30.13 ms #9 |
| ansispeck/rope[^ansispeck] |               106.45 ns #9 |               556.16 ns #9 |                274.76 µs #9 | <ins>**126.29 ns**</ins> 🥇 |                29.29 ms #6 |
| ansispeck/noop[^ansispeck] |                 33.78 ns † |                 37.88 ns † |                 109.73 ns † |                 346.97 ns † |                 29.07 ms † |
| picocolors[^picocolors]    |                38.91 ns #7 |                98.79 ns #6 |                112.66 ns #6 |                293.67 ns #6 | <ins>**26.93 ms**</ins> 🥇 |
| colorette[^colorette]      |                38.40 ns #6 |                98.11 ns #5 |                112.50 ns #5 |                290.26 ns #5 |                29.99 ms #8 |
| kleur[^kleur]              |                38.18 ns #5 |                80.26 ns #4 |                114.15 ns #7 |                289.46 ns #4 |          ***28.05 ms*** 🥈 |
| kleur/colors[^kleur]       |          ***34.03 ns*** 🥈 |              *39.84 ns* 🥉 |          ***109.16 ns*** 🥈 |                304.57 ns #7 |                29.07 ms #5 |
| chalk[^chalk]              |                36.17 ns #4 |               113.87 ns #7 | <ins>**108.61 ns**</ins> 🥇 |                407.62 ns #8 |               39.90 ms #10 |
| ansi-colors[^ansi-colors]  |              261.44 ns #10 |                1.99 µs #10 |               544.36 µs #10 |                42.70 µs #10 |              *28.20 ms* 🥉 |
| **ansispeck/ext#1**        |                      1.02x |                          — |                       1.02x |                           — |                      1.10x |

## Run locally

Use the package scripts or the recipes in the [justfile](justfile).\
For an individual runtime or output format, invoke the [benchmark CLI](benchmarks/bench.ts) directly:

```sh
bun run bench          # both runtimes, auto color detection
just bench             # same, via justfile
just bench-forced      # FORCE_COLOR=1, both runtimes
just bench-md-forced   # markdown output, FORCE_COLOR=1

# Single-runtime Markdown runs
FORCE_COLOR=1 bun --bun benchmarks/bench.ts -f markdown
FORCE_COLOR=1 deno run -A benchmarks/bench.ts -f markdown
FORCE_COLOR=1 node benchmarks/bench.ts -f markdown
NO_COLOR=1 bun --bun benchmarks/bench.ts -f markdown
NO_COLOR=1 deno run -A benchmarks/bench.ts -f markdown
NO_COLOR=1 node benchmarks/bench.ts -f markdown
```
