# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- `scripts/compare-size.sh` — size comparison against picocolors (`--table` with OSC 8 terminal hyperlinks, `--markdown` with link definitions)

### Changed

- Rename package from `femtocolor` to `femtocolors`

### Fixed

- README size table: corrected runtime from 2.01 KB to 1.37 KB, added version footnotes

## [0.1.0] - 2026-03-02

### Added

- ANSI color formatting for terminal output (8 colors + bright variants)
- Background colors (8 + bright variants)
- Style modifiers: bold, dim, italic, underline, inverse, hidden, strikethrough, reset
- `createColors(enabled?)` factory for explicit color toggle
- `isColorSupported` auto-detection (NO_COLOR, FORCE_COLOR, --no-color, --color, CI, TTY)
- Nesting-safe close-code replacement (handles composed styles correctly)
- Full TypeScript types with JSDoc
- Default export for `import c from 'femtocolors'` usage
- API-compatible with picocolors (drop-in replacement)

[Unreleased]: https://github.com/kjanat/femtocolors/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/kjanat/femtocolors/releases/tag/v0.1.0
