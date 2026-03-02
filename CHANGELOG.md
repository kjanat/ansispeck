# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2026-03-02

### Added

- ANSI color formatting for terminal output (8 colors + bright variants)
- Background colors (8 + bright variants)
- Style modifiers: bold, dim, italic, underline, inverse, hidden, strikethrough, reset
- `createColors(enabled?)` factory for explicit color toggle
- `isColorSupported` auto-detection (NO_COLOR, FORCE_COLOR, --no-color, --color, CI, TTY)
- Nesting-safe close-code replacement (handles composed styles correctly)
- Full TypeScript types with JSDoc
- Default export for `import c from 'femtocolor'` usage
- API-compatible with picocolors (drop-in replacement)

[Unreleased]: https://github.com/kjanat/femtocolor/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/kjanat/femtocolor/releases/tag/v0.1.0
