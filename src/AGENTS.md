# src/AGENTS.md

## STRUCTURE

```
index.ts      root entrypoint: createColors(detectColorSupport()), named + default exports, re-exports types
auto.ts       alias of root (`export * from '#ansispeck'`) — behavior-identical to the root
raw.ts        createColors(true): always emits ANSI codes regardless of environment
noop.ts       createColors(false): formatters coerce input to string, no ANSI codes
safe.ts       createSafeColors: template-tag palette, styles re-open after every interpolation
rope.ts       createRope: chunk tree (text/concat/style nodes), O(1) compose + O(n) render
types.ts      shared public types + CHUNK_BRAND symbol
internal/
  ansi.ts     ANSI codes, fmt() formatter factory, mapPalette, strip, mkLink
  colors.ts   createColors factory shared by root/auto/raw/noop
  detect.ts   detectColorSupport
  template.ts makeTemplateFormatter (only `safe` pulls this in)
```

## WHERE TO LOOK

| Task                            | Location                                                                 |
| ------------------------------- | ------------------------------------------------------------------------ |
| New style/color formatter       | `internal/ansi.ts` `mapPalette` + `types.ts` `FormatterName`/`StyleName` |
| Detection precedence            | `internal/detect.ts`                                                     |
| Nesting safety / close handling | `internal/ansi.ts` `fmt()`; `rope.ts` `renderChunk`                      |
| 256/truecolor factories         | `Factories<T>` in `types.ts`, wired in each `create*`                    |

## CONVENTIONS

- Root and `auto` are behavior-identical: `auto.ts` re-exports the root module.
- Detection precedence: `FORCE_COLOR`/`--color` > `NO_COLOR`/`--no-color` >
  `win32` > `CI` > TTY (with `TERM !== 'dumb'`). Decided ONCE at import;
  `createColors(enabled)` / `createSafeColors(enabled)` / `createRope(enabled)`
  exist for explicit control.
- Input coercion is `'' + input` (`text` in `internal/ansi.ts`); keep it
  consistent across flavors.
- Rope formatters return `Chunk` nodes — callers must `render()` to get a
  string. The renderer re-opens enclosing styles structurally (matching close
  code or reset), so rope needs no string scanning.

## NESTING SAFETY (load-bearing — read before touching `fmt`)

`fmt(open, close, replace = open)` replaces every nested `close` occurrence in
the input with `replace` (bold/dim use `ME + open` since they share close code
`\x1b[22m`), so nested same-close styles never leak. Fast path:
`skip = min(open.length, close.length)`, `least = skip + close.length`; inputs
shorter than `least` provably contain no nested close and return via pure O(1)
concat without calling `indexOf`. This applies to every ENABLED palette built on
`createColors` (root/`auto` when color is detected, and `raw`); `noop`
(`createColors(false)`) swaps in the plain-coercion formatter and never enters
`fmt` at all.

## ANTI-PATTERNS

- Do NOT remove the close-replacement scan from `fmt()` "for speed" — the length
  guard already gives short inputs an O(1) path. Removal requires a benchmark
  plus an explicit owner verdict.
- No single-palette formatter additions: `mapPalette` builds every flavor
  (plain, template, chunk); a new formatter must land in `mapPalette`, the
  `types.ts` unions, every entrypoint's destructured export list, and `tests/`.
- No casual detection-precedence changes — `detect.ts` documents the order;
  tests in `tests/detect.test.ts` pin it.
- Subpath (entrypoint) changes must update `package.json` `exports` AND
  `tsdown.config.ts` `entry` together.

## NOTES

- `internal/` is bundled into a shared chunk (`tsdown.config.ts` `codeSplitting`
  groups ansi/colors/detect).
- `gray` deliberately has no `Bright`/`bg` variants (`VariantBaseColorName`
  excludes it).
- Behavior changes require matching test updates in `tests/`.
