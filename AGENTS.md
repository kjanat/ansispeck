# AGENTS.md

> Generated: 2026-06-10 | Commit: `c376e2a` | Branch: `master`

## OVERVIEW

ansispeck: ~2 KB (gzipped) terminal ANSI color formatting with explicit entrypoints. Zero runtime deps, ESM only,
built with tsdown to `dist/*.js` plus one shared `internal-*` chunk. Version stays `0.1.0` in-tree; releases are
stamped from git tags by the publish workflow.

## STRUCTURE

```
src/            entrypoints: index (root), auto, raw, noop, safe, rope + types.ts
src/internal/   ansi.ts (codes + fmt factory), colors.ts, detect.ts, template.ts
benchmarks/     mitata suites (simple, complex, recursion, deferred, loading) + size.ts + internal/ (wasm-rust)
tests/          bun test suites (detect, entrypoints, index, rope, safe)
scripts/        prepack.ts (strip package.json/dts for publish), compare-size.sh (CI size report)
.github/        workflows/ (bench.yml, publish.yml), actions/bench/ (composite bench runner)
bench.ts        benchmark orchestrator: CLI, ranking, CI95, overview/markdown printers
justfile        dev + benchmark recipes (bench/test run commands directly; others shell out to npm scripts)
```

## WHERE TO LOOK

| Task                     | Location                                                                        |
| ------------------------ | ------------------------------------------------------------------------------- |
| Add/change a formatter   | `src/internal/ansi.ts` (`mapPalette`) + `src/types.ts`                          |
| Color detection behavior | `src/internal/detect.ts`                                                        |
| Entrypoint wiring        | `package.json` `exports` + `tsdown.config.ts` `entry`                           |
| Benchmark suites         | `benchmarks/*.ts`, orchestrated by `bench.ts`                                   |
| Publish lifecycle        | `package.json` scripts + `scripts/prepack.ts` + `.github/workflows/publish.yml` |

## CODE MAP

| Symbol                                                | File                       | Role                                                         |
| ----------------------------------------------------- | -------------------------- | ------------------------------------------------------------ |
| `detectColorSupport`                                  | `src/internal/detect.ts`   | env/argv detection, decided once at import                   |
| `fmt`                                                 | `src/internal/ansi.ts`     | nesting-safe formatter factory (close-code replacement scan) |
| `createColors`                                        | `src/internal/colors.ts`   | plain palette factory shared by root/auto/raw/noop           |
| `makeTemplateFormatter`                               | `src/internal/template.ts` | template-tag factory (`safe` only)                           |
| `createSafeColors`                                    | `src/safe.ts`              | template-tag color set                                       |
| `createRope`                                          | `src/rope.ts`              | chunk palette; `text`/`concat`/`render`                      |
| `parse`/`computeCI95`/`printOverview`/`printMarkdown` | `bench.ts`                 | result grouping, Welch CI95, output formats                  |

## CONVENTIONS

- Tabs, single quotes; formatting via dprint, linting via Biome (`biome check src/`).
- Node builtins imported named: `import { error, log } from 'node:console'` — never bare `console.log`/`process.exit`.
- No `any`, no `as` assertions (bench.ts holds the only two validated narrowings), no lint suppressions.
- Numeric literals use underscores (`10_000`); `as const` arrays with derived types.
- Import aliases (package.json `imports`): `#ansispeck` (src root), `#ansispeck-dist` / `#ansispeck-dist/*` (built dist), `#bench/*`, `#internal/*.ts`, `#pkg`. Never invent new alias names.

## ANTI-PATTERNS

- `raw`/`auto` ARE nesting-safe: `fmt()` replaces nested close codes; short inputs skip the scan via the
  `least` length guard. Never remove the scan without a benchmark and an explicit owner verdict.
- Never add a formatter to a single palette — `mapPalette` feeds all flavors; update `FormatterName` types and tests.
- No version bump commits — `bun pm version from-git` stamps the tag version at publish time.

## COMMANDS

- `run build` / `run build:quiet` — tsdown build (quiet = `-l error`); `run dev` — watch.
- `bun test`, `run lint`, `run typecheck` (tsgo), `run fmt` (dprint).
- `run bench` (= bench:bun then bench:node); `bun --bun bench.ts -f markdown|md|overview|json|quiet|mitata`.
- just: `bench-bun`/`bench-node`/`bench` (+ `-forced` variants, `bench-md-auto`/`bench-md-forced`) run
  `bun --bun bench.ts` / `node bench.ts` directly (NOT the `bench:*` npm scripts) so they control the color env;
  `test` runs `bun test` directly; `dev`, `lint`, `typecheck`, `tar`, `build` delegate to the npm scripts above.

## NOTES

- npm scripts are runner-based (`run ...` = `runner-run`); scripts never call the justfile. Justfile bench/test
  recipes duplicate the command strings — changing `bench:bun`/`bench:node` in package.json does NOT change `just bench-*`.
- `prepack` = quiet build + `scripts/prepack.ts` (strips scripts/devDeps/volta from package.json, strips dts comments);
  `postpack` restores package.json via git. `bun pm pack` triggers the whole chain.
- `scripts/compare-size.sh` measures the full dist import chain (entry + chunks) and is the CI-facing size path;
  `benchmarks/size.ts` is run directly for per-library file sizes.
- CI95 footer in bench output is `ansispeck/ext#1`: root vs fastest EXTERNAL library (internal `ansispeck/*` rows excluded).
