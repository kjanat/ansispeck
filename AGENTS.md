# PROJECT KNOWLEDGE BASE

**Generated:** 2026-03-04\
**Commit:** `9b7f5a6`\
**Branch:** `miscelaneous`

## OVERVIEW

`ansispeck` is a small TypeScript ANSI formatting lib with split runtime entrypoints: `auto`, `raw`, `noop`, `safe`, `rope`.

## STRUCTURE

```text
./
├── src/                 # runtime implementation
│   ├── internal/        # ANSI constants + env detection
│   ├── auto.ts          # env-based palette selection
│   ├── raw.ts           # always ANSI, speed-first
│   ├── noop.ts          # plain-text passthrough
│   ├── safe.ts          # template-tag interpolation-safe mode
│   ├── rope.ts          # chunk builder API
│   ├── types.ts         # public/shared types
│   └── index.ts         # root exports + type exports
├── benchmarks/          # benchmark suites
├── tests/               # behavior tests (single suite file)
├── scripts/prepack.ts   # publish-time manifest/types transform
├── bench.ts             # benchmark orchestrator + table renderer
├── justfile             # primary task runner
└── package.json         # exports/imports/scripts
```

## WHERE TO LOOK

| Task                        | Location                                         | Notes                                       |
| --------------------------- | ------------------------------------------------ | ------------------------------------------- |
| Change public API shape     | `src/index.ts`, `src/types.ts`, `package.json`   | Keep exports/types/scripts aligned          |
| Change color detection      | `src/internal/detect.ts`, `src/auto.ts`          | Auto decision is import-time, one-shot      |
| Change raw speed path       | `src/raw.ts`, `src/internal/ansi.ts`             | `raw` intentionally skips close-code repair |
| Change interpolation safety | `src/safe.ts`, `src/internal/ansi.ts`            | `safe` owns style reopen behavior           |
| Change rope composition     | `src/rope.ts`, `tests/index.test.ts`             | O(1) compose, O(n) render contract          |
| Change benchmark reporting  | `bench.ts`, `benchmarks/*.ts`                    | CI95 baseline is `ansispeck/ext#1`          |
| Change publish packaging    | `scripts/prepack.ts`, `justfile`, `package.json` | Prepack mutates then restores files         |

## CODE MAP

| Symbol / Unit                     | Type      | Location                 | Role                                        |
| --------------------------------- | --------- | ------------------------ | ------------------------------------------- |
| `detectColorSupport`              | function  | `src/internal/detect.ts` | Auto mode enable/disable precedence         |
| `makeFormatter`                   | function  | `src/internal/ansi.ts`   | Core formatter constructor                  |
| `makeTemplateFormatter`           | function  | `src/internal/ansi.ts`   | Safe template-tag constructor               |
| `createRope`                      | function  | `src/rope.ts`            | Rope palette factory                        |
| `parse`                           | function  | `bench.ts`               | Convert mitata output into suite/lib maps   |
| `computeCI95`                     | function  | `bench.ts`               | Compare `ansispeck` vs fastest external lib |
| `printOverview` / `printMarkdown` | functions | `bench.ts`               | Human + markdown benchmark output           |

## CONVENTIONS

- `ansispeck` root and `ansispeck/auto` are intentionally same runtime behavior.
- Internal benchmark imports use `#dist/ansispeck*` aliases (tsconfig maps to `src` in-repo; prepack strips `imports` before publish).
- `raw` is speed-first and not nesting-safe for embedded close codes.
- `safe` is interpolation-safe path for nested styling correctness.
- `rope` is chunk API: cheap composition nodes + one render pass.
- Build/lifecycle orchestration goes through `just`; npm scripts delegate to it.

## ANTI-PATTERNS (THIS PROJECT)

- Do not benchmark `src/*` imports; benchmark via `#dist/ansispeck*` paths.
- Do not use `raw` for interpolation-heavy nested styling correctness tests.
- Do not remove `do_not_optimize` sinks from benchmark suites.
- Do not move benchmark dispatch above declarations in `bench.ts` (TDZ hazard).
- Do not change auto detection precedence casually (`FORCE_COLOR`/`--color` wins over `NO_COLOR`/`--no-color`).

## UNIQUE STYLES

- Bench markdown includes link refs to package versions resolved from installed deps.
- CI workflow focuses on benchmark + size summary, not generic lint/test matrix.
- Prepack temporarily rewrites package metadata and restores via postpack backup marker.

## COMMANDS

```bash
just test
just typecheck
just build
just bench
just bench-md-forced
```

## NOTES

- Keep `package.json` exports, `tsdown.config.ts` entries, and `src/*` entrypoint files in sync.
- If adding formatter names, update all palettes (`raw/noop/auto/safe/rope`) and tests.
