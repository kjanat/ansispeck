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
import { detectColorSupport, detectHyperlinkSupport } from '#internal/detect';
import { makeTemplateFormatter } from '#internal/template';
import type { SafeColors, TemplateFormatter } from '#types';

/**
 * Create a template-tag color set with explicit enable toggles.
 *
 * Hyperlink emission defaults to the color toggle; pass `hyperlinksEnabled`
 * to decouple them.
 *
 * @see https://no-hyperlinks.org/
 */
export function createSafeColors(
	enabled: boolean = detectColorSupport(),
	hyperlinksEnabled: boolean = enabled,
): SafeColors {
	const t: Wrap<TemplateFormatter> = (open, close) => makeTemplateFormatter(enabled ? open : '', enabled ? close : '');
	return {
		...mapPalette(t),
		isColorSupported: enabled,
		isHyperlinkSupported: hyperlinksEnabled,

		link: mkLink(hyperlinksEnabled ? linkOpen : (_url, body) => body),

		fg256: (n) => t(fg256Open(n), FG_CLOSE),
		bg256: (n) => t(bg256Open(n), BG_CLOSE),
		rgb: (r, g, b) => t(rgbOpen(r, g, b), FG_CLOSE),
		bgRgb: (r, g, b) => t(bgRgbOpen(r, g, b), BG_CLOSE),
		hex: (color) => t(hexOpen(color), FG_CLOSE),
		bgHex: (color) => t(bgHexOpen(color), BG_CLOSE),
	};
}

const safe: SafeColors = createSafeColors(detectColorSupport(), detectHyperlinkSupport());

/** Set the background with a 256-color palette index. */
export const bg256 = safe.bg256;
/** Set the background black. */
export const bgBlack = safe.bgBlack;
/** Set the background bright black. */
export const bgBlackBright = safe.bgBlackBright;
/** Set the background blue. */
export const bgBlue = safe.bgBlue;
/** Set the background bright blue. */
export const bgBlueBright = safe.bgBlueBright;
/** Set the background cyan. */
export const bgCyan = safe.bgCyan;
/** Set the background bright cyan. */
export const bgCyanBright = safe.bgCyanBright;
/** Set the background green. */
export const bgGreen = safe.bgGreen;
/** Set the background bright green. */
export const bgGreenBright = safe.bgGreenBright;
/** Set the background from a `#rrggbb` hex string. */
export const bgHex = safe.bgHex;
/** Set the background magenta. */
export const bgMagenta = safe.bgMagenta;
/** Set the background bright magenta. */
export const bgMagentaBright = safe.bgMagentaBright;
/** Set the background red. */
export const bgRed = safe.bgRed;
/** Set the background bright red. */
export const bgRedBright = safe.bgRedBright;
/** Set the background with a 24-bit RGB triple. */
export const bgRgb = safe.bgRgb;
/** Set the background white. */
export const bgWhite = safe.bgWhite;
/** Set the background bright white. */
export const bgWhiteBright = safe.bgWhiteBright;
/** Set the background yellow. */
export const bgYellow = safe.bgYellow;
/** Set the background bright yellow. */
export const bgYellowBright = safe.bgYellowBright;
/** Color the foreground black. */
export const black = safe.black;
/** Color the foreground bright black. */
export const blackBright = safe.blackBright;
/** Apply blink. */
export const blink = safe.blink;
/** Color the foreground blue. */
export const blue = safe.blue;
/** Color the foreground bright blue. */
export const blueBright = safe.blueBright;
/** Apply bold intensity. */
export const bold = safe.bold;
/** Color the foreground cyan. */
export const cyan = safe.cyan;
/** Color the foreground bright cyan. */
export const cyanBright = safe.cyanBright;
/** Apply dim (faint) intensity. */
export const dim = safe.dim;
/** Apply a double underline. */
export const doubleUnderline = safe.doubleUnderline;
/** Color the foreground with a 256-color palette index. */
export const fg256 = safe.fg256;
/** Color the foreground gray. */
export const gray = safe.gray;
/** Color the foreground green. */
export const green = safe.green;
/** Color the foreground bright green. */
export const greenBright = safe.greenBright;
/** Color the foreground from a `#rrggbb` hex string. */
export const hex = safe.hex;
/** Conceal (hide) the text. */
export const hidden = safe.hidden;
/** Swap foreground and background. */
export const inverse = safe.inverse;
/** Whether ANSI output is enabled for this instance. */
export const isColorSupported = safe.isColorSupported;
/** Whether OSC 8 hyperlinks are emitted for this instance. */
export const isHyperlinkSupported = safe.isHyperlinkSupported;
/** Apply italic style. */
export const italic = safe.italic;
/** Wrap text in an OSC 8 terminal hyperlink. */
export const link = safe.link;
/** Color the foreground magenta. */
export const magenta = safe.magenta;
/** Color the foreground bright magenta. */
export const magentaBright = safe.magentaBright;
/** Apply an overline. */
export const overline = safe.overline;
/** Color the foreground red. */
export const red = safe.red;
/** Color the foreground bright red. */
export const redBright = safe.redBright;
/** Reset all styles and colors. */
export const reset = safe.reset;
/** Color the foreground with a 24-bit RGB triple. */
export const rgb = safe.rgb;
/** Apply strikethrough. */
export const strikethrough = safe.strikethrough;
/** Apply a single underline. */
export const underline = safe.underline;
/** Color the foreground white. */
export const white = safe.white;
/** Color the foreground bright white. */
export const whiteBright = safe.whiteBright;
/** Color the foreground yellow. */
export const yellow = safe.yellow;
/** Color the foreground bright yellow. */
export const yellowBright = safe.yellowBright;

/** Template-tag color set — re-opens styles across interpolations. */
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
