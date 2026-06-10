# ansispeck

~1 KB (gzipped) terminal ANSI color formatting.

## Size

| Package       | Runtime     | Gzipped | Types   |
| ------------- | ----------- | ------- | ------- |
| ansispeck[^1] | **1.31 KB** | 0.68 KB | 2.21 KB |

[^1]: ansispeck [`5625fc7`](https://github.com/kjanat/ansispeck/commit/5625fc7), `dist/index.js` minified by tsdown.

## Benchmarks

See [BENCHMARKS.md](BENCHMARKS.md) for full results across Bun and Node.

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

## API

All formatters accept `string | number | null | undefined` and return `string`.

### Styles

`reset` `bold` `dim` `italic` `underline` `inverse` `hidden` `strikethrough` `overline` `doubleUnderline` `blink`

### Colors

`black` `red` `green` `yellow` `blue` `magenta` `cyan` `white` `gray`

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

### Other exports

- `createColors(enabled?: boolean)` — create a color set with explicit toggle
- `isColorSupported` — auto-detected boolean
- `strip(input)` — remove all ANSI SGR and OSC sequences

## Color detection

Respects `NO_COLOR`, `FORCE_COLOR`, `--no-color`, `--color`, `CI`, and TTY status.

## License

0BSD
