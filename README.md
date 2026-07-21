# ansispeck

[![NPM](https://img.shields.io/npm/v/ansispeck?logo=npm&labelColor=CB3837&color=black)][npm]
[![JSR](https://img.shields.io/jsr/v/@kjanat/ansispeck?logoColor=083344&logo=jsr&logoSize=auto&label=&labelColor=f7df1e&color=black)][jsr]
[![Socket](https://badge.socket.dev/npm/package/ansispeck)][socket]

[npm]: https://npm.im/ansispeck
[jsr]: https://jsr.io/@kjanat/ansispeck
[socket]: https://socket.dev/npm/package/ansispeck

~2 KB (gzipped) terminal ANSI color formatting with explicit entrypoints.

## Install

```sh
npm install ansispeck
```

## Quick start

```ts
import { bold, green, red } from "ansispeck";

console.log(`${red("Error:")} ${bold(green("recovered"))}`);
```

The root import detects color support once when it loads. Its color and style
functions emit ANSI when enabled and return plain text otherwise. For most
programs, this is the only entrypoint you need.

## Which entrypoint should I use?

| Import                          | API                                  | Use it when                                                   |
| ------------------------------- | ------------------------------------ | ------------------------------------------------------------- |
| `ansispeck` or `ansispeck/auto` | Ordinary functions returning strings | You want colors that follow terminal and environment settings |
| `ansispeck/safe`                | Tagged templates returning strings   | An enclosing style must survive interpolated or styled values |
| `ansispeck/rope`                | Composable chunks rendered later     | You build large or deeply nested output before rendering it   |
| `ansispeck/raw`                 | Ordinary functions, always enabled   | You need ANSI codes regardless of color detection             |
| `ansispeck/noop`                | Ordinary functions, always disabled  | You need guaranteed plain text                                |

The enabled ordinary formatters (`auto` and `raw`) already preserve styles when
you nest function calls. The `safe` and `rope` entrypoints provide different
ways to compose output when ordinary string functions are not the best fit.

### Safe templates

`ansispeck/safe` exports template tags. When template text follows an
interpolation, the outer style is restored first, even if the interpolated value
contains ANSI close codes.

```ts
import { bold, red } from "ansispeck/safe";

const status = bold`OK`;
console.log(red`Status: ${status} - this remains red`);
```

Use template syntax with this entrypoint: `red` is a tag here, not a function
called as `red("text")`.

### Rope composition

`ansispeck/rope` builds a chunk tree. Styling and concatenation add chunks
without flattening the whole value; `render` creates the final string once at
the end.

```ts
import { concat, dim, red, render } from "ansispeck/rope";

const line = concat(dim("12:34 "), red("ERROR"), " something broke");

console.log(render(line));
```

This is useful for deferred composition in hot paths such as log records,
tables, and other output assembled from many pieces.

### Rule of thumb

- Formatting ordinary strings: use `ansispeck`.
- Composing tagged templates with interpolated styles: use `ansispeck/safe`.
- Building a large chunk tree to render once: use `ansispeck/rope`.
- Requiring an unconditional mode: use `ansispeck/raw`, `ansispeck/noop`, or a
  factory with an explicit toggle.

## Explicit control

Use a factory when detection is not what you want:

```ts
import { createColors } from "ansispeck";

const forced = createColors(true);
const plain = createColors(false);
const colorsWithoutLinks = createColors(true, false);

console.log(forced.red("always colored"));
console.log(plain.red("always plain"));
console.log(colorsWithoutLinks.link("https://example.com", "plain link text"));
```

`createSafeColors` from `ansispeck/safe` accepts separate color and hyperlink
toggles. `createRope` from `ansispeck/rope` accepts a color toggle.

## API

Ordinary color and style formatters accept strings, numbers, booleans, bigints,
`null`, or `undefined` and return a string. Safe formatters are template tags,
while rope formatters accept values or chunks and return a chunk.

### Styles

`reset` `bold` `dim` `italic` `underline` `inverse` `hidden` `strikethrough` `overline` `doubleUnderline` `blink`

### Colors

`black` `red` `green` `yellow` `blue` `magenta` `cyan` `white` `gray`/`grey`

### Bright colors

`blackBright` `redBright` `greenBright` `yellowBright` `blueBright` `magentaBright` `cyanBright` `whiteBright`

### Backgrounds

`bgBlack` `bgRed` `bgGreen` `bgYellow` `bgBlue` `bgMagenta` `bgCyan` `bgWhite`

### Bright backgrounds

`bgBlackBright` `bgRedBright` `bgGreenBright` `bgYellowBright` `bgBlueBright` `bgMagentaBright` `bgCyanBright` `bgWhiteBright`

### 256-color and truecolor

```ts
import c from "ansispeck";

c.fg256(208)("orange"); // \x1b[38;5;208m
c.bg256(17)("navy background"); // \x1b[48;5;17m
c.rgb(255, 136, 0)("orange"); // \x1b[38;2;255;136;0m
c.bgRgb(0, 0, 0)("black background");
c.hex("#ff8800")("orange"); // #rgb and #rrggbb; # is optional
c.bgHex("#f80")("orange background");
```

### Links

`link(url, text?)` creates an OSC 8 terminal hyperlink. It accepts a string or
`URL`; when text is omitted, the URL is also used as the label. It can also be
used as a template tag.

```ts
import { link } from "ansispeck";
import { pathToFileURL } from "node:url";

console.log(link("https://example.com", "docs"));
console.log(link(pathToFileURL("README.md"), "readme"));
console.log(link`https://example.com/issues/${42}`);
```

Hyperlink detection is independent of color detection. When links are disabled,
`link` returns its label as plain text; without a label, it returns the URL.

### Whitespace

`space()` and `tab()` return one space or tab. Pass a count to repeat it:

```ts
import { space, tab } from "ansispeck";

space(); // " "
space(4); // "    "
tab(2); // "\t\t"
```

### Other exports

- `isColorSupported` / `isHyperlinkSupported` - auto-detected booleans
- `detectColorSupport()` / `detectHyperlinkSupport()` - run detection on demand
- `strip(input)` - remove ANSI SGR and OSC sequences

## Detection

**Color** respects [`NO_COLOR`](https://no-color.org/), `FORCE_COLOR`,
`--no-color`, `--color`, `CI`, and TTY status. Explicit force
(`FORCE_COLOR`/`--color`) beats explicit disable (`NO_COLOR`/`--no-color`),
which beats platform heuristics.

**Hyperlinks** are detected separately, following the
[no-hyperlinks](https://no-hyperlinks.org/) convention. `NO_HYPERLINKS` /
`--no-hyperlinks` beats `FORCE_HYPERLINKS` / `--hyperlinks`, which beats TTY
status. Without an explicit override, non-interactive streams get no links.

## Size

| Package       | Runtime     | Gzipped | Types    |
| ------------- | ----------- | ------- | -------- |
| ansispeck[^1] | **5.54 KB** | 2.44 KB | 15.83 KB |

[^1]:
    Default entry's full import chain (entry + shared chunks), minified by tsdown;\
    measured by [`scripts/compare-size.sh`](scripts/compare-size.sh) for the
    current [benchmark snapshot][BENCHMARKS].

## Benchmarks

See [BENCHMARKS] for full results across Bun, Deno, and Node.

## License

0BSD

[BENCHMARKS]: BENCHMARKS.md
