/**
 * @module ansispeck/raw
 * Always-colored entrypoint: emits ANSI codes regardless of environment.
 */

import { createColors } from '#internal/colors';
import type { Colors } from '#types';

const raw: Colors = createColors(true);

export const bg256 = raw.bg256;
export const bgBlack = raw.bgBlack;
export const bgBlackBright = raw.bgBlackBright;
export const bgBlue = raw.bgBlue;
export const bgBlueBright = raw.bgBlueBright;
export const bgCyan = raw.bgCyan;
export const bgCyanBright = raw.bgCyanBright;
export const bgGreen = raw.bgGreen;
export const bgGreenBright = raw.bgGreenBright;
export const bgHex = raw.bgHex;
export const bgMagenta = raw.bgMagenta;
export const bgMagentaBright = raw.bgMagentaBright;
export const bgRed = raw.bgRed;
export const bgRedBright = raw.bgRedBright;
export const bgRgb = raw.bgRgb;
export const bgWhite = raw.bgWhite;
export const bgWhiteBright = raw.bgWhiteBright;
export const bgYellow = raw.bgYellow;
export const bgYellowBright = raw.bgYellowBright;
export const black = raw.black;
export const blackBright = raw.blackBright;
export const blink = raw.blink;
export const blue = raw.blue;
export const blueBright = raw.blueBright;
export const bold = raw.bold;
export const cyan = raw.cyan;
export const cyanBright = raw.cyanBright;
export const dim = raw.dim;
export const doubleUnderline = raw.doubleUnderline;
export const fg256 = raw.fg256;
export const gray = raw.gray;
export const green = raw.green;
export const greenBright = raw.greenBright;
export const hex = raw.hex;
export const hidden = raw.hidden;
export const inverse = raw.inverse;
export const isColorSupported = raw.isColorSupported;
export const italic = raw.italic;
export const link = raw.link;
export const magenta = raw.magenta;
export const magentaBright = raw.magentaBright;
export const overline = raw.overline;
export const red = raw.red;
export const redBright = raw.redBright;
export const reset = raw.reset;
export const rgb = raw.rgb;
export const strikethrough = raw.strikethrough;
export const underline = raw.underline;
export const white = raw.white;
export const whiteBright = raw.whiteBright;
export const yellow = raw.yellow;
export const yellowBright = raw.yellowBright;

export default raw;

export type { Colors, Formattable, Formatter, FormatterName, LinkFormatter, Palette, StyleName } from '#types';
