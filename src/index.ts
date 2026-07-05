/**
 * @module ansispeck
 * Terminal ANSI color formatting with explicit entrypoints:
 * `ansispeck/auto` (this, auto-detected), `ansispeck/raw`,
 * `ansispeck/noop`, `ansispeck/safe`, `ansispeck/rope`.
 */

import { strip } from '#internal/ansi';
import { createColors } from '#internal/colors';
import { detectColorSupport } from '#internal/detect';
import type { Colors } from '#types';

const colors: Colors = createColors(detectColorSupport());

export { createColors, detectColorSupport, strip };

export const bg256 = colors.bg256;
export const bgBlack = colors.bgBlack;
export const bgBlackBright = colors.bgBlackBright;
export const bgBlue = colors.bgBlue;
export const bgBlueBright = colors.bgBlueBright;
export const bgCyan = colors.bgCyan;
export const bgCyanBright = colors.bgCyanBright;
export const bgGreen = colors.bgGreen;
export const bgGreenBright = colors.bgGreenBright;
export const bgHex = colors.bgHex;
export const bgMagenta = colors.bgMagenta;
export const bgMagentaBright = colors.bgMagentaBright;
export const bgRed = colors.bgRed;
export const bgRedBright = colors.bgRedBright;
export const bgRgb = colors.bgRgb;
export const bgWhite = colors.bgWhite;
export const bgWhiteBright = colors.bgWhiteBright;
export const bgYellow = colors.bgYellow;
export const bgYellowBright = colors.bgYellowBright;
export const black = colors.black;
export const blackBright = colors.blackBright;
export const blink = colors.blink;
export const blue = colors.blue;
export const blueBright = colors.blueBright;
export const bold = colors.bold;
export const cyan = colors.cyan;
export const cyanBright = colors.cyanBright;
export const dim = colors.dim;
export const doubleUnderline = colors.doubleUnderline;
export const fg256 = colors.fg256;
export const gray = colors.gray;
export const green = colors.green;
export const greenBright = colors.greenBright;
export const hex = colors.hex;
export const hidden = colors.hidden;
export const inverse = colors.inverse;
export const isColorSupported = colors.isColorSupported;
export const italic = colors.italic;
export const link = colors.link;
export const magenta = colors.magenta;
export const magentaBright = colors.magentaBright;
export const overline = colors.overline;
export const red = colors.red;
export const redBright = colors.redBright;
export const reset = colors.reset;
export const rgb = colors.rgb;
export const strikethrough = colors.strikethrough;
export const underline = colors.underline;
export const white = colors.white;
export const whiteBright = colors.whiteBright;
export const yellow = colors.yellow;
export const yellowBright = colors.yellowBright;

export default colors;

export type {
	Chunk,
	Chunkable,
	ChunkFormatter,
	ChunkPalette,
	Colors,
	Factories,
	Formattable,
	Formatter,
	FormatterName,
	LinkFormatter,
	Palette,
	Rope,
	SafeColors,
	StyleName,
	TemplateFormatter,
	TemplatePalette,
} from '#types';
