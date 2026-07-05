/**
 * @module ansispeck/noop
 * Passthrough entrypoint: formatters coerce input to string, no ANSI codes.
 */

import { createColors } from '#internal/colors';
import type { Colors } from '#types';

const noop: Colors = createColors(false);

/** Set the background with a 256-color palette index. */
export const bg256 = noop.bg256;
/** Set the background black. */
export const bgBlack = noop.bgBlack;
/** Set the background bright black. */
export const bgBlackBright = noop.bgBlackBright;
/** Set the background blue. */
export const bgBlue = noop.bgBlue;
/** Set the background bright blue. */
export const bgBlueBright = noop.bgBlueBright;
/** Set the background cyan. */
export const bgCyan = noop.bgCyan;
/** Set the background bright cyan. */
export const bgCyanBright = noop.bgCyanBright;
/** Set the background green. */
export const bgGreen = noop.bgGreen;
/** Set the background bright green. */
export const bgGreenBright = noop.bgGreenBright;
/** Set the background from a `#rrggbb` hex string. */
export const bgHex = noop.bgHex;
/** Set the background magenta. */
export const bgMagenta = noop.bgMagenta;
/** Set the background bright magenta. */
export const bgMagentaBright = noop.bgMagentaBright;
/** Set the background red. */
export const bgRed = noop.bgRed;
/** Set the background bright red. */
export const bgRedBright = noop.bgRedBright;
/** Set the background with a 24-bit RGB triple. */
export const bgRgb = noop.bgRgb;
/** Set the background white. */
export const bgWhite = noop.bgWhite;
/** Set the background bright white. */
export const bgWhiteBright = noop.bgWhiteBright;
/** Set the background yellow. */
export const bgYellow = noop.bgYellow;
/** Set the background bright yellow. */
export const bgYellowBright = noop.bgYellowBright;
/** Color the foreground black. */
export const black = noop.black;
/** Color the foreground bright black. */
export const blackBright = noop.blackBright;
/** Apply blink. */
export const blink = noop.blink;
/** Color the foreground blue. */
export const blue = noop.blue;
/** Color the foreground bright blue. */
export const blueBright = noop.blueBright;
/** Apply bold intensity. */
export const bold = noop.bold;
/** Color the foreground cyan. */
export const cyan = noop.cyan;
/** Color the foreground bright cyan. */
export const cyanBright = noop.cyanBright;
/** Apply dim (faint) intensity. */
export const dim = noop.dim;
/** Apply a double underline. */
export const doubleUnderline = noop.doubleUnderline;
/** Color the foreground with a 256-color palette index. */
export const fg256 = noop.fg256;
/** Color the foreground gray. */
export const gray = noop.gray;
/** Color the foreground green. */
export const green = noop.green;
/** Color the foreground bright green. */
export const greenBright = noop.greenBright;
/** Color the foreground from a `#rrggbb` hex string. */
export const hex = noop.hex;
/** Conceal (hide) the text. */
export const hidden = noop.hidden;
/** Swap foreground and background. */
export const inverse = noop.inverse;
/** Whether ANSI output is enabled for this instance. */
export const isColorSupported = noop.isColorSupported;
/** Apply italic style. */
export const italic = noop.italic;
/** Wrap text in an OSC 8 terminal hyperlink. */
export const link = noop.link;
/** Color the foreground magenta. */
export const magenta = noop.magenta;
/** Color the foreground bright magenta. */
export const magentaBright = noop.magentaBright;
/** Apply an overline. */
export const overline = noop.overline;
/** Color the foreground red. */
export const red = noop.red;
/** Color the foreground bright red. */
export const redBright = noop.redBright;
/** Reset all styles and colors. */
export const reset = noop.reset;
/** Color the foreground with a 24-bit RGB triple. */
export const rgb = noop.rgb;
/** Apply strikethrough. */
export const strikethrough = noop.strikethrough;
/** Apply a single underline. */
export const underline = noop.underline;
/** Color the foreground white. */
export const white = noop.white;
/** Color the foreground bright white. */
export const whiteBright = noop.whiteBright;
/** Color the foreground yellow. */
export const yellow = noop.yellow;
/** Color the foreground bright yellow. */
export const yellowBright = noop.yellowBright;

/** Passthrough color set — coerces input to string, emits no ANSI. */
export default noop;

export type { Colors, Formattable, Formatter, FormatterName, LinkFormatter, Palette, StyleName } from '#types';
