# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.4.0] - 2026-07-21

### Added

- `grey` as a British-spelling alias of `gray` across every entrypoint

### Fixed

- Failed benchmark runs now render as `DNF` instead of looking like absent
  results

## [0.3.0] - 2026-07-21

### Added

- `space(count?)` and `tab(count?)` helpers on every entrypoint and color-set
  factory; each returns one character by default, accepts a non-negative repeat
  count, and returns an empty string for zero

### Changed

- Benchmark Markdown and terminal output now link to mitata and Welch's *t*-test
  methodology, with OSC 8 links in supported terminals
- Benchmark automation formats combined summaries consistently and reports
  loading-process timeouts and failures with runtime-specific diagnostics
- Publication now accepts only verified signed annotated SemVer tags, validates
  the stamped package version, and publishes to npm before JSR
- Published package metadata omits development-only imports, overrides,
  workspaces, and lifecycle configuration

### Fixed

- Nested empty underlines now restore an enclosing double underline sharing the
  same close code
- `strip()` now recognizes the complete SGR parameter/intermediate ranges,
  including colon-delimited truecolor sequences
- External benchmark implementations that reject a workload no longer abort the
  entire cross-runtime benchmark matrix

## [0.2.1] - 2026-07-20

### Added

- Exported `BaseColorName` and `VariantBaseColorName` so the public
  `FormatterName` declaration no longer references private types
- Deno benchmark coverage alongside Bun and Node

### Changed

- npm packages are assembled in a disposable staging directory instead of
  rewriting the tracked `package.json` during `prepack`
- Loading benchmarks install exact local package tarballs and measure imports in
  fresh runtime processes
- Benchmark CLI uses DreamCLI with explicit format, filter, compact, and quiet
  flags; CI summaries deduplicate metadata and format generated Markdown
- JSR publishing includes package metadata, changelog, README, and license

### Fixed

- URL parameters now use the runtime constructor's instance type, avoiding the
  global/Node `URL` declaration collision under Deno and JSR checks
- Root and auto entrypoints use declaration-safe shared facades so generated
  names remain stable across tsdown, Deno, Bun, Node, and native TypeScript
- Generated benchmark links derive ansispeck's npm version from the latest Git
  tag instead of the in-tree `0.0.0` release sentinel

## [0.2.0] - 2026-07-15

### Added

- Independent OSC 8 hyperlink detection per the
  [no-hyperlinks](https://no-hyperlinks.org/) convention:
  `detectHyperlinkSupport()` (`NO_HYPERLINKS`/`--no-hyperlinks` beats
  `FORCE_HYPERLINKS`/`--hyperlinks` beats TTY), plus `isHyperlinkSupported` on
  `Colors`/`SafeColors` and every entrypoint
- `createColors`/`createSafeColors` accept a second `hyperlinksEnabled` toggle
  (defaults to the color toggle); the auto entrypoints detect it independently

### Changed

- `link` emission is now gated on hyperlink support, not color support —
  `NO_COLOR` no longer suppresses hyperlinks, and `NO_HYPERLINKS` suppresses
  them even with color on. Explicit `createColors(true)`/`createColors(false)`
  are unchanged (both toggles follow the single argument)

## [0.1.2] - 2026-07-06

### Fixed

- Published type declarations were unresolvable: the `codeSplitting` group regex
  also captured the generated declaration modules, so entry `.d.ts` files
  imported an `internal-<hash>.js` chunk that had no `.d.ts` sibling — every
  exported type degraded to `any` (hard `TS7016` without `skipLibCheck`). Regex
  now anchors on `\.ts$` so only runtime modules are grouped and the shared
  declaration chunks are emitted

## [0.1.1] - 2026-07-06

### Added

- JSDoc symbol documentation on every entrypoint's exported formatters and
  default exports (JSR symbol-doc coverage 6% → 86%)

### Changed

- Publish workflow: npm auth via OIDC trusted publishing (drops `NPM_TOKEN`),
  separate `npm`/`jsr` job names, `actions/checkout@v7`

## [0.1.0] - 2026-07-05

### Added

- `link(url, text?)` — OSC 8 terminal hyperlink formatter; accepts
  `string | URL`, `text` defaults to the URL, usable as a template tag
- `overline`, `doubleUnderline`, `blink` style modifiers
- `fg256(n)` / `bg256(n)` — 256-color palette formatters
- `rgb(r, g, b)` / `bgRgb(r, g, b)`, `hex(color)` / `bgHex(color)` — truecolor
  formatters (`#rgb` and `#rrggbb`)
- `strip(input)` — remove all ANSI SGR and OSC sequences
- Explicit entrypoints with subpath exports: `ansispeck/auto`, `ansispeck/raw`,
  `ansispeck/noop`, `ansispeck/safe`, `ansispeck/rope`
- `ansispeck/safe` — template-tag palette that re-opens styles after every
  interpolation (leak-proof against hostile values);
  `createSafeColors(enabled?)`
- `ansispeck/rope` — chunk/rope API (`text`, `concat`, `render`, `createRope`)
  with O(1) styled composition and a stack-based renderer that re-opens
  enclosing styles structurally
- `detectColorSupport()` export for on-demand detection
- Derived type layer (`src/types.ts`): `FormatterName` built from
  template-literal types, `Palette`/`TemplatePalette`/`ChunkPalette`,
  `SafeColors`, `Rope`, branded `Chunk` nodes
- JSR publishing: package also available as
  [`@kjanat/ansispeck`](https://jsr.io/@kjanat/ansispeck) on JSR
- `scripts/compare-size.sh` — size reporting (`--table` with OSC 8 terminal
  hyperlinks, `--markdown` with link definitions)
- Benchmark suite (simple, complex, recursion, loading) with overview formatter,
  per-column rankings, and Welch's t-test CI95
- CI workflow for benchmarks and size comparison on PRs/pushes to master
- ANSI color formatting for terminal output (8 colors + bright variants)
- Background colors (8 + bright variants)
- Style modifiers: bold, dim, italic, underline, inverse, hidden, strikethrough,
  reset
- `createColors(enabled?)` factory for explicit color toggle
- `isColorSupported` auto-detection (NO_COLOR, FORCE_COLOR, --no-color, --color,
  CI, TTY)
- Nesting-safe close-code replacement (handles composed styles correctly)
- Full TypeScript types with JSDoc
- Default export for `import c from 'ansispeck'` usage
- API-compatible with common tiny ANSI formatter interfaces

### Changed

- `FORCE_COLOR`/`--color` now takes precedence over `NO_COLOR`/`--no-color`
  (explicit force beats explicit disable)
- Runtime split into `src/internal/{ansi,detect,colors,template}`; every palette
  flavor is built from a single `mapPalette` code table
- `Formattable` widened with `boolean | bigint`
- Inline `replaceClose` into `fmt` — eliminates function call overhead, enables
  single return path optimization in V8/JSC
- Benchmarks import from `dist/` (built output) instead of `src/` for accurate
  measurement
- `scripts/compare-size.sh` now measures the default entry's full import chain
  (entry + shared chunks)
- Size claim rebranded from "Sub-kilobyte (gzipped)" to "~1 KB (gzipped)", then
  to "~2 KB (gzipped)" with the entrypoint architecture
- CI: extract bench steps into reusable composite action
  (`.github/actions/bench/`) with `runtime` and `color` inputs
- CI: add `shfmt` to dprint exec config for consistent shell script formatting
- Rename package from `femtocolors` to `ansispeck`
- Benchmark harness now uses local sink + `mitata.do_not_optimize` (instead of
  `globalThis` sink writes) to reduce harness overhead distortion
- `BENCHMARKS.md` now reports median values across 5 runs per runtime;
  `ansispeck/#1` row now shows median ratio
- Build target platform switched to `neutral`, emitting `dist/index.js` +
  `dist/index.d.ts`
- Publish flow now strips dev-only `package.json` fields, author URL metadata,
  and declaration-file comments during `prepack` to reduce package size
- License switched from MIT to Zero-Clause BSD (0BSD)

### Fixed

- Nested close-code scan now starts at `min(open, close)` length instead of
  `open.length` — fixes style leaks with long truecolor open codes while keeping
  the short-input fast path (`indexOf` bails without scanning when the input is
  shorter than the skip)
- README size table: corrected runtime from 2.01 KB to 1.37 KB, added version
  footnotes
- Benchmark CLI now handles invalid `--filter` regex input without uncaught
  exceptions
- Welch CI computation now guards too-small sample sets
- `benchmarks/size.ts` now resolves paths with `fileURLToPath(import.meta.url)`
  for cross-platform URL/path correctness

[Unreleased]: https://github.com/kjanat/ansispeck/compare/v0.4.0...HEAD
[0.4.0]: https://github.com/kjanat/ansispeck/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/kjanat/ansispeck/compare/v0.2.1...v0.3.0
[0.2.1]: https://github.com/kjanat/ansispeck/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/kjanat/ansispeck/compare/v0.1.2...v0.2.0
[0.1.2]: https://github.com/kjanat/ansispeck/compare/v0.1.1...v0.1.2
[0.1.1]: https://github.com/kjanat/ansispeck/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/kjanat/ansispeck/releases/tag/v0.1.0
