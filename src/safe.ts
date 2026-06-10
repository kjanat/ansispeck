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
} = safe;

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
