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
	makeFormatter,
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
import type { Formatter, Palette } from './types.ts';

export const reset: Formatter = makeFormatter(RESET_OPEN, RESET_OPEN);
export const bold: Formatter = makeFormatter(BOLD_OPEN, MODIFIER_CLOSE);
export const dim: Formatter = makeFormatter(DIM_OPEN, MODIFIER_CLOSE);
export const italic: Formatter = makeFormatter(ITALIC_OPEN, ITALIC_CLOSE);
export const underline: Formatter = makeFormatter(UNDERLINE_OPEN, UNDERLINE_CLOSE);
export const inverse: Formatter = makeFormatter(INVERSE_OPEN, INVERSE_CLOSE);
export const hidden: Formatter = makeFormatter(HIDDEN_OPEN, HIDDEN_CLOSE);
export const strikethrough: Formatter = makeFormatter(STRIKETHROUGH_OPEN, STRIKETHROUGH_CLOSE);

export const black: Formatter = makeFormatter(BLACK_OPEN, FG_CLOSE);
export const red: Formatter = makeFormatter(RED_OPEN, FG_CLOSE);
export const green: Formatter = makeFormatter(GREEN_OPEN, FG_CLOSE);
export const yellow: Formatter = makeFormatter(YELLOW_OPEN, FG_CLOSE);
export const blue: Formatter = makeFormatter(BLUE_OPEN, FG_CLOSE);
export const magenta: Formatter = makeFormatter(MAGENTA_OPEN, FG_CLOSE);
export const cyan: Formatter = makeFormatter(CYAN_OPEN, FG_CLOSE);
export const white: Formatter = makeFormatter(WHITE_OPEN, FG_CLOSE);
export const gray: Formatter = makeFormatter(GRAY_OPEN, FG_CLOSE);

export const bgBlack: Formatter = makeFormatter(BG_BLACK_OPEN, BG_CLOSE);
export const bgRed: Formatter = makeFormatter(BG_RED_OPEN, BG_CLOSE);
export const bgGreen: Formatter = makeFormatter(BG_GREEN_OPEN, BG_CLOSE);
export const bgYellow: Formatter = makeFormatter(BG_YELLOW_OPEN, BG_CLOSE);
export const bgBlue: Formatter = makeFormatter(BG_BLUE_OPEN, BG_CLOSE);
export const bgMagenta: Formatter = makeFormatter(BG_MAGENTA_OPEN, BG_CLOSE);
export const bgCyan: Formatter = makeFormatter(BG_CYAN_OPEN, BG_CLOSE);
export const bgWhite: Formatter = makeFormatter(BG_WHITE_OPEN, BG_CLOSE);

export const blackBright: Formatter = makeFormatter(GRAY_OPEN, FG_CLOSE);
export const redBright: Formatter = makeFormatter(RED_BRIGHT_OPEN, FG_CLOSE);
export const greenBright: Formatter = makeFormatter(GREEN_BRIGHT_OPEN, FG_CLOSE);
export const yellowBright: Formatter = makeFormatter(YELLOW_BRIGHT_OPEN, FG_CLOSE);
export const blueBright: Formatter = makeFormatter(BLUE_BRIGHT_OPEN, FG_CLOSE);
export const magentaBright: Formatter = makeFormatter(MAGENTA_BRIGHT_OPEN, FG_CLOSE);
export const cyanBright: Formatter = makeFormatter(CYAN_BRIGHT_OPEN, FG_CLOSE);
export const whiteBright: Formatter = makeFormatter(WHITE_BRIGHT_OPEN, FG_CLOSE);

export const bgBlackBright: Formatter = makeFormatter(BG_BLACK_BRIGHT_OPEN, BG_CLOSE);
export const bgRedBright: Formatter = makeFormatter(BG_RED_BRIGHT_OPEN, BG_CLOSE);
export const bgGreenBright: Formatter = makeFormatter(BG_GREEN_BRIGHT_OPEN, BG_CLOSE);
export const bgYellowBright: Formatter = makeFormatter(BG_YELLOW_BRIGHT_OPEN, BG_CLOSE);
export const bgBlueBright: Formatter = makeFormatter(BG_BLUE_BRIGHT_OPEN, BG_CLOSE);
export const bgMagentaBright: Formatter = makeFormatter(BG_MAGENTA_BRIGHT_OPEN, BG_CLOSE);
export const bgCyanBright: Formatter = makeFormatter(BG_CYAN_BRIGHT_OPEN, BG_CLOSE);
export const bgWhiteBright: Formatter = makeFormatter(BG_WHITE_BRIGHT_OPEN, BG_CLOSE);

export const raw: Palette = {
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

export default raw;

export type { Colors, Formattable, Formatter, FormatterName, Palette, StyleName } from './types.ts';
