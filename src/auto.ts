import { detectColorSupport } from './internal/detect.ts';
import noop from './noop.ts';
import raw from './raw.ts';
import type { Formatter, Palette } from './types.ts';

export const isColorSupported: boolean = detectColorSupport();
const palette: Palette = isColorSupported ? raw : noop;

export const reset: Formatter = palette.reset;
export const bold: Formatter = palette.bold;
export const dim: Formatter = palette.dim;
export const italic: Formatter = palette.italic;
export const underline: Formatter = palette.underline;
export const inverse: Formatter = palette.inverse;
export const hidden: Formatter = palette.hidden;
export const strikethrough: Formatter = palette.strikethrough;

export const black: Formatter = palette.black;
export const red: Formatter = palette.red;
export const green: Formatter = palette.green;
export const yellow: Formatter = palette.yellow;
export const blue: Formatter = palette.blue;
export const magenta: Formatter = palette.magenta;
export const cyan: Formatter = palette.cyan;
export const white: Formatter = palette.white;
export const gray: Formatter = palette.gray;

export const bgBlack: Formatter = palette.bgBlack;
export const bgRed: Formatter = palette.bgRed;
export const bgGreen: Formatter = palette.bgGreen;
export const bgYellow: Formatter = palette.bgYellow;
export const bgBlue: Formatter = palette.bgBlue;
export const bgMagenta: Formatter = palette.bgMagenta;
export const bgCyan: Formatter = palette.bgCyan;
export const bgWhite: Formatter = palette.bgWhite;

export const blackBright: Formatter = palette.blackBright;
export const redBright: Formatter = palette.redBright;
export const greenBright: Formatter = palette.greenBright;
export const yellowBright: Formatter = palette.yellowBright;
export const blueBright: Formatter = palette.blueBright;
export const magentaBright: Formatter = palette.magentaBright;
export const cyanBright: Formatter = palette.cyanBright;
export const whiteBright: Formatter = palette.whiteBright;

export const bgBlackBright: Formatter = palette.bgBlackBright;
export const bgRedBright: Formatter = palette.bgRedBright;
export const bgGreenBright: Formatter = palette.bgGreenBright;
export const bgYellowBright: Formatter = palette.bgYellowBright;
export const bgBlueBright: Formatter = palette.bgBlueBright;
export const bgMagentaBright: Formatter = palette.bgMagentaBright;
export const bgCyanBright: Formatter = palette.bgCyanBright;
export const bgWhiteBright: Formatter = palette.bgWhiteBright;

export const auto: Palette = {
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

export default auto;

export type { Colors, Formattable, Formatter, FormatterName, Palette, StyleName } from './types.ts';
