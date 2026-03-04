# ansispeck

Sub-kilobyte terminal ANSI color formatting.

## Size

| Package       | Runtime     | Gzipped | Types   |
| ------------- | ----------- | ------- | ------- |
| ansispeck[^1] | **1.31 KB** | 0.68 KB | 2.21 KB |

## Benchmarks

See [BENCHMARKS.md] for full results across Bun and Node.

## Install

```sh
npm install ansispeck
```

## Usage

```ts
import c from 'ansispeck';

console.log(c.red('Error!'));
console.log(c.bold(c.green('Success')));
console.log(c.bgYellow(c.black('Warning')));
```

### Explicit toggle

```ts
import { createColors } from 'ansispeck';

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

0BSD

[BENCHMARKS.md]: BENCHMARKS.md

[^1]: ansispeck 0.1.0, `dist/index.js` minified by tsdown.
