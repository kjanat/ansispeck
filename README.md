# ansispeck

Tiny ANSI formatter with split entrypoints for speed and DX.

## Install

```sh
npm install ansispeck
```

## Entrypoints

- `ansispeck` - auto detect once (`NO_COLOR`, `FORCE_COLOR`, CLI flags, CI, TTY)
- `ansispeck/raw` - always emit ANSI (fastest hot path)
- `ansispeck/noop` - always plain text
- `ansispeck/safe` - template-tag API that reopens style around interpolations

## Usage

### Auto (default)

```ts
import { bgYellow, black, bold, red } from 'ansispeck';

console.log(red('Error!'));
console.log(bold('Strong'));
console.log(bgYellow(black('Warning')));
```

### Raw (always color)

```ts
import { blue, red } from 'ansispeck/raw';

console.log(blue(red('always colored')));
```

### Noop (always plain text)

```ts
import { red } from 'ansispeck/noop';

console.log(red('no escape codes'));
```

### Safe tagged templates

```ts
import { red, yellow } from 'ansispeck/safe';

const msg = red`Error ${yellow`E42`} while parsing`;
console.log(msg);
```

## API Shape

All formatter functions accept:

- `string | number | boolean | bigint | null | undefined`

And return `string`.

Formatter names:

- styles: `reset bold dim italic underline inverse hidden strikethrough`
- fg: `black red green yellow blue magenta cyan white gray`
- bg: `bgBlack bgRed bgGreen bgYellow bgBlue bgMagenta bgCyan bgWhite`
- bright fg/bg variants for non-gray colors

## Benchmarks

See [BENCHMARKS.md] for current benchmark tables.

## License

0BSD

[BENCHMARKS.md]: BENCHMARKS.md
