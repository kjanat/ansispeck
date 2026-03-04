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
	makeTemplateFormatter,
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
import type { TemplateFormatter, TemplatePalette } from './types.ts';

export const isColorSupported: boolean = detectColorSupport();

const openIfEnabled = (open: string): string => {
	return isColorSupported ? open : '';
};

const closeIfEnabled = (close: string): string => {
	return isColorSupported ? close : '';
};

export const reset: TemplateFormatter = makeTemplateFormatter(openIfEnabled(RESET_OPEN), closeIfEnabled(RESET_OPEN));
export const bold: TemplateFormatter = makeTemplateFormatter(openIfEnabled(BOLD_OPEN), closeIfEnabled(MODIFIER_CLOSE));
export const dim: TemplateFormatter = makeTemplateFormatter(openIfEnabled(DIM_OPEN), closeIfEnabled(MODIFIER_CLOSE));
export const italic: TemplateFormatter = makeTemplateFormatter(
	openIfEnabled(ITALIC_OPEN),
	closeIfEnabled(ITALIC_CLOSE),
);
export const underline: TemplateFormatter = makeTemplateFormatter(
	openIfEnabled(UNDERLINE_OPEN),
	closeIfEnabled(UNDERLINE_CLOSE),
);
export const inverse: TemplateFormatter = makeTemplateFormatter(
	openIfEnabled(INVERSE_OPEN),
	closeIfEnabled(INVERSE_CLOSE),
);
export const hidden: TemplateFormatter = makeTemplateFormatter(
	openIfEnabled(HIDDEN_OPEN),
	closeIfEnabled(HIDDEN_CLOSE),
);
export const strikethrough: TemplateFormatter = makeTemplateFormatter(
	openIfEnabled(STRIKETHROUGH_OPEN),
	closeIfEnabled(STRIKETHROUGH_CLOSE),
);

export const black: TemplateFormatter = makeTemplateFormatter(openIfEnabled(BLACK_OPEN), closeIfEnabled(FG_CLOSE));
export const red: TemplateFormatter = makeTemplateFormatter(openIfEnabled(RED_OPEN), closeIfEnabled(FG_CLOSE));
export const green: TemplateFormatter = makeTemplateFormatter(openIfEnabled(GREEN_OPEN), closeIfEnabled(FG_CLOSE));
export const yellow: TemplateFormatter = makeTemplateFormatter(openIfEnabled(YELLOW_OPEN), closeIfEnabled(FG_CLOSE));
export const blue: TemplateFormatter = makeTemplateFormatter(openIfEnabled(BLUE_OPEN), closeIfEnabled(FG_CLOSE));
export const magenta: TemplateFormatter = makeTemplateFormatter(openIfEnabled(MAGENTA_OPEN), closeIfEnabled(FG_CLOSE));
export const cyan: TemplateFormatter = makeTemplateFormatter(openIfEnabled(CYAN_OPEN), closeIfEnabled(FG_CLOSE));
export const white: TemplateFormatter = makeTemplateFormatter(openIfEnabled(WHITE_OPEN), closeIfEnabled(FG_CLOSE));
export const gray: TemplateFormatter = makeTemplateFormatter(openIfEnabled(GRAY_OPEN), closeIfEnabled(FG_CLOSE));

export const bgBlack: TemplateFormatter = makeTemplateFormatter(openIfEnabled(BG_BLACK_OPEN), closeIfEnabled(BG_CLOSE));
export const bgRed: TemplateFormatter = makeTemplateFormatter(openIfEnabled(BG_RED_OPEN), closeIfEnabled(BG_CLOSE));
export const bgGreen: TemplateFormatter = makeTemplateFormatter(openIfEnabled(BG_GREEN_OPEN), closeIfEnabled(BG_CLOSE));
export const bgYellow: TemplateFormatter = makeTemplateFormatter(
	openIfEnabled(BG_YELLOW_OPEN),
	closeIfEnabled(BG_CLOSE),
);
export const bgBlue: TemplateFormatter = makeTemplateFormatter(openIfEnabled(BG_BLUE_OPEN), closeIfEnabled(BG_CLOSE));
export const bgMagenta: TemplateFormatter = makeTemplateFormatter(
	openIfEnabled(BG_MAGENTA_OPEN),
	closeIfEnabled(BG_CLOSE),
);
export const bgCyan: TemplateFormatter = makeTemplateFormatter(openIfEnabled(BG_CYAN_OPEN), closeIfEnabled(BG_CLOSE));
export const bgWhite: TemplateFormatter = makeTemplateFormatter(openIfEnabled(BG_WHITE_OPEN), closeIfEnabled(BG_CLOSE));

export const blackBright: TemplateFormatter = makeTemplateFormatter(openIfEnabled(GRAY_OPEN), closeIfEnabled(FG_CLOSE));
export const redBright: TemplateFormatter = makeTemplateFormatter(
	openIfEnabled(RED_BRIGHT_OPEN),
	closeIfEnabled(FG_CLOSE),
);
export const greenBright: TemplateFormatter = makeTemplateFormatter(
	openIfEnabled(GREEN_BRIGHT_OPEN),
	closeIfEnabled(FG_CLOSE),
);
export const yellowBright: TemplateFormatter = makeTemplateFormatter(
	openIfEnabled(YELLOW_BRIGHT_OPEN),
	closeIfEnabled(FG_CLOSE),
);
export const blueBright: TemplateFormatter = makeTemplateFormatter(
	openIfEnabled(BLUE_BRIGHT_OPEN),
	closeIfEnabled(FG_CLOSE),
);
export const magentaBright: TemplateFormatter = makeTemplateFormatter(
	openIfEnabled(MAGENTA_BRIGHT_OPEN),
	closeIfEnabled(FG_CLOSE),
);
export const cyanBright: TemplateFormatter = makeTemplateFormatter(
	openIfEnabled(CYAN_BRIGHT_OPEN),
	closeIfEnabled(FG_CLOSE),
);
export const whiteBright: TemplateFormatter = makeTemplateFormatter(
	openIfEnabled(WHITE_BRIGHT_OPEN),
	closeIfEnabled(FG_CLOSE),
);

export const bgBlackBright: TemplateFormatter = makeTemplateFormatter(
	openIfEnabled(BG_BLACK_BRIGHT_OPEN),
	closeIfEnabled(BG_CLOSE),
);
export const bgRedBright: TemplateFormatter = makeTemplateFormatter(
	openIfEnabled(BG_RED_BRIGHT_OPEN),
	closeIfEnabled(BG_CLOSE),
);
export const bgGreenBright: TemplateFormatter = makeTemplateFormatter(
	openIfEnabled(BG_GREEN_BRIGHT_OPEN),
	closeIfEnabled(BG_CLOSE),
);
export const bgYellowBright: TemplateFormatter = makeTemplateFormatter(
	openIfEnabled(BG_YELLOW_BRIGHT_OPEN),
	closeIfEnabled(BG_CLOSE),
);
export const bgBlueBright: TemplateFormatter = makeTemplateFormatter(
	openIfEnabled(BG_BLUE_BRIGHT_OPEN),
	closeIfEnabled(BG_CLOSE),
);
export const bgMagentaBright: TemplateFormatter = makeTemplateFormatter(
	openIfEnabled(BG_MAGENTA_BRIGHT_OPEN),
	closeIfEnabled(BG_CLOSE),
);
export const bgCyanBright: TemplateFormatter = makeTemplateFormatter(
	openIfEnabled(BG_CYAN_BRIGHT_OPEN),
	closeIfEnabled(BG_CLOSE),
);
export const bgWhiteBright: TemplateFormatter = makeTemplateFormatter(
	openIfEnabled(BG_WHITE_BRIGHT_OPEN),
	closeIfEnabled(BG_CLOSE),
);

export const safe: TemplatePalette = {
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

export default safe;

export type { Formattable, FormatterName, StyleName, TemplateFormatter, TemplatePalette } from './types.ts';
