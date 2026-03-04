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

/** Internal brand for rope/chunk nodes. */
export const CHUNK_BRAND: unique symbol = Symbol('ansispeck.chunk');

/** Rope text leaf. */
export interface TextChunk {
	readonly [CHUNK_BRAND]: true;
	readonly kind: 'text';
	readonly value: string;
}

/** Rope concat node (O(1) composition). */
export interface ConcatChunk {
	readonly [CHUNK_BRAND]: true;
	readonly kind: 'concat';
	readonly left: Chunk;
	readonly right: Chunk;
}

/** Rope style wrapper node. */
export interface StyledChunk {
	readonly [CHUNK_BRAND]: true;
	readonly kind: 'style';
	readonly open: string;
	readonly close: string;
	readonly inner: Chunk;
}

/** Immutable chunk tree used by rope API. */
export type Chunk = TextChunk | ConcatChunk | StyledChunk;

/** Values accepted by rope operations. */
export type Chunkable = Chunk | Formattable;

/** Chunk formatter used by rope entrypoint. */
export type ChunkFormatter = (input: Chunkable) => Chunk;

/** Rope formatter palette (`ansispeck/rope`). */
export interface ChunkPalette extends Readonly<Record<FormatterName, ChunkFormatter>> {}

/** Rope API for O(1) composition + O(n) final render. */
export interface Rope extends ChunkPalette {
	readonly isColorSupported: boolean;
	readonly text: (input: Formattable) => Chunk;
	readonly concat: (...inputs: readonly Chunkable[]) => Chunk;
	readonly render: (input: Chunkable) => string;
}
