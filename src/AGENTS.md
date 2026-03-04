# SRC KNOWLEDGE BASE

## OVERVIEW

`src/` owns runtime behavior for all public entrypoints and shared formatter/type contracts.

## STRUCTURE

```text
src/
├── index.ts
├── auto.ts
├── raw.ts
├── noop.ts
├── safe.ts
├── rope.ts
├── types.ts
└── internal/
    ├── ansi.ts
    └── detect.ts
```

## WHERE TO LOOK

| Task                                      | Location                        | Notes                                          |
| ----------------------------------------- | ------------------------------- | ---------------------------------------------- |
| Root export wiring                        | `index.ts`                      | Should mirror `auto` runtime + type re-exports |
| Auto/noop/raw switching                   | `auto.ts`, `internal/detect.ts` | Decision happens once at import time           |
| ANSI code maps and formatter constructors | `internal/ansi.ts`              | Shared by raw/safe/rope                        |
| Raw formatter behavior                    | `raw.ts`                        | Keep fast path simple; no close-code repair    |
| Safe template interpolation semantics     | `safe.ts`                       | Reopens style across substitutions             |
| Rope chunk rendering                      | `rope.ts`                       | O(1) compose nodes, O(n) render traversal      |
| Public typing contracts                   | `types.ts`                      | Keep entrypoints and tests aligned             |

## CONVENTIONS

- `ansispeck` root import and `ansispeck/auto` must stay behavior-identical.
- Auto precedence: `NO_COLOR` / `--no-color` first, then force-color, then platform/CI/TTY checks.
- `raw` is intentionally unsafe for embedded close-code repair (perf tradeoff).
- `safe` is correctness path for nested/interpolated styling.
- `rope` returns chunk nodes from formatters; callers must `render(...)` for final string.

## ANTI-PATTERNS

- Do not introduce scan/replace close-code repair into `raw` hot path without benchmark proof.
- Do not add public formatter names in one entrypoint only; update all palettes + `types.ts` + tests.
- Do not alter detection precedence order unless explicitly intended as behavior break.
- Do not change exported subpath surfaces without updating `package.json` + `tsdown.config.ts`.

## NOTES

- If behavior changes in `raw`/`safe`/`rope`, update `tests/index.test.ts` entrypoint sections.
- Keep Formattable-compatible coercion behavior consistent (`'' + input`) across formatter constructors.
