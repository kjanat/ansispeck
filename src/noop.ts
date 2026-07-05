/**
 * @module ansispeck/noop
 * Passthrough entrypoint: formatters coerce input to string, no ANSI codes.
 */

import { createColors } from '#internal/colors';
import type { Colors } from '#types';

const noop: Colors = createColors(false);

export const bg256 = noop.bg256;
export const bgBlack = noop.bgBlack;
export const bgBlackBright = noop.bgBlackBright;
export const bgBlue = noop.bgBlue;
export const bgBlueBright = noop.bgBlueBright;
export const bgCyan = noop.bgCyan;
export const bgCyanBright = noop.bgCyanBright;
export const bgGreen = noop.bgGreen;
export const bgGreenBright = noop.bgGreenBright;
export const bgHex = noop.bgHex;
export const bgMagenta = noop.bgMagenta;
export const bgMagentaBright = noop.bgMagentaBright;
export const bgRed = noop.bgRed;
export const bgRedBright = noop.bgRedBright;
export const bgRgb = noop.bgRgb;
export const bgWhite = noop.bgWhite;
export const bgWhiteBright = noop.bgWhiteBright;
export const bgYellow = noop.bgYellow;
export const bgYellowBright = noop.bgYellowBright;
export const black = noop.black;
export const blackBright = noop.blackBright;
export const blink = noop.blink;
export const blue = noop.blue;
export const blueBright = noop.blueBright;
export const bold = noop.bold;
export const cyan = noop.cyan;
export const cyanBright = noop.cyanBright;
export const dim = noop.dim;
export const doubleUnderline = noop.doubleUnderline;
export const fg256 = noop.fg256;
export const gray = noop.gray;
export const green = noop.green;
export const greenBright = noop.greenBright;
export const hex = noop.hex;
export const hidden = noop.hidden;
export const inverse = noop.inverse;
export const isColorSupported = noop.isColorSupported;
export const italic = noop.italic;
export const link = noop.link;
export const magenta = noop.magenta;
export const magentaBright = noop.magentaBright;
export const overline = noop.overline;
export const red = noop.red;
export const redBright = noop.redBright;
export const reset = noop.reset;
export const rgb = noop.rgb;
export const strikethrough = noop.strikethrough;
export const underline = noop.underline;
export const white = noop.white;
export const whiteBright = noop.whiteBright;
export const yellow = noop.yellow;
export const yellowBright = noop.yellowBright;

export default noop;

export type { Colors, Formattable, Formatter, FormatterName, LinkFormatter, Palette, StyleName } from '#types';
