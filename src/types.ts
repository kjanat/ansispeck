/**
 * @module ansispeck/types
 * Shared public types for all entrypoints.
 */

/** Input accepted by all formatters. */
export type Formattable = string | number | boolean | bigint | null | undefined;

/** Wraps input in ANSI escape codes. */
export type Formatter = (input: Formattable) => string;

/** Wraps text in an OSC 8 terminal hyperlink. Text defaults to the URL. */
export interface LinkFormatter {
	(url: string | URL, text?: Formattable | URL): string;
	(strings: TemplateStringsArray, ...values: readonly unknown[]): string;
}

/** Template-tag formatter (`ansispeck/safe`) that re-opens its style across interpolations. */
export type TemplateFormatter = (strings: TemplateStringsArray, ...values: readonly Formattable[]) => string;

/** ANSI text style modifier names. */
export type StyleName =
	| 'blink'
	| 'bold'
	| 'dim'
	| 'doubleUnderline'
	| 'hidden'
	| 'inverse'
	| 'italic'
	| 'overline'
	| 'reset'
	| 'strikethrough'
	| 'underline';

/** Base 8 ANSI foreground color names (plus gray). */
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

/** Plain formatter palette (`raw`/`auto`/`noop` entrypoints). */
export interface Palette extends Readonly<Record<FormatterName, Formatter>> {}

/** Template-tag palette (`ansispeck/safe`). */
export interface TemplatePalette extends Readonly<Record<FormatterName, TemplateFormatter>> {}

/** 256-color and truecolor formatter factories, generic over formatter flavor. */
export interface Factories<T> {
	readonly bg256: (n: number) => T;
	readonly bgHex: (color: string) => T;
	readonly bgRgb: (r: number, g: number, b: number) => T;
	readonly fg256: (n: number) => T;
	readonly hex: (color: string) => T;
	readonly rgb: (r: number, g: number, b: number) => T;
}

/** All available color/style formatters plus color-support flag. */
export interface Colors extends Palette, Factories<Formatter> {
	readonly isColorSupported: boolean;
	readonly link: LinkFormatter;
}

/** Template-tag color set (`ansispeck/safe`). */
export interface SafeColors extends TemplatePalette, Factories<TemplateFormatter> {
	readonly isColorSupported: boolean;
	readonly link: LinkFormatter;
}

/** Internal brand for rope/chunk nodes. */
export const CHUNK_BRAND: unique symbol = Symbol('ansispeck.chunk');

/** Rope text leaf. */
export interface TextChunk {
	readonly kind: 'text';
	readonly value: string;
	readonly [CHUNK_BRAND]: true;
}

/** Rope concat node (O(1) composition). */
export interface ConcatChunk {
	readonly kind: 'concat';
	readonly left: Chunk;
	readonly right: Chunk;
	readonly [CHUNK_BRAND]: true;
}

/** Rope style wrapper node. */
export interface StyledChunk {
	readonly close: string;
	readonly inner: Chunk;
	readonly kind: 'style';
	readonly open: string;
	readonly [CHUNK_BRAND]: true;
}

/** Immutable chunk tree used by the rope API. */
export type Chunk = TextChunk | ConcatChunk | StyledChunk;

/** Values accepted by rope operations. */
export type Chunkable = Chunk | Formattable;

/** Chunk formatter used by the rope entrypoint. */
export type ChunkFormatter = (input: Chunkable) => Chunk;

/** Rope formatter palette (`ansispeck/rope`). */
export interface ChunkPalette extends Readonly<Record<FormatterName, ChunkFormatter>> {}

/** Rope API for O(1) composition + O(n) final render. */
export interface Rope extends ChunkPalette, Factories<ChunkFormatter> {
	readonly concat: (...inputs: readonly Chunkable[]) => Chunk;
	readonly isColorSupported: boolean;
	readonly render: (input: Chunkable) => string;
	readonly text: (input: Formattable) => Chunk;
}
