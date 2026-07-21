/** Shared default implementation for the auto-detected public entrypoints. */

import type { Colors, Formatter, LinkFormatter } from '../types.ts';
import { strip } from './ansi.ts';
import { createColors } from './colors.ts';
import { detectColorSupport, detectHyperlinkSupport } from './detect.ts';

/** Auto-detecting color set — the default entrypoint. */
const colors: Colors = createColors(detectColorSupport(), detectHyperlinkSupport());

export { space, tab } from './whitespace.ts';
export { createColors, detectColorSupport, detectHyperlinkSupport, strip };

/** Set the background with a 256-color palette index. */
export const bg256: (n: number) => Formatter = colors.bg256;
/** Set the background black. */
export const bgBlack: Formatter = colors.bgBlack;
/** Set the background bright black. */
export const bgBlackBright: Formatter = colors.bgBlackBright;
/** Set the background blue. */
export const bgBlue: Formatter = colors.bgBlue;
/** Set the background bright blue. */
export const bgBlueBright: Formatter = colors.bgBlueBright;
/** Set the background cyan. */
export const bgCyan: Formatter = colors.bgCyan;
/** Set the background bright cyan. */
export const bgCyanBright: Formatter = colors.bgCyanBright;
/** Set the background green. */
export const bgGreen: Formatter = colors.bgGreen;
/** Set the background bright green. */
export const bgGreenBright: Formatter = colors.bgGreenBright;
/** Set the background from a `#rrggbb` hex string. */
export const bgHex: (color: string) => Formatter = colors.bgHex;
/** Set the background magenta. */
export const bgMagenta: Formatter = colors.bgMagenta;
/** Set the background bright magenta. */
export const bgMagentaBright: Formatter = colors.bgMagentaBright;
/** Set the background red. */
export const bgRed: Formatter = colors.bgRed;
/** Set the background bright red. */
export const bgRedBright: Formatter = colors.bgRedBright;
/** Set the background with a 24-bit RGB triple. */
export const bgRgb: (r: number, g: number, b: number) => Formatter = colors.bgRgb;
/** Set the background white. */
export const bgWhite: Formatter = colors.bgWhite;
/** Set the background bright white. */
export const bgWhiteBright: Formatter = colors.bgWhiteBright;
/** Set the background yellow. */
export const bgYellow: Formatter = colors.bgYellow;
/** Set the background bright yellow. */
export const bgYellowBright: Formatter = colors.bgYellowBright;
/** Color the foreground black. */
export const black: Formatter = colors.black;
/** Color the foreground bright black. */
export const blackBright: Formatter = colors.blackBright;
/** Apply blink. */
export const blink: Formatter = colors.blink;
/** Color the foreground blue. */
export const blue: Formatter = colors.blue;
/** Color the foreground bright blue. */
export const blueBright: Formatter = colors.blueBright;
/** Apply bold intensity. */
export const bold: Formatter = colors.bold;
/** Color the foreground cyan. */
export const cyan: Formatter = colors.cyan;
/** Color the foreground bright cyan. */
export const cyanBright: Formatter = colors.cyanBright;
/** Apply dim (faint) intensity. */
export const dim: Formatter = colors.dim;
/** Apply a double underline. */
export const doubleUnderline: Formatter = colors.doubleUnderline;
/** Color the foreground with a 256-color palette index. */
export const fg256: (n: number) => Formatter = colors.fg256;
/** Color the foreground gray. */
export const gray: Formatter = colors.gray;
/** Color the foreground green. */
export const green: Formatter = colors.green;
/** Color the foreground bright green. */
export const greenBright: Formatter = colors.greenBright;
/** Color the foreground from a `#rrggbb` hex string. */
export const hex: (color: string) => Formatter = colors.hex;
/** Conceal (hide) the text. */
export const hidden: Formatter = colors.hidden;
/** Swap foreground and background. */
export const inverse: Formatter = colors.inverse;
/** Whether ANSI output is enabled for this instance. */
export const isColorSupported: boolean = colors.isColorSupported;
/** Whether OSC 8 hyperlinks are emitted for this instance. */
export const isHyperlinkSupported: boolean = colors.isHyperlinkSupported;
/** Apply italic style. */
export const italic: Formatter = colors.italic;
/** Wrap text in an OSC 8 terminal hyperlink. */
export const link: LinkFormatter = colors.link;
/** Color the foreground magenta. */
export const magenta: Formatter = colors.magenta;
/** Color the foreground bright magenta. */
export const magentaBright: Formatter = colors.magentaBright;
/** Apply an overline. */
export const overline: Formatter = colors.overline;
/** Color the foreground red. */
export const red: Formatter = colors.red;
/** Color the foreground bright red. */
export const redBright: Formatter = colors.redBright;
/** Reset all styles and colors. */
export const reset: Formatter = colors.reset;
/** Color the foreground with a 24-bit RGB triple. */
export const rgb: (r: number, g: number, b: number) => Formatter = colors.rgb;
/** Apply strikethrough. */
export const strikethrough: Formatter = colors.strikethrough;
/** Apply a single underline. */
export const underline: Formatter = colors.underline;
/** Color the foreground white. */
export const white: Formatter = colors.white;
/** Color the foreground bright white. */
export const whiteBright: Formatter = colors.whiteBright;
/** Color the foreground yellow. */
export const yellow: Formatter = colors.yellow;
/** Color the foreground bright yellow. */
export const yellowBright: Formatter = colors.yellowBright;

export default colors;

export type {
	BaseColorName,
	Chunk,
	ChunkFormatter,
	ChunkPalette,
	Chunkable,
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
	VariantBaseColorName,
} from '#types';
