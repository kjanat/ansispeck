# SRC KNOWLEDGE BASE

## OVERVIEW

`src/` owns runtime behavior for all public entrypoints plus shared formatter/type contracts.

## STRUCTURE

```text
src/
├── index.ts        # root: createColors(detectColorSupport()), re-exports all public types
├── auto.ts         # re-exports root (`export * from '#ansispeck'`)
├── raw.ts          # createColors(true): always emit ANSI
├── noop.ts         # createColors(false): plain-text passthrough
├── safe.ts         # createSafeColors: template-tag formatters
├── rope.ts         # createRope: chunk tree + iterative renderer
├── types.ts        # Formattable, Formatter, Palette, Colors, Rope, Chunk, ...
└── internal/
    ├── ansi.ts     # ANSI codes, fmt(), mapPalette(), strip(), link helpers
    ├── colors.ts   # createColors factory (auto/raw/noop)
    ├── detect.ts   # detectColorSupport()
    └── template.ts # makeTemplateFormatter (only `safe` pulls this in)
```

## WHERE TO LOOK

| Task                    | Location                          | Notes                                             |
| ----------------------- | --------------------------------- | ------------------------------------------------- |
| Root export wiring      | `index.ts`                        | Destructured palette export + type re-exports     |
| Detection               | `internal/detect.ts`              | `FORCE_COLOR`/`--color` > `NO_COLOR`/`--no-color` |
|                         |                                   | > win32 > `CI` > TTY && `TERM != dumb`            |
| Formatter hot path      | `internal/ansi.ts` `fmt()`        | Close-code scan: skip = min(open, close) length,  |
|                         |                                   | `least` guard makes short inputs O(1)             |
| Palette definition      | `internal/ansi.ts` `mapPalette()` | Single source of truth for all SGR codes          |
| Safe template semantics | `safe.ts`, `internal/template.ts` | Re-opens style after every interpolated value     |
| Rope render             | `rope.ts` `renderChunk`           | Iterative stack walk; re-opens enclosing styles   |
|                         |                                   | structurally when close codes collide             |
| Hyperlinks              | `internal/ansi.ts` `mkLink`       | OSC 8; `(url, text?)` call or template tag        |
| Public typing contracts | `types.ts`                        | `CHUNK_BRAND` symbol brands rope chunks           |

## CONVENTIONS

- Root import and `ansispeck/auto` must stay behavior-identical.
- All entrypoints with ANSI output (root/auto/raw) repair nested close codes via `fmt()` — they are nesting-safe.
- `noop` still coerces input to string (`'' + input`), matching the other flavors.
- `bold`/`dim` share close code `\x1b[22m`; `fmt()` takes a `replace` code (`close + open`) to survive nesting.
- `gray` has no `Bright`/`bg` variants (see `VariantBaseColorName` in `types.ts`).
- Factories (`createColors`, `createSafeColors`, `createRope`) default `enabled` to `detectColorSupport()`.

## ANTI-PATTERNS

- Do not add scan work to `fmt()` without benchmark proof; the `least` guard exists so short inputs skip it.
- Do not add a formatter name in one entrypoint only; update `mapPalette`, every entrypoint's destructured export list, `types.ts`, and tests.
- Do not change exported subpaths without updating `package.json` exports and `tsdown.config.ts`.
- Do not import `internal/template.ts` outside `safe.ts`; the chunk split keeps it out of the default import chain.
