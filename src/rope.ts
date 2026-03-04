import {
	BG_BLACK_BRIGHT_OPEN,
	BG_BLACK_OPEN,
	BG_BLUE_BRIGHT_OPEN,
	BG_BLUE_OPEN,
	BG_CLOSE,
	BG_CYAN_BRIGHT_OPEN,
	BG_CYAN_OPEN,
	BG_GREEN_BRIGHT_OPEN,
	BG_GREEN_OPEN,
	BG_MAGENTA_BRIGHT_OPEN,
	BG_MAGENTA_OPEN,
	BG_RED_BRIGHT_OPEN,
	BG_RED_OPEN,
	BG_WHITE_BRIGHT_OPEN,
	BG_WHITE_OPEN,
	BG_YELLOW_BRIGHT_OPEN,
	BG_YELLOW_OPEN,
	BLACK_OPEN,
	BLUE_BRIGHT_OPEN,
	BLUE_OPEN,
	BOLD_OPEN,
	CYAN_BRIGHT_OPEN,
	CYAN_OPEN,
	DIM_OPEN,
	FG_CLOSE,
	GRAY_OPEN,
	GREEN_BRIGHT_OPEN,
	GREEN_OPEN,
	HIDDEN_CLOSE,
	HIDDEN_OPEN,
	INVERSE_CLOSE,
	INVERSE_OPEN,
	ITALIC_CLOSE,
	ITALIC_OPEN,
	MAGENTA_BRIGHT_OPEN,
	MAGENTA_OPEN,
	MODIFIER_CLOSE,
	RED_BRIGHT_OPEN,
	RED_OPEN,
	RESET_OPEN,
	STRIKETHROUGH_CLOSE,
	STRIKETHROUGH_OPEN,
	UNDERLINE_CLOSE,
	UNDERLINE_OPEN,
	WHITE_BRIGHT_OPEN,
	WHITE_OPEN,
	YELLOW_BRIGHT_OPEN,
	YELLOW_OPEN,
} from './internal/ansi.ts';
import { detectColorSupport } from './internal/detect.ts';
import { CHUNK_BRAND } from './types.ts';
import type {
	Chunk,
	Chunkable,
	ChunkFormatter,
	ConcatChunk,
	Formattable,
	Rope,
	StyledChunk,
	TextChunk,
} from './types.ts';

export const isColorSupported: boolean = detectColorSupport();

const textNode = (input: Formattable): TextChunk => {
	return {
		[CHUNK_BRAND]: true,
		kind: 'text',
		value: '' + input,
	};
};

const concatNode = (left: Chunk, right: Chunk): ConcatChunk => {
	return {
		[CHUNK_BRAND]: true,
		kind: 'concat',
		left,
		right,
	};
};

const styleNode = (open: string, close: string, inner: Chunk): StyledChunk => {
	return {
		[CHUNK_BRAND]: true,
		kind: 'style',
		open,
		close,
		inner,
	};
};

const isChunk = (value: Chunkable): value is Chunk => {
	return typeof value === 'object' && value !== null && CHUNK_BRAND in value;
};

const toChunk = (input: Chunkable): Chunk => {
	return isChunk(input) ? input : textNode(input);
};

export const text = (input: Formattable): Chunk => {
	return textNode(input);
};

export const concat = (...inputs: readonly Chunkable[]): Chunk => {
	let output: Chunk | undefined;
	let index = 0;
	while (index < inputs.length) {
		const current = inputs[index];
		if (current !== undefined) {
			const node = toChunk(current);
			output = output === undefined ? node : concatNode(output, node);
		}
		index++;
	}
	return output ?? textNode('');
};

type RenderFrame =
	| { readonly kind: 'chunk'; readonly value: Chunk }
	| { readonly kind: 'style-end'; readonly value: { readonly open: string; readonly close: string } };

const renderChunk = (input: Chunk): string => {
	const output: string[] = [];
	const stack: RenderFrame[] = [{ kind: 'chunk', value: input }];
	const active: Array<{ readonly open: string; readonly close: string }> = [];

	while (stack.length > 0) {
		const frame = stack.pop();
		if (frame === undefined) break;

		if (frame.kind === 'style-end') {
			const ended = active.pop();
			if (ended === undefined) continue;

			if (ended.close.length > 0) {
				output.push(ended.close);
			}

			if (ended.close.length > 0) {
				if (ended.close === RESET_OPEN) {
					for (const style of active) {
						if (style.open.length > 0) output.push(style.open);
					}
				} else {
					for (const style of active) {
						if (style.close === ended.close && style.open.length > 0) output.push(style.open);
					}
				}
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
				if (frame.value.open.length > 0) {
					output.push(frame.value.open);
				}
				break;
		}
	}

	return output.join('');
};

export const render = (input: Chunkable): string => {
	return renderChunk(toChunk(input));
};

const openIfEnabled = (open: string, enabled: boolean): string => {
	return enabled ? open : '';
};

const closeIfEnabled = (close: string, enabled: boolean): string => {
	return enabled ? close : '';
};

const makeChunkFormatter = (open: string, close: string): ChunkFormatter => {
	return (input) => {
		const chunk = toChunk(input);
		if (open.length === 0 && close.length === 0) return chunk;
		return styleNode(open, close, chunk);
	};
};

const createFormatter = (open: string, close: string, enabled: boolean): ChunkFormatter => {
	return makeChunkFormatter(openIfEnabled(open, enabled), closeIfEnabled(close, enabled));
};

export const createRope = (enabled: boolean = isColorSupported): Rope => {
	const reset = createFormatter(RESET_OPEN, RESET_OPEN, enabled);
	const bold = createFormatter(BOLD_OPEN, MODIFIER_CLOSE, enabled);
	const dim = createFormatter(DIM_OPEN, MODIFIER_CLOSE, enabled);
	const italic = createFormatter(ITALIC_OPEN, ITALIC_CLOSE, enabled);
	const underline = createFormatter(UNDERLINE_OPEN, UNDERLINE_CLOSE, enabled);
	const inverse = createFormatter(INVERSE_OPEN, INVERSE_CLOSE, enabled);
	const hidden = createFormatter(HIDDEN_OPEN, HIDDEN_CLOSE, enabled);
	const strikethrough = createFormatter(STRIKETHROUGH_OPEN, STRIKETHROUGH_CLOSE, enabled);

	const black = createFormatter(BLACK_OPEN, FG_CLOSE, enabled);
	const red = createFormatter(RED_OPEN, FG_CLOSE, enabled);
	const green = createFormatter(GREEN_OPEN, FG_CLOSE, enabled);
	const yellow = createFormatter(YELLOW_OPEN, FG_CLOSE, enabled);
	const blue = createFormatter(BLUE_OPEN, FG_CLOSE, enabled);
	const magenta = createFormatter(MAGENTA_OPEN, FG_CLOSE, enabled);
	const cyan = createFormatter(CYAN_OPEN, FG_CLOSE, enabled);
	const white = createFormatter(WHITE_OPEN, FG_CLOSE, enabled);
	const gray = createFormatter(GRAY_OPEN, FG_CLOSE, enabled);

	const bgBlack = createFormatter(BG_BLACK_OPEN, BG_CLOSE, enabled);
	const bgRed = createFormatter(BG_RED_OPEN, BG_CLOSE, enabled);
	const bgGreen = createFormatter(BG_GREEN_OPEN, BG_CLOSE, enabled);
	const bgYellow = createFormatter(BG_YELLOW_OPEN, BG_CLOSE, enabled);
	const bgBlue = createFormatter(BG_BLUE_OPEN, BG_CLOSE, enabled);
	const bgMagenta = createFormatter(BG_MAGENTA_OPEN, BG_CLOSE, enabled);
	const bgCyan = createFormatter(BG_CYAN_OPEN, BG_CLOSE, enabled);
	const bgWhite = createFormatter(BG_WHITE_OPEN, BG_CLOSE, enabled);

	const blackBright = createFormatter(GRAY_OPEN, FG_CLOSE, enabled);
	const redBright = createFormatter(RED_BRIGHT_OPEN, FG_CLOSE, enabled);
	const greenBright = createFormatter(GREEN_BRIGHT_OPEN, FG_CLOSE, enabled);
	const yellowBright = createFormatter(YELLOW_BRIGHT_OPEN, FG_CLOSE, enabled);
	const blueBright = createFormatter(BLUE_BRIGHT_OPEN, FG_CLOSE, enabled);
	const magentaBright = createFormatter(MAGENTA_BRIGHT_OPEN, FG_CLOSE, enabled);
	const cyanBright = createFormatter(CYAN_BRIGHT_OPEN, FG_CLOSE, enabled);
	const whiteBright = createFormatter(WHITE_BRIGHT_OPEN, FG_CLOSE, enabled);

	const bgBlackBright = createFormatter(BG_BLACK_BRIGHT_OPEN, BG_CLOSE, enabled);
	const bgRedBright = createFormatter(BG_RED_BRIGHT_OPEN, BG_CLOSE, enabled);
	const bgGreenBright = createFormatter(BG_GREEN_BRIGHT_OPEN, BG_CLOSE, enabled);
	const bgYellowBright = createFormatter(BG_YELLOW_BRIGHT_OPEN, BG_CLOSE, enabled);
	const bgBlueBright = createFormatter(BG_BLUE_BRIGHT_OPEN, BG_CLOSE, enabled);
	const bgMagentaBright = createFormatter(BG_MAGENTA_BRIGHT_OPEN, BG_CLOSE, enabled);
	const bgCyanBright = createFormatter(BG_CYAN_BRIGHT_OPEN, BG_CLOSE, enabled);
	const bgWhiteBright = createFormatter(BG_WHITE_BRIGHT_OPEN, BG_CLOSE, enabled);

	return {
		isColorSupported: enabled,
		text,
		concat,
		render,
		reset,
		bold,
		dim,
		italic,
		underline,
		inverse,
		hidden,
		strikethrough,
		black,
		red,
		green,
		yellow,
		blue,
		magenta,
		cyan,
		white,
		gray,
		bgBlack,
		bgRed,
		bgGreen,
		bgYellow,
		bgBlue,
		bgMagenta,
		bgCyan,
		bgWhite,
		blackBright,
		redBright,
		greenBright,
		yellowBright,
		blueBright,
		magentaBright,
		cyanBright,
		whiteBright,
		bgBlackBright,
		bgRedBright,
		bgGreenBright,
		bgYellowBright,
		bgBlueBright,
		bgMagentaBright,
		bgCyanBright,
		bgWhiteBright,
	};
};

const rope: Rope = createRope();

export const reset: ChunkFormatter = rope.reset;
export const bold: ChunkFormatter = rope.bold;
export const dim: ChunkFormatter = rope.dim;
export const italic: ChunkFormatter = rope.italic;
export const underline: ChunkFormatter = rope.underline;
export const inverse: ChunkFormatter = rope.inverse;
export const hidden: ChunkFormatter = rope.hidden;
export const strikethrough: ChunkFormatter = rope.strikethrough;

export const black: ChunkFormatter = rope.black;
export const red: ChunkFormatter = rope.red;
export const green: ChunkFormatter = rope.green;
export const yellow: ChunkFormatter = rope.yellow;
export const blue: ChunkFormatter = rope.blue;
export const magenta: ChunkFormatter = rope.magenta;
export const cyan: ChunkFormatter = rope.cyan;
export const white: ChunkFormatter = rope.white;
export const gray: ChunkFormatter = rope.gray;

export const bgBlack: ChunkFormatter = rope.bgBlack;
export const bgRed: ChunkFormatter = rope.bgRed;
export const bgGreen: ChunkFormatter = rope.bgGreen;
export const bgYellow: ChunkFormatter = rope.bgYellow;
export const bgBlue: ChunkFormatter = rope.bgBlue;
export const bgMagenta: ChunkFormatter = rope.bgMagenta;
export const bgCyan: ChunkFormatter = rope.bgCyan;
export const bgWhite: ChunkFormatter = rope.bgWhite;

export const blackBright: ChunkFormatter = rope.blackBright;
export const redBright: ChunkFormatter = rope.redBright;
export const greenBright: ChunkFormatter = rope.greenBright;
export const yellowBright: ChunkFormatter = rope.yellowBright;
export const blueBright: ChunkFormatter = rope.blueBright;
export const magentaBright: ChunkFormatter = rope.magentaBright;
export const cyanBright: ChunkFormatter = rope.cyanBright;
export const whiteBright: ChunkFormatter = rope.whiteBright;

export const bgBlackBright: ChunkFormatter = rope.bgBlackBright;
export const bgRedBright: ChunkFormatter = rope.bgRedBright;
export const bgGreenBright: ChunkFormatter = rope.bgGreenBright;
export const bgYellowBright: ChunkFormatter = rope.bgYellowBright;
export const bgBlueBright: ChunkFormatter = rope.bgBlueBright;
export const bgMagentaBright: ChunkFormatter = rope.bgMagentaBright;
export const bgCyanBright: ChunkFormatter = rope.bgCyanBright;
export const bgWhiteBright: ChunkFormatter = rope.bgWhiteBright;

export default rope;

export type {
	Chunk,
	Chunkable,
	ChunkFormatter,
	ChunkPalette,
	Colors,
	Formattable,
	FormatterName,
	Rope,
	StyleName,
} from './types.ts';
