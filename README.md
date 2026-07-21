# ansispeck

[![NPM](https://img.shields.io/npm/v/ansispeck?logo=npm&labelColor=CB3837&color=black)][npm]
[![JSR](https://img.shields.io/jsr/v/@kjanat/ansispeck?logoColor=083344&logo=jsr&logoSize=auto&label=&labelColor=f7df1e&color=black)][jsr]
[![Socket](https://badge.socket.dev/npm/package/ansispeck)][socket]

[npm]: https://npm.im/ansispeck
[jsr]: https://jsr.io/@kjanat/ansispeck
[socket]: https://socket.dev/npm/package/ansispeck

~2 KB (gzipped) terminal ANSI color formatting with explicit entrypoints.

## Size

| Package       | Runtime     | Gzipped | Types   |
| ------------- | ----------- | ------- | ------- |
| ansispeck[^1] | **4.05 KB** | 1.79 KB | 9.03 KB |

[^1]:
    Default entry's full import chain (entry + shared chunks), minified by tsdown;\
    measured by `scripts/compare-size.sh`, regenerated at release.

## Benchmarks

See [BENCHMARKS] for full results across Bun and Node.

## Install

```sh
npm install ansispeck
```

## Usage

```ts
import c from "ansispeck";

console.log(c.red("Error!"));
console.log(c.bold(c.green("Success")));
console.log(c.bgYellow(c.black("Warning")));
```

### Explicit toggle

```ts
import { createColors } from "ansispeck";

const c = createColors(false); // force disable
console.log(c.red("plain text"));
```

## Entrypoints

| Import           | Behavior                                                              |
| ---------------- | --------------------------------------------------------------------- |
| `ansispeck`      | Auto-detected color support (alias: `ansispeck/auto`)                 |
| `ansispeck/raw`  | Always emits ANSI codes                                               |
| `ansispeck/noop` | Never emits codes — plain string coercion                             |
| `ansispeck/safe` | Template tags that re-open styles across interpolations (leak-proof)  |
| `ansispeck/rope` | Chunk/rope builders — O(1) styled composition, O(n) structural render |

All plain-formatter entrypoints (`auto`/`raw`/`noop`) share nesting-safe
close-code replacement, so composed styles never leak.

### safe

```ts
import { red, bold } from "ansispeck/safe";

const user = "wo\x1b[39mrld"; // hostile input cannot break the style
console.log(red`hello ${user}!`);
console.log(bold`${red`nested`} works too`);
```

### rope

```ts
import { red, blue, concat, render } from "ansispeck/rope";

const chunk = red(concat("a", blue("b"), "c")); // O(1), no string scans
console.log(render(chunk)); // re-opens red after blue closes — structurally
```

## API

All formatters accept `string | number | null | undefined` and return `string`.

### Styles

`reset` `bold` `dim` `italic` `underline` `inverse` `hidden` `strikethrough` `overline` `doubleUnderline` `blink`

### Colors

`black` `red` `green` `yellow` `blue` `magenta` `cyan` `white` `gray`/`grey`

### Bright colors

`blackBright` `redBright` `greenBright` `yellowBright` `blueBright` `magentaBright` `cyanBright` `whiteBright`

### Background

`bgBlack` `bgRed` `bgGreen` `bgYellow` `bgBlue` `bgMagenta` `bgCyan` `bgWhite`

### Bright background

`bgBlackBright` `bgRedBright` `bgGreenBright` `bgYellowBright` `bgBlueBright` `bgMagentaBright` `bgCyanBright` `bgWhiteBright`

### 256-color and truecolor

```ts
c.fg256(208)("orange"); // \x1b[38;5;208m
c.bg256(17)("navy bg"); // \x1b[48;5;17m
c.rgb(255, 136, 0)("orange"); // \x1b[38;2;255;136;0m
c.bgRgb(0, 0, 0)("black bg");
c.hex("#ff8800")("orange"); // #rgb and #rrggbb, # optional
c.bgHex("#f80")("orange bg");
```

### Links

- `link(url, text?)` — OSC 8 terminal hyperlink, accepts `string | URL`, `text` defaults to the URL; also usable as a template tag

```ts
import { pathToFileURL } from "node:url";

console.log(c.link("https://example.com", "docs"));
console.log(c.link(pathToFileURL("README.md"), "readme")); // file:// out of the box
console.log(c.link`https://example.com/issues/${42}`); // template tag, text = url
```

Hyperlink emission is gated independently of color (see [Detection](#detection)): with links off, `link` returns its text plain, so an omitted label degrades to the destination URL.

### Other exports

- `createColors(enabled?, hyperlinksEnabled?)` — create a color set; `hyperlinksEnabled` defaults to `enabled`
- `createSafeColors(enabled?, hyperlinksEnabled?)` (from `ansispeck/safe`) — template-tag color set
- `createRope(enabled?)` (from `ansispeck/rope`) — rope color set
- `isColorSupported` / `isHyperlinkSupported` — auto-detected booleans
- `detectColorSupport()` / `detectHyperlinkSupport()` — run detection on demand
- `strip(input)` — remove all ANSI SGR and OSC sequences

## Detection

**Color** respects `NO_COLOR`, `FORCE_COLOR`, `--no-color`, `--color`, `CI`, and TTY status.\
Explicit force (`FORCE_COLOR`/`--color`) beats explicit disable (`NO_COLOR`/`--no-color`),
which beats platform heuristics.

**Hyperlinks** are detected separately — OSC 8 support is orthogonal to SGR color — per the
[no-hyperlinks](https://no-hyperlinks.org/) convention: `NO_HYPERLINKS` / `--no-hyperlinks` beats
`FORCE_HYPERLINKS` / `--hyperlinks`, which beats TTY status. Non-interactive streams get no links.

## License

0BSD

[BENCHMARKS]: BENCHMARKS.md
