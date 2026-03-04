import type { Formatter, Palette } from './types.ts';

const passthrough: Formatter = (input) => '' + input;

export const reset: Formatter = passthrough;
export const bold: Formatter = passthrough;
export const dim: Formatter = passthrough;
export const italic: Formatter = passthrough;
export const underline: Formatter = passthrough;
export const inverse: Formatter = passthrough;
export const hidden: Formatter = passthrough;
export const strikethrough: Formatter = passthrough;

export const black: Formatter = passthrough;
export const red: Formatter = passthrough;
export const green: Formatter = passthrough;
export const yellow: Formatter = passthrough;
export const blue: Formatter = passthrough;
export const magenta: Formatter = passthrough;
export const cyan: Formatter = passthrough;
export const white: Formatter = passthrough;
export const gray: Formatter = passthrough;

export const bgBlack: Formatter = passthrough;
export const bgRed: Formatter = passthrough;
export const bgGreen: Formatter = passthrough;
export const bgYellow: Formatter = passthrough;
export const bgBlue: Formatter = passthrough;
export const bgMagenta: Formatter = passthrough;
export const bgCyan: Formatter = passthrough;
export const bgWhite: Formatter = passthrough;

export const blackBright: Formatter = passthrough;
export const redBright: Formatter = passthrough;
export const greenBright: Formatter = passthrough;
export const yellowBright: Formatter = passthrough;
export const blueBright: Formatter = passthrough;
export const magentaBright: Formatter = passthrough;
export const cyanBright: Formatter = passthrough;
export const whiteBright: Formatter = passthrough;

export const bgBlackBright: Formatter = passthrough;
export const bgRedBright: Formatter = passthrough;
export const bgGreenBright: Formatter = passthrough;
export const bgYellowBright: Formatter = passthrough;
export const bgBlueBright: Formatter = passthrough;
export const bgMagentaBright: Formatter = passthrough;
export const bgCyanBright: Formatter = passthrough;
export const bgWhiteBright: Formatter = passthrough;

export const noop: Palette = {
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

export default noop;

export type { Colors, Formattable, Formatter, FormatterName, Palette, StyleName } from './types.ts';
