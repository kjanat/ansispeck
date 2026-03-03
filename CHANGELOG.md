# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-03-03

### Added

- `scripts/compare-size.sh` — size reporting (`--table` with OSC 8 terminal hyperlinks, `--markdown` with link definitions)
- Benchmark suite (simple, complex, recursion, loading) with overview formatter, per-column rankings, and Welch's t-test CI95
- CI workflow for benchmarks and size comparison on PRs/pushes to master
- ANSI color formatting for terminal output (8 colors + bright variants)
- Background colors (8 + bright variants)
- Style modifiers: bold, dim, italic, underline, inverse, hidden, strikethrough, reset
- `createColors(enabled?)` factory for explicit color toggle
- `isColorSupported` auto-detection (NO_COLOR, FORCE_COLOR, --no-color, --color, CI, TTY)
- Nesting-safe close-code replacement (handles composed styles correctly)
- Full TypeScript types with JSDoc
- Default export for `import c from 'ansispeck'` usage
- API-compatible with common tiny ANSI formatter interfaces

### Changed

- Rename package from `femtocolors` to `ansispeck`
- Benchmark harness now uses local sink + `mitata.do_not_optimize` (instead of `globalThis` sink writes) to reduce harness overhead distortion
- `BENCHMARKS.md` now reports median values across 5 runs per runtime; `ansispeck/#1` row now shows median ratio
- Build target platform switched to `neutral`, emitting `dist/index.js` + `dist/index.d.ts`
- Publish flow now strips dev-only `package.json` fields, author URL metadata, and declaration-file comments during `prepack` to reduce package size
- License switched from MIT to Zero-Clause BSD (0BSD)

### Performance

- Inline `replaceClose` into `fmt` — eliminates function call overhead, enables single return path optimization in V8/JSC
- Benchmarks import from `dist/` (built output) instead of `src/` for accurate measurement

### Fixed

- README size table: corrected runtime from 2.01 KB to 1.37 KB, added version footnotes
- Benchmark CLI now handles invalid `--filter` regex input without uncaught exceptions
- Welch CI computation now guards too-small sample sets
- `benchmarks/size.ts` now resolves paths with `fileURLToPath(import.meta.url)` for cross-platform URL/path correctness

[0.1.0]: https://github.com/kjanat/ansispeck/releases/tag/v0.1.0
