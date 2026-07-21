/**
 * Passthrough entrypoint: formatters coerce input to string, no ANSI codes.
 *
 * @module ansispeck/noop
 */

import { createColors } from './internal/colors.ts';
import type { Colors, Formatter, LinkFormatter } from './types.ts';

export { space, tab } from './internal/whitespace.ts';

/** Passthrough color set — coerces input to string, emits no ANSI. */
const noop: Colors = createColors(false);

/** Set the background with a 256-color palette index. */
export const bg256: (n: number) => Formatter = noop.bg256;
/** Set the background black. */
export const bgBlack: Formatter = noop.bgBlack;
/** Set the background bright black. */
export const bgBlackBright: Formatter = noop.bgBlackBright;
/** Set the background blue. */
export const bgBlue: Formatter = noop.bgBlue;
/** Set the background bright blue. */
export const bgBlueBright: Formatter = noop.bgBlueBright;
/** Set the background cyan. */
export const bgCyan: Formatter = noop.bgCyan;
/** Set the background bright cyan. */
export const bgCyanBright: Formatter = noop.bgCyanBright;
/** Set the background green. */
export const bgGreen: Formatter = noop.bgGreen;
/** Set the background bright green. */
export const bgGreenBright: Formatter = noop.bgGreenBright;
/** Set the background from a `#rrggbb` hex string. */
export const bgHex: (color: string) => Formatter = noop.bgHex;
/** Set the background magenta. */
export const bgMagenta: Formatter = noop.bgMagenta;
/** Set the background bright magenta. */
export const bgMagentaBright: Formatter = noop.bgMagentaBright;
/** Set the background red. */
export const bgRed: Formatter = noop.bgRed;
/** Set the background bright red. */
export const bgRedBright: Formatter = noop.bgRedBright;
/** Set the background with a 24-bit RGB triple. */
export const bgRgb: (r: number, g: number, b: number) => Formatter = noop.bgRgb;
/** Set the background white. */
export const bgWhite: Formatter = noop.bgWhite;
/** Set the background bright white. */
export const bgWhiteBright: Formatter = noop.bgWhiteBright;
/** Set the background yellow. */
export const bgYellow: Formatter = noop.bgYellow;
/** Set the background bright yellow. */
export const bgYellowBright: Formatter = noop.bgYellowBright;
/** Color the foreground black. */
export const black: Formatter = noop.black;
/** Color the foreground bright black. */
export const blackBright: Formatter = noop.blackBright;
/** Apply blink. */
export const blink: Formatter = noop.blink;
/** Color the foreground blue. */
export const blue: Formatter = noop.blue;
/** Color the foreground bright blue. */
export const blueBright: Formatter = noop.blueBright;
/** Apply bold intensity. */
export const bold: Formatter = noop.bold;
/** Color the foreground cyan. */
export const cyan: Formatter = noop.cyan;
/** Color the foreground bright cyan. */
export const cyanBright: Formatter = noop.cyanBright;
/** Apply dim (faint) intensity. */
export const dim: Formatter = noop.dim;
/** Apply a double underline. */
export const doubleUnderline: Formatter = noop.doubleUnderline;
/** Color the foreground with a 256-color palette index. */
export const fg256: (n: number) => Formatter = noop.fg256;
/** Color the foreground gray. */
export const gray: Formatter = noop.gray;
/** Alias of {@link gray} using the British spelling. */
export const grey: Formatter = noop.grey;
/** Color the foreground green. */
export const green: Formatter = noop.green;
/** Color the foreground bright green. */
export const greenBright: Formatter = noop.greenBright;
/** Color the foreground from a `#rrggbb` hex string. */
export const hex: (color: string) => Formatter = noop.hex;
/** Conceal (hide) the text. */
export const hidden: Formatter = noop.hidden;
/** Swap foreground and background. */
export const inverse: Formatter = noop.inverse;
/** Whether ANSI output is enabled for this instance. */
export const isColorSupported: boolean = noop.isColorSupported;
/** Whether OSC 8 hyperlinks are emitted for this instance. */
export const isHyperlinkSupported: boolean = noop.isHyperlinkSupported;
/** Apply italic style. */
export const italic: Formatter = noop.italic;
/** Wrap text in an OSC 8 terminal hyperlink. */
export const link: LinkFormatter = noop.link;
/** Color the foreground magenta. */
export const magenta: Formatter = noop.magenta;
/** Color the foreground bright magenta. */
export const magentaBright: Formatter = noop.magentaBright;
/** Apply an overline. */
export const overline: Formatter = noop.overline;
/** Color the foreground red. */
export const red: Formatter = noop.red;
/** Color the foreground bright red. */
export const redBright: Formatter = noop.redBright;
/** Reset all styles and colors. */
export const reset: Formatter = noop.reset;
/** Color the foreground with a 24-bit RGB triple. */
export const rgb: (r: number, g: number, b: number) => Formatter = noop.rgb;
/** Apply strikethrough. */
export const strikethrough: Formatter = noop.strikethrough;
/** Apply a single underline. */
export const underline: Formatter = noop.underline;
/** Color the foreground white. */
export const white: Formatter = noop.white;
/** Color the foreground bright white. */
export const whiteBright: Formatter = noop.whiteBright;
/** Color the foreground yellow. */
export const yellow: Formatter = noop.yellow;
/** Color the foreground bright yellow. */
export const yellowBright: Formatter = noop.yellowBright;

export default noop;

export type { Colors, Formattable, Formatter, FormatterName, LinkFormatter, Palette, StyleName } from '#types';
