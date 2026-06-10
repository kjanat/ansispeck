/**
 * @module ansispeck/raw
 * Always-colored entrypoint: emits ANSI codes regardless of environment.
 */

import { createColors } from '#internal/colors';
import type { Colors } from '#types';

const raw: Colors = createColors(true);

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
	link,
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
} = raw;

export default raw;

export type { Colors, Formattable, Formatter, FormatterName, LinkFormatter, Palette, StyleName } from '#types';
