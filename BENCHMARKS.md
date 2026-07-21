# Benchmarks

Measured with [mitata](https://github.com/evanwashere/mitata) in CI (GitHub
Actions `ubuntu-latest`, AMD EPYC 7763), one run per color mode × runtime, at
the pinned commit below. The [benchmark workflow](.github/workflows/bench.yml)
produces a fresh source report on every push to master; this file records the
reviewed snapshot.

Rankings are per column: 🥇🥈🥉 then `#N`. `†` rows are excluded from ranking:
`noop` is the control row in both modes, and `raw` is also excluded from
no-color runs because it intentionally emits ANSI. The `ansispeck/ext#1` footer
compares ansispeck's auto entrypoint against the fastest **external** library
([Welch's *t*-test](https://en.wikipedia.org/wiki/Welch%27s_t-test) CI95; `~` =
not significant, `—` = ansispeck is faster). `DNF` means the library failed
while running that benchmark, so there is no result to report.

## Suites

| Suite                                        | What it measures                                                                    |
| -------------------------------------------- | ----------------------------------------------------------------------------------- |
| [**simple**](benchmarks/simple.ts)           | One `red()` operation — per-call formatting overhead                                |
| [**complex**](benchmarks/complex.ts)         | Eight formatter calls composing a nested, styled log message                        |
| [**recursion**](benchmarks/recursion.ts)     | `blue(red(input).repeat(10_000))` — large string with nested escapes                |
| [**deferred-build**](benchmarks/deferred.ts) | 32 wrapping stages over 32 repeated inputs — deferred chunks versus eager strings   |
| [**loading**](benchmarks/loading.ts)         | Fresh runtime process importing each package from an isolated local-tarball install |

## Size

| Package                            | Runtime     | Gzip    | Types    |
| ---------------------------------- | ----------- | ------- | -------- |
| [ansispeck] ([7795787][as-commit]) | **5.54 KB** | 2.44 KB | 15.83 KB |

[ansispeck]: https://npm.im/package/ansispeck/v/0.4.0
[as-commit]: https://github.com/kjanat/ansispeck/commit/77957873765ec2d2b4f16577fc2dde20c1970a2f

## Benchmarks (FORCE_COLOR=1)

### bun 1.3.14

> AMD EPYC 7763 64-Core Processor

<!-- -->

> ansispeck exports in this table:
>
> - `ansispeck`: auto mode — picks raw or noop once at import;
>   FORCE_COLOR/`--color` wins
> - `ansispeck/auto`: same behavior as the root export, via explicit subpath
> - `ansispeck/raw`: always emits ANSI codes
> - `ansispeck/safe`: template-tag API preserving style across interpolations
> - `ansispeck/rope`: chunk builder — O(1) compose + O(n) render
> - `ansispeck/noop`: control path — returns plain strings

<!-- -->

> † excluded from ranking — `noop` is the control; `raw` is also excluded in
> no-color runs
>
> Cold load starts an isolated runtime process using packages installed from
> local tarballs.

| Library                    |                      Simple |                     Complex |                   Recursion |              Deferred-build |                  Cold load |
| -------------------------- | --------------------------: | --------------------------: | --------------------------: | --------------------------: | -------------------------: |
| ansispeck[^ansispeck]      |          ***115.02 ns*** 🥈 |                508.25 ns #4 |                603.04 µs #6 |                 32.22 µs #7 |                30.66 ms #4 |
| ansispeck/auto[^ansispeck] |                129.13 ns #5 |              *503.36 ns* 🥉 |                577.45 µs #5 |                 30.06 µs #5 |                30.97 ms #6 |
| ansispeck/raw[^ansispeck]  |              *125.36 ns* 🥉 |                508.28 ns #5 |                608.16 µs #7 |                 29.45 µs #4 |                31.60 ms #9 |
| ansispeck/safe[^ansispeck] | <ins>**102.43 ns**</ins> 🥇 | <ins>**205.85 ns**</ins> 🥇 | <ins>**235.00 ns**</ins> 🥇 |          ***520.70 ns*** 🥈 |               33.62 ms #10 |
| ansispeck/rope[^ansispeck] |               271.13 ns #11 |                 3.80 µs #11 |                 1.13 ms #10 | <ins>**499.60 ns**</ins> 🥇 |                30.67 ms #5 |
| ansispeck/noop[^ansispeck] |                  48.08 ns † |                  52.57 ns † |                 211.77 ns † |                 325.08 ns † |                 30.86 ms † |
| picocolors[^picocolors]    |                132.28 ns #6 |          ***500.17 ns*** 🥈 |                616.54 µs #8 |               *28.78 µs* 🥉 | <ins>**16.66 ms**</ins> 🥇 |
| colorette[^colorette]      |                125.88 ns #4 |                601.66 ns #6 |                 1.14 ms #11 |                 30.63 µs #6 |              *29.28 ms* 🥉 |
| kleur[^kleur]              |                144.70 ns #9 |                975.36 ns #9 |              *412.58 µs* 🥉 |                75.04 µs #10 |                31.38 ms #7 |
| kleur/colors[^kleur]       |                135.65 ns #7 |                706.42 ns #7 |          ***397.88 µs*** 🥈 |                 72.11 µs #9 |                31.45 ms #8 |
| chalk[^chalk]              |                137.59 ns #8 |                791.18 ns #8 |                855.58 µs #9 |                 64.83 µs #8 |               35.27 ms #11 |
| ansi-colors[^ansi-colors]  |               228.69 ns #10 |                 1.51 µs #10 |                421.59 µs #4 |                79.32 µs #11 |          ***20.06 ms*** 🥈 |
| **ansispeck/ext#1**        |                           — |                     1.02x ~ |                       1.52x |                       1.12x |                      1.84x |

[^ansispeck]: ansispeck [v0.4.0](https://npm.im/package/ansispeck/v/0.4.0 "NPM")

[^picocolors]: picocolors
    [v1.1.1](https://npm.im/package/picocolors/v/1.1.1 "NPM")

[^colorette]: colorette
    [v2.0.20](https://npm.im/package/colorette/v/2.0.20 "NPM")

[^kleur]: kleur [v4.1.5](https://npm.im/package/kleur/v/4.1.5 "NPM")

[^chalk]: chalk [v5.6.2](https://npm.im/package/chalk/v/5.6.2 "NPM")

[^ansi-colors]: ansi-colors
    [v4.1.3](https://npm.im/package/ansi-colors/v/4.1.3 "NPM")

### deno 2.9.3

> AMD EPYC 7763 64-Core Processor

<!-- -->

> † excluded from ranking — `noop` is the control; `raw` is also excluded in
> no-color runs

| Library                    |                     Simple |                     Complex |                   Recursion |              Deferred-build |                  Cold load |
| -------------------------- | -------------------------: | --------------------------: | --------------------------: | --------------------------: | -------------------------: |
| ansispeck[^ansispeck]      |                73.88 ns #4 |              *362.98 ns* 🥉 |                498.61 µs #8 |               *16.24 µs* 🥉 |                46.19 ms #7 |
| ansispeck/auto[^ansispeck] |                76.75 ns #6 |                371.84 ns #5 |                487.30 µs #7 |                 16.42 µs #4 | <ins>**43.58 ms**</ins> 🥇 |
| ansispeck/raw[^ansispeck]  |                73.92 ns #5 |                366.05 ns #4 |                480.95 µs #6 |                 16.48 µs #5 |                44.68 ms #5 |
| ansispeck/safe[^ansispeck] | <ins>**57.61 ns**</ins> 🥇 |          ***277.04 ns*** 🥈 | <ins>**172.39 ns**</ins> 🥇 |            ***1.29 µs*** 🥈 |          ***43.83 ms*** 🥈 |
| ansispeck/rope[^ansispeck] |              243.44 ns #10 |                 1.27 µs #10 |                 1.44 ms #10 | <ins>**583.15 ns**</ins> 🥇 |                45.80 ms #6 |
| ansispeck/noop[^ansispeck] |                 31.26 ns † |                  35.96 ns † |                 110.33 ns † |                 352.01 ns † |                 43.90 ms † |
| picocolors[^picocolors]    |          ***69.34 ns*** 🥈 | <ins>**263.81 ns**</ins> 🥇 |                441.40 µs #5 |                 16.66 µs #7 |               53.49 ms #10 |
| colorette[^colorette]      |              *70.08 ns* 🥉 |                428.88 ns #6 |                         DNF |                 16.52 µs #6 |                47.24 ms #8 |
| kleur[^kleur]              |                92.48 ns #9 |                596.56 ns #8 |              *375.59 µs* 🥉 |                 43.41 µs #9 |              *44.31 ms* 🥉 |
| kleur/colors[^kleur]       |                79.98 ns #7 |                514.11 ns #7 |          ***375.54 µs*** 🥈 |                 43.02 µs #8 |                44.42 ms #4 |
| chalk[^chalk]              |                90.23 ns #8 |                668.28 ns #9 |                801.74 µs #9 |                45.34 µs #10 |                48.11 ms #9 |
| ansi-colors[^ansi-colors]  |              264.46 ns #11 |                 1.87 µs #11 |                376.27 µs #4 |                45.38 µs #11 |               55.22 ms #11 |
| **ansispeck/ext#1**        |                      1.07x |                       1.38x |                       1.33x |                           — |                    1.04x ~ |

### node 26.3.0

> AMD EPYC 7763 64-Core Processor

<!-- -->

> † excluded from ranking — `noop` is the control; `raw` is also excluded in
> no-color runs

| Library                    |                     Simple |                     Complex |                   Recursion |              Deferred-build |                  Cold load |
| -------------------------- | -------------------------: | --------------------------: | --------------------------: | --------------------------: | -------------------------: |
| ansispeck[^ansispeck]      |                72.34 ns #5 |                345.00 ns #4 |                500.95 µs #8 |                 16.08 µs #4 |                29.71 ms #7 |
| ansispeck/auto[^ansispeck] |                73.56 ns #6 |              *342.57 ns* 🥉 |                484.28 µs #7 |                 16.09 µs #5 |                29.67 ms #6 |
| ansispeck/raw[^ansispeck]  |              *69.60 ns* 🥉 |                355.85 ns #5 |                446.63 µs #5 |                 16.11 µs #6 |                30.20 ms #9 |
| ansispeck/safe[^ansispeck] | <ins>**64.89 ns**</ins> 🥇 |          ***283.79 ns*** 🥈 | <ins>**174.96 ns**</ins> 🥇 |            ***1.55 µs*** 🥈 |               30.99 ms #10 |
| ansispeck/rope[^ansispeck] |              256.84 ns #10 |                 1.34 µs #10 |                 1.37 ms #10 | <ins>**596.74 ns**</ins> 🥇 |                30.17 ms #8 |
| ansispeck/noop[^ansispeck] |                 35.27 ns † |                  39.24 ns † |                 115.27 ns † |                 347.92 ns † |                 30.24 ms † |
| picocolors[^picocolors]    |          ***68.06 ns*** 🥈 | <ins>**252.99 ns**</ins> 🥇 |                453.03 µs #6 |                 16.21 µs #7 | <ins>**27.52 ms**</ins> 🥇 |
| colorette[^colorette]      |                69.76 ns #4 |                395.94 ns #6 |                         DNF |               *15.98 µs* 🥉 |                29.09 ms #5 |
| kleur[^kleur]              |                79.96 ns #8 |                556.42 ns #8 |                359.04 µs #4 |                 42.34 µs #8 |                28.56 ms #4 |
| kleur/colors[^kleur]       |                78.55 ns #7 |                493.52 ns #7 |          ***350.51 µs*** 🥈 |                42.69 µs #10 |              *28.46 ms* 🥉 |
| chalk[^chalk]              |                86.37 ns #9 |                648.56 ns #9 |                716.31 µs #9 |                 42.38 µs #9 |               38.82 ms #11 |
| ansi-colors[^ansi-colors]  |              264.09 ns #11 |                 1.93 µs #11 |              *356.79 µs* 🥉 |                43.35 µs #11 |          ***27.95 ms*** 🥈 |
| **ansispeck/ext#1**        |                      1.06x |                       1.36x |                       1.43x |                     1.01x ~ |                      1.08x |

## Benchmarks (NO_COLOR=1)

### bun 1.3.14

> AMD EPYC 7763 64-Core Processor

<!-- -->

> † excluded from ranking — `noop` is the control; `raw` is also excluded in
> no-color runs

| Library                    |                     Simple |                    Complex |                   Recursion |              Deferred-build |                  Cold load |
| -------------------------- | -------------------------: | -------------------------: | --------------------------: | --------------------------: | -------------------------: |
| ansispeck[^ansispeck]      | <ins>**42.19 ns**</ins> 🥇 | <ins>**53.11 ns**</ins> 🥇 |                218.70 ns #6 |          ***175.54 ns*** 🥈 |                31.83 ms #9 |
| ansispeck/auto[^ansispeck] |          ***47.06 ns*** 🥈 |                55.26 ns #6 |                214.53 ns #5 | <ins>**171.58 ns**</ins> 🥇 |                30.15 ms #5 |
| ansispeck/raw[^ansispeck]  |                128.90 ns † |                536.59 ns † |                 627.76 µs † |                  30.33 µs † |                 30.50 ms † |
| ansispeck/safe[^ansispeck] |               106.94 ns #8 |               214.29 ns #8 |                237.09 ns #8 |                558.47 ns #9 |                30.28 ms #6 |
| ansispeck/rope[^ansispeck] |               114.82 ns #9 |               615.22 ns #9 |                317.31 µs #9 |              *246.01 ns* 🥉 |                30.95 ms #8 |
| ansispeck/noop[^ansispeck] |                 47.93 ns † |                 53.58 ns † |                 209.64 ns † |                 319.73 ns † |                 30.92 ms † |
| picocolors[^picocolors]    |                50.51 ns #4 |                54.99 ns #4 |              *210.06 ns* 🥉 |                311.95 ns #4 | <ins>**16.58 ms**</ins> 🥇 |
| colorette[^colorette]      |              *50.19 ns* 🥉 |              *54.78 ns* 🥉 |                214.44 ns #4 |                318.56 ns #5 |              *29.05 ms* 🥉 |
| kleur[^kleur]              |                52.51 ns #5 |          ***53.29 ns*** 🥈 | <ins>**208.99 ns**</ins> 🥇 |                464.30 ns #7 |                29.97 ms #4 |
| kleur/colors[^kleur]       |                54.99 ns #7 |                55.23 ns #5 |          ***209.49 ns*** 🥈 |                330.85 ns #6 |                30.91 ms #7 |
| chalk[^chalk]              |                53.27 ns #6 |                84.40 ns #7 |                229.57 ns #7 |                520.05 ns #8 |               34.18 ms #10 |
| ansi-colors[^ansi-colors]  |              236.74 ns #10 |                1.55 µs #10 |               417.56 µs #10 |                75.84 µs #10 |          ***19.71 ms*** 🥈 |
| **ansispeck/ext#1**        |                          — |                          — |                       1.05x |                           — |                      1.92x |

### deno 2.9.3

> AMD EPYC 7763 64-Core Processor

<!-- -->

> † excluded from ranking — `noop` is the control; `raw` is also excluded in
> no-color runs

| Library                    |                     Simple |                    Complex |                   Recursion |              Deferred-build |                  Cold load |
| -------------------------- | -------------------------: | -------------------------: | --------------------------: | --------------------------: | -------------------------: |
| ansispeck[^ansispeck]      | <ins>**30.34 ns**</ins> 🥇 | <ins>**35.39 ns**</ins> 🥇 |                109.21 ns #5 |          ***245.16 ns*** 🥈 |              *42.42 ms* 🥉 |
| ansispeck/auto[^ansispeck] |                37.91 ns #7 |          ***36.11 ns*** 🥈 |                107.29 ns #4 |              *246.76 ns* 🥉 |                43.70 ms #6 |
| ansispeck/raw[^ansispeck]  |                 73.99 ns † |                353.79 ns † |                 586.27 µs † |                  16.22 µs † |                 42.62 ms † |
| ansispeck/safe[^ansispeck] |                50.45 ns #8 |               196.58 ns #8 |                149.70 ns #8 |                  1.14 µs #9 |                43.32 ms #5 |
| ansispeck/rope[^ansispeck] |                97.81 ns #9 |               554.43 ns #9 |                262.09 µs #9 | <ins>**116.91 ns**</ins> 🥇 |                43.11 ms #4 |
| ansispeck/noop[^ansispeck] |                 30.95 ns † |                 35.68 ns † |                 107.20 ns † |                 351.34 ns † |                 44.15 ms † |
| picocolors[^picocolors]    |                37.18 ns #6 |                99.08 ns #6 |                113.46 ns #6 |                276.98 ns #5 |               53.60 ms #10 |
| colorette[^colorette]      |                36.99 ns #5 |                95.12 ns #5 |                115.89 ns #7 |                274.58 ns #4 |                46.87 ms #7 |
| kleur[^kleur]              |              *34.22 ns* 🥉 |                77.83 ns #4 |              *104.84 ns* 🥉 |                288.20 ns #6 |          ***41.34 ms*** 🥈 |
| kleur/colors[^kleur]       |          ***33.15 ns*** 🥈 |              *38.89 ns* 🥉 |          ***104.55 ns*** 🥈 |                295.45 ns #7 | <ins>**40.79 ms**</ins> 🥇 |
| chalk[^chalk]              |                35.12 ns #4 |               102.87 ns #7 | <ins>**104.49 ns**</ins> 🥇 |                417.93 ns #8 |                47.61 ms #8 |
| ansi-colors[^ansi-colors]  |              255.40 ns #10 |                1.86 µs #10 |               544.62 µs #10 |                44.40 µs #10 |                52.90 ms #9 |
| **ansispeck/ext#1**        |                          — |                          — |                       1.05x |                           — |                      1.04x |

### node 26.3.0

> AMD EPYC 7763 64-Core Processor

<!-- -->

> † excluded from ranking — `noop` is the control; `raw` is also excluded in
> no-color runs

| Library                    |                     Simple |                    Complex |                   Recursion |              Deferred-build |                  Cold load |
| -------------------------- | -------------------------: | -------------------------: | --------------------------: | --------------------------: | -------------------------: |
| ansispeck[^ansispeck]      |                36.40 ns #4 | <ins>**38.13 ns**</ins> 🥇 |          ***109.95 ns*** 🥈 |              *251.41 ns* 🥉 |                29.66 ms #6 |
| ansispeck/auto[^ansispeck] | <ins>**33.51 ns**</ins> 🥇 |              *41.96 ns* 🥉 |                111.81 ns #4 |          ***249.95 ns*** 🥈 |                29.24 ms #5 |
| ansispeck/raw[^ansispeck]  |                 73.09 ns † |                360.62 ns † |                 572.04 µs † |                  16.20 µs † |                 29.52 ms † |
| ansispeck/safe[^ansispeck] |                56.40 ns #8 |               195.62 ns #8 |                157.36 ns #8 |                  1.16 µs #9 |                29.94 ms #9 |
| ansispeck/rope[^ansispeck] |               111.81 ns #9 |               569.97 ns #9 |                269.89 µs #9 | <ins>**120.10 ns**</ins> 🥇 |                29.81 ms #7 |
| ansispeck/noop[^ansispeck] |                 32.71 ns † |                 37.83 ns † |                 111.32 ns † |                 365.40 ns † |                 29.35 ms † |
| picocolors[^picocolors]    |                38.48 ns #7 |                99.27 ns #6 |                117.30 ns #7 |                292.83 ns #6 | <ins>**26.68 ms**</ins> 🥇 |
| colorette[^colorette]      |                37.94 ns #6 |                96.86 ns #5 |                116.78 ns #6 |                285.63 ns #5 |                29.88 ms #8 |
| kleur[^kleur]              |                37.10 ns #5 |                79.62 ns #4 |              *110.87 ns* 🥉 |                281.62 ns #4 |                28.94 ms #4 |
| kleur/colors[^kleur]       |          ***33.91 ns*** 🥈 |          ***40.60 ns*** 🥈 |                112.12 ns #5 |                301.27 ns #7 |              *28.87 ms* 🥉 |
| chalk[^chalk]              |              *35.97 ns* 🥉 |               107.10 ns #7 | <ins>**107.25 ns**</ins> 🥇 |                408.87 ns #8 |               38.90 ms #10 |
| ansi-colors[^ansi-colors]  |              263.07 ns #10 |                1.95 µs #10 |               541.63 µs #10 |                43.48 µs #10 |          ***27.83 ms*** 🥈 |
| **ansispeck/ext#1**        |                      1.07x |                          — |                       1.03x |                           — |                      1.11x |

## Run locally

Use the package scripts or the recipes in the [justfile](justfile). For an
individual runtime or output format, invoke the [benchmark CLI](bench.ts)
directly:

```sh
bun run bench          # both runtimes, auto color detection
just bench             # same, via justfile
just bench-forced      # FORCE_COLOR=1, both runtimes
just bench-md-forced   # markdown output, FORCE_COLOR=1

# Single-runtime Markdown runs
FORCE_COLOR=1 bun --bun bench.ts -f markdown
FORCE_COLOR=1 deno run -A bench.ts -f markdown
FORCE_COLOR=1 node bench.ts -f markdown
NO_COLOR=1 bun --bun bench.ts -f markdown
NO_COLOR=1 deno run -A bench.ts -f markdown
NO_COLOR=1 node bench.ts -f markdown
```
