/** Input accepted by all formatters. */
export type Formattable = string | number | null | undefined;

/** Wraps input in ANSI escape codes. */
export type Formatter = (input: Formattable) => string;

/** ANSI text style modifier names. */
export type Style =
	| 'bold'
	| 'dim'
	| 'hidden'
	| 'inverse'
	| 'italic'
	| 'reset'
	| 'strikethrough'
	| 'underline';

/** Base 8 ANSI foreground color names. */
type BaseColor =
	| 'black'
	| 'blue'
	| 'cyan'
	| 'gray'
	| 'green'
	| 'magenta'
	| 'red'
	| 'white'
	| 'yellow';

/** Only these get `Bright`/`bg` variants (so `gray` won't).
 *
 * Note: `gray` is intentionally excluded from {@linkcode BaseColor} and thus from
 * {@linkcode VariantBaseColor} to prevent invalid keys like
 * `grayBright` or `bgGray`.
 */
export type VariantBaseColor = Exclude<BaseColor, 'gray'>;

/** Union of all valid {@linkcode Colors} property keys. */
export type ColorKey =
	| Style
	| BaseColor // includes 'gray' as a direct key
	| `${VariantBaseColor}Bright`
	| `bg${Capitalize<VariantBaseColor>}`
	| `bg${Capitalize<VariantBaseColor>}Bright`;

/** All available color/style formatters plus color-support flag. */
export interface Colors extends Readonly<Record<ColorKey, Formatter>> {
	readonly isColorSupported: boolean;
}
