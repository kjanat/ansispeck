# femtocolors

Sub-kilobyte terminal ANSI color formatting. Drop-in picocolors replacement.

## Size

| Package         | Runtime     | Gzipped | Types   |
| --------------- | ----------- | ------- | ------- |
| femtocolors[^1] | **1.31 KB** | 0.69 KB | 2.21 KB |
| picocolors[^2]  | 2.60 KB     | 0.80 KB | 1.12 KB |

[^1]: femtocolors 0.1.0 (`44c48dd`), `dist/index.mjs` minified by tsdown.

[^2]: picocolors 1.1.1, `picocolors.js` (unminified CJS).

## Benchmarks

See [BENCHMARKS.md](BENCHMARKS.md) for full results across Bun and Node.

## Install

```sh
npm install femtocolors
```

## Usage

```ts
import c from 'femtocolors';

console.log(c.red('Error!'));
console.log(c.bold(c.green('Success')));
console.log(c.bgYellow(c.black('Warning')));
```

### Explicit toggle

```ts
import { createColors } from 'femtocolors';

const c = createColors(false); // force disable
console.log(c.red('plain text'));
```

## API

All formatters accept `string | number | null | undefined` and return `string`.

### Styles

`reset` `bold` `dim` `italic` `underline` `inverse` `hidden` `strikethrough`

### Colors

`black` `red` `green` `yellow` `blue` `magenta` `cyan` `white` `gray`

### Bright colors

`blackBright` `redBright` `greenBright` `yellowBright` `blueBright` `magentaBright` `cyanBright` `whiteBright`

### Background

`bgBlack` `bgRed` `bgGreen` `bgYellow` `bgBlue` `bgMagenta` `bgCyan` `bgWhite`

### Bright background

`bgBlackBright` `bgRedBright` `bgGreenBright` `bgYellowBright` `bgBlueBright` `bgMagentaBright` `bgCyanBright` `bgWhiteBright`

### Other exports

- `createColors(enabled?: boolean)` — create a color set with explicit toggle
- `isColorSupported` — auto-detected boolean

## Color detection

Respects `NO_COLOR`, `FORCE_COLOR`, `--no-color`, `--color`, `CI`, and TTY status.

## License

[MIT](https://github.com/kjanat/femtocolors/blob/master/LICENSE)
