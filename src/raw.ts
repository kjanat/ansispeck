/**
 * @module ansispeck/raw
 * Always-colored entrypoint: emits ANSI codes regardless of environment.
 */

import { createColors } from '#internal/colors';
import type { Colors } from '#types';

const raw: Colors = createColors(true);

/** Set the background with a 256-color palette index. */
export const bg256 = raw.bg256;
/** Set the background black. */
export const bgBlack = raw.bgBlack;
/** Set the background bright black. */
export const bgBlackBright = raw.bgBlackBright;
/** Set the background blue. */
export const bgBlue = raw.bgBlue;
/** Set the background bright blue. */
export const bgBlueBright = raw.bgBlueBright;
/** Set the background cyan. */
export const bgCyan = raw.bgCyan;
/** Set the background bright cyan. */
export const bgCyanBright = raw.bgCyanBright;
/** Set the background green. */
export const bgGreen = raw.bgGreen;
/** Set the background bright green. */
export const bgGreenBright = raw.bgGreenBright;
/** Set the background from a `#rrggbb` hex string. */
export const bgHex = raw.bgHex;
/** Set the background magenta. */
export const bgMagenta = raw.bgMagenta;
/** Set the background bright magenta. */
export const bgMagentaBright = raw.bgMagentaBright;
/** Set the background red. */
export const bgRed = raw.bgRed;
/** Set the background bright red. */
export const bgRedBright = raw.bgRedBright;
/** Set the background with a 24-bit RGB triple. */
export const bgRgb = raw.bgRgb;
/** Set the background white. */
export const bgWhite = raw.bgWhite;
/** Set the background bright white. */
export const bgWhiteBright = raw.bgWhiteBright;
/** Set the background yellow. */
export const bgYellow = raw.bgYellow;
/** Set the background bright yellow. */
export const bgYellowBright = raw.bgYellowBright;
/** Color the foreground black. */
export const black = raw.black;
/** Color the foreground bright black. */
export const blackBright = raw.blackBright;
/** Apply blink. */
export const blink = raw.blink;
/** Color the foreground blue. */
export const blue = raw.blue;
/** Color the foreground bright blue. */
export const blueBright = raw.blueBright;
/** Apply bold intensity. */
export const bold = raw.bold;
/** Color the foreground cyan. */
export const cyan = raw.cyan;
/** Color the foreground bright cyan. */
export const cyanBright = raw.cyanBright;
/** Apply dim (faint) intensity. */
export const dim = raw.dim;
/** Apply a double underline. */
export const doubleUnderline = raw.doubleUnderline;
/** Color the foreground with a 256-color palette index. */
export const fg256 = raw.fg256;
/** Color the foreground gray. */
export const gray = raw.gray;
/** Color the foreground green. */
export const green = raw.green;
/** Color the foreground bright green. */
export const greenBright = raw.greenBright;
/** Color the foreground from a `#rrggbb` hex string. */
export const hex = raw.hex;
/** Conceal (hide) the text. */
export const hidden = raw.hidden;
/** Swap foreground and background. */
export const inverse = raw.inverse;
/** Whether ANSI output is enabled for this instance. */
export const isColorSupported = raw.isColorSupported;
/** Apply italic style. */
export const italic = raw.italic;
/** Wrap text in an OSC 8 terminal hyperlink. */
export const link = raw.link;
/** Color the foreground magenta. */
export const magenta = raw.magenta;
/** Color the foreground bright magenta. */
export const magentaBright = raw.magentaBright;
/** Apply an overline. */
export const overline = raw.overline;
/** Color the foreground red. */
export const red = raw.red;
/** Color the foreground bright red. */
export const redBright = raw.redBright;
/** Reset all styles and colors. */
export const reset = raw.reset;
/** Color the foreground with a 24-bit RGB triple. */
export const rgb = raw.rgb;
/** Apply strikethrough. */
export const strikethrough = raw.strikethrough;
/** Apply a single underline. */
export const underline = raw.underline;
/** Color the foreground white. */
export const white = raw.white;
/** Color the foreground bright white. */
export const whiteBright = raw.whiteBright;
/** Color the foreground yellow. */
export const yellow = raw.yellow;
/** Color the foreground bright yellow. */
export const yellowBright = raw.yellowBright;

/** Always-on color set — emits ANSI regardless of environment. */
export default raw;

export type { Colors, Formattable, Formatter, FormatterName, LinkFormatter, Palette, StyleName } from '#types';
