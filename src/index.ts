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

/** Set the background with a 256-color palette index. */
export const bg256 = colors.bg256;
/** Set the background black. */
export const bgBlack = colors.bgBlack;
/** Set the background bright black. */
export const bgBlackBright = colors.bgBlackBright;
/** Set the background blue. */
export const bgBlue = colors.bgBlue;
/** Set the background bright blue. */
export const bgBlueBright = colors.bgBlueBright;
/** Set the background cyan. */
export const bgCyan = colors.bgCyan;
/** Set the background bright cyan. */
export const bgCyanBright = colors.bgCyanBright;
/** Set the background green. */
export const bgGreen = colors.bgGreen;
/** Set the background bright green. */
export const bgGreenBright = colors.bgGreenBright;
/** Set the background from a `#rrggbb` hex string. */
export const bgHex = colors.bgHex;
/** Set the background magenta. */
export const bgMagenta = colors.bgMagenta;
/** Set the background bright magenta. */
export const bgMagentaBright = colors.bgMagentaBright;
/** Set the background red. */
export const bgRed = colors.bgRed;
/** Set the background bright red. */
export const bgRedBright = colors.bgRedBright;
/** Set the background with a 24-bit RGB triple. */
export const bgRgb = colors.bgRgb;
/** Set the background white. */
export const bgWhite = colors.bgWhite;
/** Set the background bright white. */
export const bgWhiteBright = colors.bgWhiteBright;
/** Set the background yellow. */
export const bgYellow = colors.bgYellow;
/** Set the background bright yellow. */
export const bgYellowBright = colors.bgYellowBright;
/** Color the foreground black. */
export const black = colors.black;
/** Color the foreground bright black. */
export const blackBright = colors.blackBright;
/** Apply blink. */
export const blink = colors.blink;
/** Color the foreground blue. */
export const blue = colors.blue;
/** Color the foreground bright blue. */
export const blueBright = colors.blueBright;
/** Apply bold intensity. */
export const bold = colors.bold;
/** Color the foreground cyan. */
export const cyan = colors.cyan;
/** Color the foreground bright cyan. */
export const cyanBright = colors.cyanBright;
/** Apply dim (faint) intensity. */
export const dim = colors.dim;
/** Apply a double underline. */
export const doubleUnderline = colors.doubleUnderline;
/** Color the foreground with a 256-color palette index. */
export const fg256 = colors.fg256;
/** Color the foreground gray. */
export const gray = colors.gray;
/** Color the foreground green. */
export const green = colors.green;
/** Color the foreground bright green. */
export const greenBright = colors.greenBright;
/** Color the foreground from a `#rrggbb` hex string. */
export const hex = colors.hex;
/** Conceal (hide) the text. */
export const hidden = colors.hidden;
/** Swap foreground and background. */
export const inverse = colors.inverse;
/** Whether ANSI output is enabled for this instance. */
export const isColorSupported = colors.isColorSupported;
/** Apply italic style. */
export const italic = colors.italic;
/** Wrap text in an OSC 8 terminal hyperlink. */
export const link = colors.link;
/** Color the foreground magenta. */
export const magenta = colors.magenta;
/** Color the foreground bright magenta. */
export const magentaBright = colors.magentaBright;
/** Apply an overline. */
export const overline = colors.overline;
/** Color the foreground red. */
export const red = colors.red;
/** Color the foreground bright red. */
export const redBright = colors.redBright;
/** Reset all styles and colors. */
export const reset = colors.reset;
/** Color the foreground with a 24-bit RGB triple. */
export const rgb = colors.rgb;
/** Apply strikethrough. */
export const strikethrough = colors.strikethrough;
/** Apply a single underline. */
export const underline = colors.underline;
/** Color the foreground white. */
export const white = colors.white;
/** Color the foreground bright white. */
export const whiteBright = colors.whiteBright;
/** Color the foreground yellow. */
export const yellow = colors.yellow;
/** Color the foreground bright yellow. */
export const yellowBright = colors.yellowBright;

/** Auto-detecting color set — the default entrypoint. */
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
