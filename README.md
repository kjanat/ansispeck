# femtocolor

Sub-kilobyte terminal ANSI color formatting. Drop-in picocolors replacement.

## Size

| Package       | Runtime      | Gzipped | Types   |
| ------------- | ------------ | ------- | ------- |
| femtocolor[^1] | **1.37 KB** | 0.70 KB | 2.26 KB |
| picocolors[^2] | 2.66 KB     | 0.80 KB | 1.15 KB |

[^1]: femtocolor 0.1.0 (`8f4ea8c`), `dist/index.mjs` minified by tsdown.
[^2]: picocolors 1.1.1, `picocolors.js` (unminified CJS).

## Install

```sh
npm install femtocolor
```

## Usage

```ts
import c from 'femtocolor';

console.log(c.red('Error!'));
console.log(c.bold(c.green('Success')));
console.log(c.bgYellow(c.black('Warning')));
```

### Explicit toggle

```ts
import { createColors } from 'femtocolor';

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

[MIT](https://github.com/kjanat/femtocolor/blob/master/LICENSE)
