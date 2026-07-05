/**
 * @module ansispeck/rope
 * Chunk/rope entrypoint: O(1) styled composition, O(n) render.
 * The renderer re-opens enclosing styles structurally, so nested
 * styles sharing a close code never leak — no string scanning.
 */

import type { Wrap } from '#internal/ansi';
import { bg256Open, bgHexOpen, bgRgbOpen, c, fg256Open, hexOpen, mapPalette, rgbOpen } from '#internal/ansi';
import { BG_CLOSE, FG_CLOSE } from '#internal/ansi';
import { detectColorSupport } from '#internal/detect';
import type { Chunk, Chunkable, ChunkFormatter, ConcatChunk, Formattable, Rope, StyledChunk, TextChunk } from '#types';
import { CHUNK_BRAND } from '#types';

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

const rope: Rope = createRope();

/** Set the background with a 256-color palette index. */
export const bg256 = rope.bg256;
/** Set the background black. */
export const bgBlack = rope.bgBlack;
/** Set the background bright black. */
export const bgBlackBright = rope.bgBlackBright;
/** Set the background blue. */
export const bgBlue = rope.bgBlue;
/** Set the background bright blue. */
export const bgBlueBright = rope.bgBlueBright;
/** Set the background cyan. */
export const bgCyan = rope.bgCyan;
/** Set the background bright cyan. */
export const bgCyanBright = rope.bgCyanBright;
/** Set the background green. */
export const bgGreen = rope.bgGreen;
/** Set the background bright green. */
export const bgGreenBright = rope.bgGreenBright;
/** Set the background from a `#rrggbb` hex string. */
export const bgHex = rope.bgHex;
/** Set the background magenta. */
export const bgMagenta = rope.bgMagenta;
/** Set the background bright magenta. */
export const bgMagentaBright = rope.bgMagentaBright;
/** Set the background red. */
export const bgRed = rope.bgRed;
/** Set the background bright red. */
export const bgRedBright = rope.bgRedBright;
/** Set the background with a 24-bit RGB triple. */
export const bgRgb = rope.bgRgb;
/** Set the background white. */
export const bgWhite = rope.bgWhite;
/** Set the background bright white. */
export const bgWhiteBright = rope.bgWhiteBright;
/** Set the background yellow. */
export const bgYellow = rope.bgYellow;
/** Set the background bright yellow. */
export const bgYellowBright = rope.bgYellowBright;
/** Color the foreground black. */
export const black = rope.black;
/** Color the foreground bright black. */
export const blackBright = rope.blackBright;
/** Apply blink. */
export const blink = rope.blink;
/** Color the foreground blue. */
export const blue = rope.blue;
/** Color the foreground bright blue. */
export const blueBright = rope.blueBright;
/** Apply bold intensity. */
export const bold = rope.bold;
/** Color the foreground cyan. */
export const cyan = rope.cyan;
/** Color the foreground bright cyan. */
export const cyanBright = rope.cyanBright;
/** Apply dim (faint) intensity. */
export const dim = rope.dim;
/** Apply a double underline. */
export const doubleUnderline = rope.doubleUnderline;
/** Color the foreground with a 256-color palette index. */
export const fg256 = rope.fg256;
/** Color the foreground gray. */
export const gray = rope.gray;
/** Color the foreground green. */
export const green = rope.green;
/** Color the foreground bright green. */
export const greenBright = rope.greenBright;
/** Color the foreground from a `#rrggbb` hex string. */
export const hex = rope.hex;
/** Conceal (hide) the text. */
export const hidden = rope.hidden;
/** Swap foreground and background. */
export const inverse = rope.inverse;
/** Whether ANSI output is enabled for this instance. */
export const isColorSupported = rope.isColorSupported;
/** Apply italic style. */
export const italic = rope.italic;
/** Color the foreground magenta. */
export const magenta = rope.magenta;
/** Color the foreground bright magenta. */
export const magentaBright = rope.magentaBright;
/** Apply an overline. */
export const overline = rope.overline;
/** Color the foreground red. */
export const red = rope.red;
/** Color the foreground bright red. */
export const redBright = rope.redBright;
/** Reset all styles and colors. */
export const reset = rope.reset;
/** Color the foreground with a 24-bit RGB triple. */
export const rgb = rope.rgb;
/** Apply strikethrough. */
export const strikethrough = rope.strikethrough;
/** Apply a single underline. */
export const underline = rope.underline;
/** Color the foreground white. */
export const white = rope.white;
/** Color the foreground bright white. */
export const whiteBright = rope.whiteBright;
/** Color the foreground yellow. */
export const yellow = rope.yellow;
/** Color the foreground bright yellow. */
export const yellowBright = rope.yellowBright;

/** Rope builder set — O(1) styled composition, O(n) render. */
export default rope;

export type {
	Chunk,
	Chunkable,
	ChunkFormatter,
	ChunkPalette,
	Formattable,
	FormatterName,
	Rope,
	StyleName,
} from '#types';
