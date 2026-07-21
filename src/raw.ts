/**
 * Always-colored entrypoint: emits ANSI codes regardless of environment.
 *
 * @module ansispeck/raw
 */

import { createColors } from './internal/colors.ts';
import type { Colors, Formatter, LinkFormatter } from './types.ts';

export { space, tab } from './internal/whitespace.ts';

/** Always-on color set. Emits ANSI regardless of environment. */
const raw: Colors = createColors(true);

/** Set the background with a 256-color palette index. */
export const bg256: (n: number) => Formatter = raw.bg256;
/** Set the background black. */
export const bgBlack: Formatter = raw.bgBlack;
/** Set the background bright black. */
export const bgBlackBright: Formatter = raw.bgBlackBright;
/** Set the background blue. */
export const bgBlue: Formatter = raw.bgBlue;
/** Set the background bright blue. */
export const bgBlueBright: Formatter = raw.bgBlueBright;
/** Set the background cyan. */
export const bgCyan: Formatter = raw.bgCyan;
/** Set the background bright cyan. */
export const bgCyanBright: Formatter = raw.bgCyanBright;
/** Set the background green. */
export const bgGreen: Formatter = raw.bgGreen;
/** Set the background bright green. */
export const bgGreenBright: Formatter = raw.bgGreenBright;
/** Set the background from a `#rrggbb` hex string. */
export const bgHex: (color: string) => Formatter = raw.bgHex;
/** Set the background magenta. */
export const bgMagenta: Formatter = raw.bgMagenta;
/** Set the background bright magenta. */
export const bgMagentaBright: Formatter = raw.bgMagentaBright;
/** Set the background red. */
export const bgRed: Formatter = raw.bgRed;
/** Set the background bright red. */
export const bgRedBright: Formatter = raw.bgRedBright;
/** Set the background with a 24-bit RGB triple. */
export const bgRgb: (r: number, g: number, b: number) => Formatter = raw.bgRgb;
/** Set the background white. */
export const bgWhite: Formatter = raw.bgWhite;
/** Set the background bright white. */
export const bgWhiteBright: Formatter = raw.bgWhiteBright;
/** Set the background yellow. */
export const bgYellow: Formatter = raw.bgYellow;
/** Set the background bright yellow. */
export const bgYellowBright: Formatter = raw.bgYellowBright;
/** Color the foreground black. */
export const black: Formatter = raw.black;
/** Color the foreground bright black. */
export const blackBright: Formatter = raw.blackBright;
/** Apply blink. */
export const blink: Formatter = raw.blink;
/** Color the foreground blue. */
export const blue: Formatter = raw.blue;
/** Color the foreground bright blue. */
export const blueBright: Formatter = raw.blueBright;
/** Apply bold intensity. */
export const bold: Formatter = raw.bold;
/** Color the foreground cyan. */
export const cyan: Formatter = raw.cyan;
/** Color the foreground bright cyan. */
export const cyanBright: Formatter = raw.cyanBright;
/** Apply dim (faint) intensity. */
export const dim: Formatter = raw.dim;
/** Apply a double underline. */
export const doubleUnderline: Formatter = raw.doubleUnderline;
/** Color the foreground with a 256-color palette index. */
export const fg256: (n: number) => Formatter = raw.fg256;
/** Color the foreground gray. */
export const gray: Formatter = raw.gray;
/** Color the foreground green. */
export const green: Formatter = raw.green;
/** Color the foreground bright green. */
export const greenBright: Formatter = raw.greenBright;
/** Color the foreground from a `#rrggbb` hex string. */
export const hex: (color: string) => Formatter = raw.hex;
/** Conceal (hide) the text. */
export const hidden: Formatter = raw.hidden;
/** Swap foreground and background. */
export const inverse: Formatter = raw.inverse;
/** Whether ANSI output is enabled for this instance. */
export const isColorSupported: boolean = raw.isColorSupported;
/** Whether OSC 8 hyperlinks are emitted for this instance. */
export const isHyperlinkSupported: boolean = raw.isHyperlinkSupported;
/** Apply italic style. */
export const italic: Formatter = raw.italic;
/** Wrap text in an OSC 8 terminal hyperlink. */
export const link: LinkFormatter = raw.link;
/** Color the foreground magenta. */
export const magenta: Formatter = raw.magenta;
/** Color the foreground bright magenta. */
export const magentaBright: Formatter = raw.magentaBright;
/** Apply an overline. */
export const overline: Formatter = raw.overline;
/** Color the foreground red. */
export const red: Formatter = raw.red;
/** Color the foreground bright red. */
export const redBright: Formatter = raw.redBright;
/** Reset all styles and colors. */
export const reset: Formatter = raw.reset;
/** Color the foreground with a 24-bit RGB triple. */
export const rgb: (r: number, g: number, b: number) => Formatter = raw.rgb;
/** Apply strikethrough. */
export const strikethrough: Formatter = raw.strikethrough;
/** Apply a single underline. */
export const underline: Formatter = raw.underline;
/** Color the foreground white. */
export const white: Formatter = raw.white;
/** Color the foreground bright white. */
export const whiteBright: Formatter = raw.whiteBright;
/** Color the foreground yellow. */
export const yellow: Formatter = raw.yellow;
/** Color the foreground bright yellow. */
export const yellowBright: Formatter = raw.yellowBright;

export default raw;

export type { Colors, Formattable, Formatter, FormatterName, LinkFormatter, Palette, StyleName } from '#types';
