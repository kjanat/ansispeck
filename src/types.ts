/** Input accepted by all formatters. */
export type Formattable = string | number | boolean | bigint | null | undefined;

/** Wraps input in ANSI escape codes. */
export type Formatter = (input: Formattable) => string;

/** Template-tag formatter used by `ansispeck/safe`. */
export type TemplateFormatter = (strings: TemplateStringsArray, ...values: Formattable[]) => string;

/** ANSI text style modifier names. */
export type StyleName =
	| 'bold'
	| 'dim'
	| 'hidden'
	| 'inverse'
	| 'italic'
	| 'reset'
	| 'strikethrough'
	| 'underline';

/** Base 8 ANSI foreground color names. */
type BaseColorName =
	| 'black'
	| 'blue'
	| 'cyan'
	| 'gray'
	| 'green'
	| 'magenta'
	| 'red'
	| 'white'
	| 'yellow';

/** Only these get `Bright`/`bg` variants (so `gray` won't). */
type VariantBaseColorName = Exclude<BaseColorName, 'gray'>;

/** Union of all valid formatter keys. */
export type FormatterName =
	| StyleName
	| BaseColorName
	| `${VariantBaseColorName}Bright`
	| `bg${Capitalize<VariantBaseColorName>}`
	| `bg${Capitalize<VariantBaseColorName>}Bright`;

/** Plain formatter palette (raw/auto/noop entry points). */
export interface Palette extends Readonly<Record<FormatterName, Formatter>> {}

/** Template-tag palette (`ansispeck/safe`). */
export interface TemplatePalette extends Readonly<Record<FormatterName, TemplateFormatter>> {}

/** Back-compat alias retained for migration ease. */
export type Colors = Palette;
