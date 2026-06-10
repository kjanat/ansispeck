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

export const {
	bg256,
	bgBlack,
	bgBlackBright,
	bgBlue,
	bgBlueBright,
	bgCyan,
	bgCyanBright,
	bgGreen,
	bgGreenBright,
	bgHex,
	bgMagenta,
	bgMagentaBright,
	bgRed,
	bgRedBright,
	bgRgb,
	bgWhite,
	bgWhiteBright,
	bgYellow,
	bgYellowBright,
	black,
	blackBright,
	blink,
	blue,
	blueBright,
	bold,
	cyan,
	cyanBright,
	dim,
	doubleUnderline,
	fg256,
	gray,
	green,
	greenBright,
	hex,
	hidden,
	inverse,
	isColorSupported,
	italic,
	magenta,
	magentaBright,
	overline,
	red,
	redBright,
	reset,
	rgb,
	strikethrough,
	underline,
	white,
	whiteBright,
	yellow,
	yellowBright,
} = rope;

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
