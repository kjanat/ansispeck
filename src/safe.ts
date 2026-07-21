/**
 * Template-tag entrypoint: styles re-open after every interpolation,
 * so interpolated values can never leak or break the enclosing style.
 *
 * @module ansispeck/safe
 */

import type { Wrap } from './internal/ansi.ts';
import {
	BG_CLOSE,
	FG_CLOSE,
	bg256Open,
	bgHexOpen,
	bgRgbOpen,
	fg256Open,
	hexOpen,
	linkOpen,
	mapPalette,
	mkLink,
	rgbOpen,
} from './internal/ansi.ts';
import { detectColorSupport, detectHyperlinkSupport } from './internal/detect.ts';
import { makeTemplateFormatter } from './internal/template.ts';
import { space, tab } from './internal/whitespace.ts';
import type { LinkFormatter, SafeColors, TemplateFormatter } from './types.ts';

export { space, tab } from './internal/whitespace.ts';

/**
 * Create a template-tag color set with explicit enable toggles.
 *
 * Hyperlink emission defaults to the color toggle; pass {@linkcode createSafeColors['hyperlinksEnabled'] | hyperlinksEnabled} to decouple them.
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
		space,
		tab,

		fg256: (n) => t(fg256Open(n), FG_CLOSE),
		bg256: (n) => t(bg256Open(n), BG_CLOSE),
		rgb: (r, g, b) => t(rgbOpen(r, g, b), FG_CLOSE),
		bgRgb: (r, g, b) => t(bgRgbOpen(r, g, b), BG_CLOSE),
		hex: (color) => t(hexOpen(color), FG_CLOSE),
		bgHex: (color) => t(bgHexOpen(color), BG_CLOSE),
	};
}

/** Template-tag color set — re-opens styles across interpolations. */
const safe: SafeColors = createSafeColors(detectColorSupport(), detectHyperlinkSupport());

/** Set the background with a 256-color palette index. */
export const bg256: (n: number) => TemplateFormatter = safe.bg256;
/** Set the background black. */
export const bgBlack: TemplateFormatter = safe.bgBlack;
/** Set the background bright black. */
export const bgBlackBright: TemplateFormatter = safe.bgBlackBright;
/** Set the background blue. */
export const bgBlue: TemplateFormatter = safe.bgBlue;
/** Set the background bright blue. */
export const bgBlueBright: TemplateFormatter = safe.bgBlueBright;
/** Set the background cyan. */
export const bgCyan: TemplateFormatter = safe.bgCyan;
/** Set the background bright cyan. */
export const bgCyanBright: TemplateFormatter = safe.bgCyanBright;
/** Set the background green. */
export const bgGreen: TemplateFormatter = safe.bgGreen;
/** Set the background bright green. */
export const bgGreenBright: TemplateFormatter = safe.bgGreenBright;
/** Set the background from a `#rrggbb` hex string. */
export const bgHex: (color: string) => TemplateFormatter = safe.bgHex;
/** Set the background magenta. */
export const bgMagenta: TemplateFormatter = safe.bgMagenta;
/** Set the background bright magenta. */
export const bgMagentaBright: TemplateFormatter = safe.bgMagentaBright;
/** Set the background red. */
export const bgRed: TemplateFormatter = safe.bgRed;
/** Set the background bright red. */
export const bgRedBright: TemplateFormatter = safe.bgRedBright;
/** Set the background with a 24-bit RGB triple. */
export const bgRgb: (r: number, g: number, b: number) => TemplateFormatter = safe.bgRgb;
/** Set the background white. */
export const bgWhite: TemplateFormatter = safe.bgWhite;
/** Set the background bright white. */
export const bgWhiteBright: TemplateFormatter = safe.bgWhiteBright;
/** Set the background yellow. */
export const bgYellow: TemplateFormatter = safe.bgYellow;
/** Set the background bright yellow. */
export const bgYellowBright: TemplateFormatter = safe.bgYellowBright;
/** Color the foreground black. */
export const black: TemplateFormatter = safe.black;
/** Color the foreground bright black. */
export const blackBright: TemplateFormatter = safe.blackBright;
/** Apply blink. */
export const blink: TemplateFormatter = safe.blink;
/** Color the foreground blue. */
export const blue: TemplateFormatter = safe.blue;
/** Color the foreground bright blue. */
export const blueBright: TemplateFormatter = safe.blueBright;
/** Apply bold intensity. */
export const bold: TemplateFormatter = safe.bold;
/** Color the foreground cyan. */
export const cyan: TemplateFormatter = safe.cyan;
/** Color the foreground bright cyan. */
export const cyanBright: TemplateFormatter = safe.cyanBright;
/** Apply dim (faint) intensity. */
export const dim: TemplateFormatter = safe.dim;
/** Apply a double underline. */
export const doubleUnderline: TemplateFormatter = safe.doubleUnderline;
/** Color the foreground with a 256-color palette index. */
export const fg256: (n: number) => TemplateFormatter = safe.fg256;
/** Color the foreground gray. */
export const gray: TemplateFormatter = safe.gray;
/** Color the foreground green. */
export const green: TemplateFormatter = safe.green;
/** Color the foreground bright green. */
export const greenBright: TemplateFormatter = safe.greenBright;
/** Color the foreground from a `#rrggbb` hex string. */
export const hex: (color: string) => TemplateFormatter = safe.hex;
/** Conceal (hide) the text. */
export const hidden: TemplateFormatter = safe.hidden;
/** Swap foreground and background. */
export const inverse: TemplateFormatter = safe.inverse;
/** Whether ANSI output is enabled for this instance. */
export const isColorSupported: boolean = safe.isColorSupported;
/** Whether OSC 8 hyperlinks are emitted for this instance. */
export const isHyperlinkSupported: boolean = safe.isHyperlinkSupported;
/** Apply italic style. */
export const italic: TemplateFormatter = safe.italic;
/** Wrap text in an OSC 8 terminal hyperlink. */
export const link: LinkFormatter = safe.link;
/** Color the foreground magenta. */
export const magenta: TemplateFormatter = safe.magenta;
/** Color the foreground bright magenta. */
export const magentaBright: TemplateFormatter = safe.magentaBright;
/** Apply an overline. */
export const overline: TemplateFormatter = safe.overline;
/** Color the foreground red. */
export const red: TemplateFormatter = safe.red;
/** Color the foreground bright red. */
export const redBright: TemplateFormatter = safe.redBright;
/** Reset all styles and colors. */
export const reset: TemplateFormatter = safe.reset;
/** Color the foreground with a 24-bit RGB triple. */
export const rgb: (r: number, g: number, b: number) => TemplateFormatter = safe.rgb;
/** Apply strikethrough. */
export const strikethrough: TemplateFormatter = safe.strikethrough;
/** Apply a single underline. */
export const underline: TemplateFormatter = safe.underline;
/** Color the foreground white. */
export const white: TemplateFormatter = safe.white;
/** Color the foreground bright white. */
export const whiteBright: TemplateFormatter = safe.whiteBright;
/** Color the foreground yellow. */
export const yellow: TemplateFormatter = safe.yellow;
/** Color the foreground bright yellow. */
export const yellowBright: TemplateFormatter = safe.yellowBright;

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
