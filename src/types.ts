/**
 * Shared public types for all entrypoints.
 *
 * @module ansispeck/types
 */

/** Input accepted by all formatters. */
export type Formattable = string | number | boolean | bigint | null | undefined;

/** Wraps input in ANSI escape codes. */
export type Formatter = (input: Formattable) => string;

/**
 * Wraps text in an OSC 8 terminal hyperlink. Text defaults to the URL.
 *
 * Emission is gated by hyperlink support ({@link Colors.isHyperlinkSupported}),
 * which is independent of color. When unsupported, the text is returned
 * plain — so an omitted label degrades to the destination URL.
 *
 * @see https://no-hyperlinks.org/
 */
export interface LinkFormatter {
	(url: string | InstanceType<typeof URL>, text?: Formattable | InstanceType<typeof URL>): string;
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
export type BaseColorName = 'black' | 'blue' | 'cyan' | 'gray' | 'green' | 'magenta' | 'red' | 'white' | 'yellow';

/** Only these get `Bright`/`bg` variants (so `gray` won't). */
export type VariantBaseColorName = Exclude<BaseColorName, 'gray'>;

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
	/** Set the background with a 256-color palette index. */
	readonly bg256: (n: number) => T;
	/** Set the background from a `#rgb` or `#rrggbb` hex string. */
	readonly bgHex: (color: string) => T;
	/** Set the background with a 24-bit RGB triple. */
	readonly bgRgb: (r: number, g: number, b: number) => T;
	/** Color the foreground with a 256-color palette index. */
	readonly fg256: (n: number) => T;
	/** Color the foreground from a `#rgb` or `#rrggbb` hex string. */
	readonly hex: (color: string) => T;
	/** Color the foreground with a 24-bit RGB triple. */
	readonly rgb: (r: number, g: number, b: number) => T;
}

/** All available color/style formatters plus support flags. */
export interface Colors extends Palette, Factories<Formatter> {
	/** Whether ANSI output is enabled. */
	readonly isColorSupported: boolean;
	/** Whether {@link link} emits OSC 8 sequences. Independent of color. */
	readonly isHyperlinkSupported: boolean;
	/** Wrap text in an OSC 8 terminal hyperlink. */
	readonly link: LinkFormatter;
}

/** Template-tag color set (`ansispeck/safe`). */
export interface SafeColors extends TemplatePalette, Factories<TemplateFormatter> {
	/** Whether ANSI output is enabled. */
	readonly isColorSupported: boolean;
	/** Whether {@link link} emits OSC 8 sequences. Independent of color. */
	readonly isHyperlinkSupported: boolean;
	/** Wrap text in an OSC 8 terminal hyperlink. */
	readonly link: LinkFormatter;
}

/** Internal brand for rope/chunk nodes. */
export const CHUNK_BRAND: unique symbol = Symbol('ansispeck.chunk');

/** Rope text leaf. */
export interface TextChunk {
	/** Discriminant for a text leaf. */
	readonly kind: 'text';
	/** String value stored by the leaf. */
	readonly value: string;
	/** Identifies this value as an ansispeck chunk. */
	readonly [CHUNK_BRAND]: true;
}

/** Rope concat node (O(1) composition). */
export interface ConcatChunk {
	/** Discriminant for a concatenation node. */
	readonly kind: 'concat';
	/** Left child. */
	readonly left: Chunk;
	/** Right child. */
	readonly right: Chunk;
	/** Identifies this value as an ansispeck chunk. */
	readonly [CHUNK_BRAND]: true;
}

/** Rope style wrapper node. */
export interface StyledChunk {
	/** ANSI sequence that closes the style. */
	readonly close: string;
	/** Chunk wrapped by the style. */
	readonly inner: Chunk;
	/** Discriminant for a style node. */
	readonly kind: 'style';
	/** ANSI sequence that opens the style. */
	readonly open: string;
	/** Identifies this value as an ansispeck chunk. */
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
	/** Concatenate chunks and values into one chunk. */
	readonly concat: (...inputs: readonly Chunkable[]) => Chunk;
	/** Whether ANSI output is enabled. */
	readonly isColorSupported: boolean;
	/** Render a chunk tree or plain value to a string. */
	readonly render: (input: Chunkable) => string;
	/** Create a text leaf chunk. */
	readonly text: (input: Formattable) => Chunk;
}
