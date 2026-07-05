/**
 * @module ansispeck/safe
 * Template-tag entrypoint: styles re-open after every interpolation,
 * so interpolated values can never leak or break the enclosing style.
 */
import type { Wrap } from '#internal/ansi';
import {
	bg256Open,
	bgHexOpen,
	bgRgbOpen,
	fg256Open,
	hexOpen,
	linkOpen,
	mapPalette,
	mkLink,
	rgbOpen,
} from '#internal/ansi';
import { BG_CLOSE, FG_CLOSE } from '#internal/ansi';
import { detectColorSupport } from '#internal/detect';
import { makeTemplateFormatter } from '#internal/template';
import type { SafeColors, TemplateFormatter } from '#types';

/** Create a template-tag color set with explicit enabled/disabled toggle. */
export function createSafeColors(enabled: boolean = detectColorSupport()): SafeColors {
	const t: Wrap<TemplateFormatter> = (open, close) => makeTemplateFormatter(enabled ? open : '', enabled ? close : '');
	return {
		...mapPalette(t),
		isColorSupported: enabled,

		link: mkLink(enabled ? linkOpen : (_url, body) => body),

		fg256: (n) => t(fg256Open(n), FG_CLOSE),
		bg256: (n) => t(bg256Open(n), BG_CLOSE),
		rgb: (r, g, b) => t(rgbOpen(r, g, b), FG_CLOSE),
		bgRgb: (r, g, b) => t(bgRgbOpen(r, g, b), BG_CLOSE),
		hex: (color) => t(hexOpen(color), FG_CLOSE),
		bgHex: (color) => t(bgHexOpen(color), BG_CLOSE),
	};
}

const safe: SafeColors = createSafeColors();

export const bg256 = safe.bg256;
export const bgBlack = safe.bgBlack;
export const bgBlackBright = safe.bgBlackBright;
export const bgBlue = safe.bgBlue;
export const bgBlueBright = safe.bgBlueBright;
export const bgCyan = safe.bgCyan;
export const bgCyanBright = safe.bgCyanBright;
export const bgGreen = safe.bgGreen;
export const bgGreenBright = safe.bgGreenBright;
export const bgHex = safe.bgHex;
export const bgMagenta = safe.bgMagenta;
export const bgMagentaBright = safe.bgMagentaBright;
export const bgRed = safe.bgRed;
export const bgRedBright = safe.bgRedBright;
export const bgRgb = safe.bgRgb;
export const bgWhite = safe.bgWhite;
export const bgWhiteBright = safe.bgWhiteBright;
export const bgYellow = safe.bgYellow;
export const bgYellowBright = safe.bgYellowBright;
export const black = safe.black;
export const blackBright = safe.blackBright;
export const blink = safe.blink;
export const blue = safe.blue;
export const blueBright = safe.blueBright;
export const bold = safe.bold;
export const cyan = safe.cyan;
export const cyanBright = safe.cyanBright;
export const dim = safe.dim;
export const doubleUnderline = safe.doubleUnderline;
export const fg256 = safe.fg256;
export const gray = safe.gray;
export const green = safe.green;
export const greenBright = safe.greenBright;
export const hex = safe.hex;
export const hidden = safe.hidden;
export const inverse = safe.inverse;
export const isColorSupported = safe.isColorSupported;
export const italic = safe.italic;
export const link = safe.link;
export const magenta = safe.magenta;
export const magentaBright = safe.magentaBright;
export const overline = safe.overline;
export const red = safe.red;
export const redBright = safe.redBright;
export const reset = safe.reset;
export const rgb = safe.rgb;
export const strikethrough = safe.strikethrough;
export const underline = safe.underline;
export const white = safe.white;
export const whiteBright = safe.whiteBright;
export const yellow = safe.yellow;
export const yellowBright = safe.yellowBright;

export default safe;

export type {
	Formattable,
	FormatterName,
	LinkFormatter,
	SafeColors,
	StyleName,
	TemplateFormatter,
	TemplatePalette,
} from '#types';
