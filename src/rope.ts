/**
 * Chunk/rope entrypoint: O(1) styled composition, O(n) render.
 * The renderer re-opens enclosing styles structurally, so nested
 * styles sharing a close code never leak — no string scanning.
 *
 * @module ansispeck/rope
 */

import type { Wrap } from './internal/ansi.ts';
import {
	BG_CLOSE,
	FG_CLOSE,
	bg256Open,
	bgHexOpen,
	bgRgbOpen,
	c,
	fg256Open,
	hexOpen,
	mapPalette,
	rgbOpen,
} from './internal/ansi.ts';
import { detectColorSupport } from './internal/detect.ts';
import type {
	Chunk,
	ChunkFormatter,
	Chunkable,
	ConcatChunk,
	Formattable,
	Rope,
	StyledChunk,
	TextChunk,
} from './types.ts';
import { CHUNK_BRAND } from './types.ts';

const RESET = c(0);

const textNode = (input: Formattable): TextChunk => ({
	[CHUNK_BRAND]: true,
	kind: 'text',
	value: '' + input,
});

const concatNode = (left: Chunk, right: Chunk): ConcatChunk => ({
	[CHUNK_BRAND]: true,
	kind: 'concat',
	left,
	right,
});

const styleNode = (open: string, close: string, inner: Chunk): StyledChunk => ({
	[CHUNK_BRAND]: true,
	kind: 'style',
	open,
	close,
	inner,
});

const isChunk = (value: Chunkable): value is Chunk =>
	typeof value === 'object' && value !== null && CHUNK_BRAND in value;

const toChunk = (input: Chunkable): Chunk => (isChunk(input) ? input : textNode(input));

/** Create a text leaf chunk. */
export const text = (input: Formattable): Chunk => textNode(input);

/** Concatenate chunks/values into a single chunk (O(1) per node). */
export const concat = (...inputs: readonly Chunkable[]): Chunk => {
	let output: Chunk | undefined;
	for (const current of inputs) {
		if (current === undefined) continue;
		const node = toChunk(current);
		output = output === undefined ? node : concatNode(output, node);
	}
	return output ?? textNode('');
};

type StyleFrame = { readonly open: string; readonly close: string };
type RenderFrame =
	| { readonly kind: 'chunk'; readonly value: Chunk }
	| { readonly kind: 'style-end'; readonly value: StyleFrame };

const renderChunk = (input: Chunk): string => {
	const output: string[] = [];
	const stack: RenderFrame[] = [{ kind: 'chunk', value: input }];
	const active: StyleFrame[] = [];

	while (stack.length > 0) {
		const frame = stack.pop();
		if (frame === undefined) break;

		if (frame.kind === 'style-end') {
			const ended = active.pop();
			if (ended === undefined || ended.close.length === 0) continue;
			output.push(ended.close);
			// Re-open enclosing styles the close code just cancelled
			for (const style of active) {
				if (style.open.length === 0) continue;
				if (ended.close === RESET || style.close === ended.close) output.push(style.open);
			}
			continue;
		}

		switch (frame.value.kind) {
			case 'text':
				output.push(frame.value.value);
				break;
			case 'concat':
				stack.push({ kind: 'chunk', value: frame.value.right });
				stack.push({ kind: 'chunk', value: frame.value.left });
				break;
			case 'style':
				active.push({ open: frame.value.open, close: frame.value.close });
				stack.push({ kind: 'style-end', value: { open: frame.value.open, close: frame.value.close } });
				stack.push({ kind: 'chunk', value: frame.value.inner });
				if (frame.value.open.length > 0) output.push(frame.value.open);
				break;
		}
	}

	return output.join('');
};

/** Render a chunk tree (or plain value) to a string. */
export const render = (input: Chunkable): string => renderChunk(toChunk(input));

/** Create a rope color set with explicit enabled/disabled toggle. */
export function createRope(enabled: boolean = detectColorSupport()): Rope {
	const w: Wrap<ChunkFormatter> = (open, close) =>
		enabled ? (input) => styleNode(open, close, toChunk(input)) : toChunk;
	return {
		...mapPalette(w),
		isColorSupported: enabled,
		text,
		concat,
		render,

		fg256: (n) => w(fg256Open(n), FG_CLOSE),
		bg256: (n) => w(bg256Open(n), BG_CLOSE),
		rgb: (r, g, b) => w(rgbOpen(r, g, b), FG_CLOSE),
		bgRgb: (r, g, b) => w(bgRgbOpen(r, g, b), BG_CLOSE),
		hex: (color) => w(hexOpen(color), FG_CLOSE),
		bgHex: (color) => w(bgHexOpen(color), BG_CLOSE),
	};
}

/** Rope builder set — O(1) styled composition, O(n) render. */
const rope: Rope = createRope();

/** Set the background with a 256-color palette index. */
export const bg256: (n: number) => ChunkFormatter = rope.bg256;
/** Set the background black. */
export const bgBlack: ChunkFormatter = rope.bgBlack;
/** Set the background bright black. */
export const bgBlackBright: ChunkFormatter = rope.bgBlackBright;
/** Set the background blue. */
export const bgBlue: ChunkFormatter = rope.bgBlue;
/** Set the background bright blue. */
export const bgBlueBright: ChunkFormatter = rope.bgBlueBright;
/** Set the background cyan. */
export const bgCyan: ChunkFormatter = rope.bgCyan;
/** Set the background bright cyan. */
export const bgCyanBright: ChunkFormatter = rope.bgCyanBright;
/** Set the background green. */
export const bgGreen: ChunkFormatter = rope.bgGreen;
/** Set the background bright green. */
export const bgGreenBright: ChunkFormatter = rope.bgGreenBright;
/** Set the background from a `#rrggbb` hex string. */
export const bgHex: (color: string) => ChunkFormatter = rope.bgHex;
/** Set the background magenta. */
export const bgMagenta: ChunkFormatter = rope.bgMagenta;
/** Set the background bright magenta. */
export const bgMagentaBright: ChunkFormatter = rope.bgMagentaBright;
/** Set the background red. */
export const bgRed: ChunkFormatter = rope.bgRed;
/** Set the background bright red. */
export const bgRedBright: ChunkFormatter = rope.bgRedBright;
/** Set the background with a 24-bit RGB triple. */
export const bgRgb: (r: number, g: number, b: number) => ChunkFormatter = rope.bgRgb;
/** Set the background white. */
export const bgWhite: ChunkFormatter = rope.bgWhite;
/** Set the background bright white. */
export const bgWhiteBright: ChunkFormatter = rope.bgWhiteBright;
/** Set the background yellow. */
export const bgYellow: ChunkFormatter = rope.bgYellow;
/** Set the background bright yellow. */
export const bgYellowBright: ChunkFormatter = rope.bgYellowBright;
/** Color the foreground black. */
export const black: ChunkFormatter = rope.black;
/** Color the foreground bright black. */
export const blackBright: ChunkFormatter = rope.blackBright;
/** Apply blink. */
export const blink: ChunkFormatter = rope.blink;
/** Color the foreground blue. */
export const blue: ChunkFormatter = rope.blue;
/** Color the foreground bright blue. */
export const blueBright: ChunkFormatter = rope.blueBright;
/** Apply bold intensity. */
export const bold: ChunkFormatter = rope.bold;
/** Color the foreground cyan. */
export const cyan: ChunkFormatter = rope.cyan;
/** Color the foreground bright cyan. */
export const cyanBright: ChunkFormatter = rope.cyanBright;
/** Apply dim (faint) intensity. */
export const dim: ChunkFormatter = rope.dim;
/** Apply a double underline. */
export const doubleUnderline: ChunkFormatter = rope.doubleUnderline;
/** Color the foreground with a 256-color palette index. */
export const fg256: (n: number) => ChunkFormatter = rope.fg256;
/** Color the foreground gray. */
export const gray: ChunkFormatter = rope.gray;
/** Color the foreground green. */
export const green: ChunkFormatter = rope.green;
/** Color the foreground bright green. */
export const greenBright: ChunkFormatter = rope.greenBright;
/** Color the foreground from a `#rrggbb` hex string. */
export const hex: (color: string) => ChunkFormatter = rope.hex;
/** Conceal (hide) the text. */
export const hidden: ChunkFormatter = rope.hidden;
/** Swap foreground and background. */
export const inverse: ChunkFormatter = rope.inverse;
/** Whether ANSI output is enabled for this instance. */
export const isColorSupported: boolean = rope.isColorSupported;
/** Apply italic style. */
export const italic: ChunkFormatter = rope.italic;
/** Color the foreground magenta. */
export const magenta: ChunkFormatter = rope.magenta;
/** Color the foreground bright magenta. */
export const magentaBright: ChunkFormatter = rope.magentaBright;
/** Apply an overline. */
export const overline: ChunkFormatter = rope.overline;
/** Color the foreground red. */
export const red: ChunkFormatter = rope.red;
/** Color the foreground bright red. */
export const redBright: ChunkFormatter = rope.redBright;
/** Reset all styles and colors. */
export const reset: ChunkFormatter = rope.reset;
/** Color the foreground with a 24-bit RGB triple. */
export const rgb: (r: number, g: number, b: number) => ChunkFormatter = rope.rgb;
/** Apply strikethrough. */
export const strikethrough: ChunkFormatter = rope.strikethrough;
/** Apply a single underline. */
export const underline: ChunkFormatter = rope.underline;
/** Color the foreground white. */
export const white: ChunkFormatter = rope.white;
/** Color the foreground bright white. */
export const whiteBright: ChunkFormatter = rope.whiteBright;
/** Color the foreground yellow. */
export const yellow: ChunkFormatter = rope.yellow;
/** Color the foreground bright yellow. */
export const yellowBright: ChunkFormatter = rope.yellowBright;

export default rope;
export type {
	Chunk,
	ChunkFormatter,
	ChunkPalette,
	Chunkable,
	ConcatChunk,
	Formattable,
	FormatterName,
	Rope,
	StyleName,
	StyledChunk,
	TextChunk,
} from '#types';
export { CHUNK_BRAND };
