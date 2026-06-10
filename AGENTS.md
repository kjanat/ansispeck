# PROJECT KNOWLEDGE BASE

## OVERVIEW

`ansispeck` is a ~2 KB (gzipped) TypeScript ANSI color formatting library with explicit entrypoints: root (auto-detected), `/auto`, `/raw`, `/noop`, `/safe`, `/rope`. Version 0.1.0, unreleased.

## STRUCTURE

```text
./
├── src/                 # runtime implementation (see src/AGENTS.md)
│   ├── internal/        # ANSI codes, palette factory, detection, template tag
│   ├── index.ts         # root entrypoint (auto-detected) + all type re-exports
│   ├── auto.ts          # alias of root
│   ├── raw.ts           # always-colored
│   ├── noop.ts          # plain-text passthrough
│   ├── safe.ts          # template-tag, interpolation-safe
│   ├── rope.ts          # chunk builder: O(1) compose, O(n) render
│   └── types.ts         # shared public types
├── benchmarks/          # suites consumed by bench.ts (see benchmarks/AGENTS.md)
├── tests/               # bun test suites (detect, entrypoints, index, rope, safe)
├── scripts/             # prepack.ts (publish transform), compare-size.sh (CI size table)
├── bench.ts             # benchmark orchestrator + overview/markdown renderer
├── justfile             # convenience recipes; delegates to package scripts
└── package.json         # exports/imports/scripts (scripts are `run`-based)
```

## WHERE TO LOOK

| Task                        | Location                                       | Notes                                      |
| --------------------------- | ---------------------------------------------- | ------------------------------------------ |
| Change public API shape     | `src/index.ts`, `src/types.ts`, `package.json` | Keep exports/types/tsdown entries aligned  |
| Change color detection      | `src/internal/detect.ts`                       | One-shot at import time                    |
| Change formatter mechanics  | `src/internal/ansi.ts`                         | `fmt()` close-code scan shared by auto/raw |
| Change interpolation safety | `src/safe.ts`, `src/internal/template.ts`      | Style re-opens after each interpolation    |
| Change rope composition     | `src/rope.ts`, `tests/rope.test.ts`            | Structural re-open, no string scanning     |
| Change benchmark reporting  | `bench.ts`, `benchmarks/*.ts`                  | CI95 baseline row is `ansispeck/ext#1`     |
| Change publish packaging    | `scripts/prepack.ts`, `package.json`           | prepack strips scripts/devDeps; postpack   |
|                             |                                                | restores package.json via git              |
| Change build output         | `tsdown.config.ts`                             | dist/{index,auto,raw,noop,safe,rope}.js +  |
|                             |                                                | shared `internal-*.js` chunk               |

## CONVENTIONS

- Root `ansispeck` and `ansispeck/auto` are behavior-identical (auto re-exports root).
- Detection precedence: `FORCE_COLOR`/`--color` > `NO_COLOR`/`--no-color` > win32 > `CI` > TTY with `TERM != dumb`.
- `raw` and `auto`/root ARE nesting-safe: `fmt()` scans for nested close codes starting at `min(open, close)` length with a minimum-length guard, so short inputs skip the scan entirely.
- `safe` is the template-tag flavor: interpolated values can never leak or break the enclosing style.
- `rope` formatters return chunk nodes; call `render(...)` for the final string.
- Factories: `createColors` (auto/raw/noop), `createSafeColors`, `createRope` accept an explicit `enabled` toggle.
- Extras beyond basic palette: `link` (OSC 8, callable or template tag), `fg256`/`bg256`, `rgb`/`bgRgb`, `hex`/`bgHex`, `strip()`, `overline`, `doubleUnderline`, `blink`.
- Benchmark code imports built output via `#dist/ansispeck` / `#dist/ansispeck/*` aliases (package `imports`), never `src/*`.
- package.json scripts are `run`-based (runner CLI via the `runner-run` devDependency); the justfile delegates to them.
- Formatting: tabs + single quotes, dprint (`run fmt`); lint is `biome check src/`.

## ANTI-PATTERNS (THIS PROJECT)

- Do not benchmark `src/*` imports; benchmark via `#dist/ansispeck*`.
- Do not remove `do_not_optimize` sinks from benchmark suites.
- Do not add a formatter name in one entrypoint only; update all palettes (`mapPalette`), `types.ts`, and tests.
- Do not change detection precedence casually; force beats disable by design.

## COMMANDS

```bash
bun run build       # tsdown (attw + publint run as part of build)
bun test            # 109 tests
bun lint            # biome check src/
bun --bun typecheck # tsgo --noEmit (build first: dist types are imported)
bun --bun bench.ts  # bun bench; `node bench.ts` for node
just                # list justfile recipes
```
