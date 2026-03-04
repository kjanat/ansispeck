# ansispeck

Tiny ANSI formatter with split entrypoints for speed and DX.

## Install

```sh
npm install ansispeck
```

## Entrypoints

- `ansispeck` - auto detect once (`NO_COLOR`, `FORCE_COLOR`, CLI flags, CI, TTY)
- `ansispeck/raw` - always emit ANSI (fastest hot path, no close-code repair)
- `ansispeck/noop` - always plain text
- `ansispeck/safe` - template-tag API that reopens style around interpolations
- `ansispeck/rope` - chunk builder (O(1) compose, O(n) single render)

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

`raw` is speed-first and does not repair embedded/nested close codes.
Use `ansispeck/safe` for interpolation-safe composition.

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

### Rope builder

```ts
import rope, { createRope } from 'ansispeck/rope';

const message = rope.red(rope.concat('Error ', rope.yellow('E42'), ' while parsing'));
console.log(rope.render(message));

const disabled = createRope(false);
console.log(disabled.render(disabled.red('plain text')));
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
