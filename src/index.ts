/**
 * @module ansispeck
 * Sub-kilobyte terminal ANSI color formatting.
 */
/** biome-ignore-all lint/style/useTemplate: perf */

import type { Colors, Formatter } from './types.ts';

// Shared ANSI fragments — hoisted to avoid repeating in every formatter call
const E = `\u{1b}[`; // `\u{1b}` is equal to `\x1b`, ``, and `\u001b`
const FG = `${E}39m`;
const BG = `${E}49m`;
const ME = `${E}22m`; // modifier end (bold/dim share this close code)

const RESET = `${E}0m`;
const BOLD = `${E}1m`;
const DIM = `${E}2m`;
const ITALIC = `${E}3m`;
const UNDERLINE = `${E}4m`;
const INVERSE = `${E}7m`;
const HIDDEN = `${E}8m`;
const STRIKETHROUGH = `${E}9m`;

const ITALIC_END = `${E}23m`;
const UNDERLINE_END = `${E}24m`;
const INVERSE_END = `${E}27m`;
const HIDDEN_END = `${E}28m`;
const STRIKETHROUGH_END = `${E}29m`;

const BLACK = `${E}30m`;
const RED = `${E}31m`;
const GREEN = `${E}32m`;
const YELLOW = `${E}33m`;
const BLUE = `${E}34m`;
const MAGENTA = `${E}35m`;
const CYAN = `${E}36m`;
const WHITE = `${E}37m`;
const GRAY = `${E}90m`;

const BG_BLACK = `${E}40m`;
const BG_RED = `${E}41m`;
const BG_GREEN = `${E}42m`;
const BG_YELLOW = `${E}43m`;
const BG_BLUE = `${E}44m`;
const BG_MAGENTA = `${E}45m`;
const BG_CYAN = `${E}46m`;
const BG_WHITE = `${E}47m`;

const RED_BRIGHT = `${E}91m`;
const GREEN_BRIGHT = `${E}92m`;
const YELLOW_BRIGHT = `${E}93m`;
const BLUE_BRIGHT = `${E}94m`;
const MAGENTA_BRIGHT = `${E}95m`;
const CYAN_BRIGHT = `${E}96m`;
const WHITE_BRIGHT = `${E}97m`;

const BG_BLACK_BRIGHT = `${E}100m`;
const BG_RED_BRIGHT = `${E}101m`;
const BG_GREEN_BRIGHT = `${E}102m`;
const BG_YELLOW_BRIGHT = `${E}103m`;
const BG_BLUE_BRIGHT = `${E}104m`;
const BG_MAGENTA_BRIGHT = `${E}105m`;
const BG_CYAN_BRIGHT = `${E}106m`;
const BG_WHITE_BRIGHT = `${E}107m`;

const p = globalThis.process;
const argv: readonly string[] = p?.argv ?? [];
const env: Record<string, string | undefined> = p?.env ?? {};

/** Whether the current environment supports ANSI colors. */
const isColorSupported: boolean = !(env.NO_COLOR || argv.includes('--no-color'))
	&& !!(
		env.FORCE_COLOR
		|| argv.includes('--color')
		|| p?.platform === 'win32'
		|| ((p?.stdout as { isTTY?: boolean })?.isTTY && env.TERM !== 'dumb')
		|| env.CI
	);

/**
 * Wraps input in ANSI open/close codes, replacing nested close codes to prevent style leaks.
 * Uses nesting-safe close-code replacement to prevent style leaks.
 */
function fmt(open: string, close: string, replace: string = open): Formatter {
	return (input) => {
		let inputAsString = '' + input;
		let closeIndex = inputAsString.indexOf(close, open.length);
		if (~closeIndex) {
			let rebuiltString = '';
			let readCursor = 0;
			do {
				rebuiltString += inputAsString.substring(readCursor, closeIndex) + replace;
				readCursor = closeIndex + close.length;
				closeIndex = inputAsString.indexOf(close, readCursor);
			} while (~closeIndex);
			inputAsString = rebuiltString + inputAsString.substring(readCursor);
		}
		return open + inputAsString + close;
	};
}

const noop: Formatter = (input) => '' + input;

/** Create a color set with explicit enabled/disabled toggle. */
function createColors(enabled: boolean = isColorSupported): Colors {
	const formatterFactory = enabled ? fmt : (): Formatter => noop;
	return {
		isColorSupported: enabled,

		reset: formatterFactory(RESET, RESET),
		bold: formatterFactory(BOLD, ME, ME + BOLD),
		dim: formatterFactory(DIM, ME, ME + DIM),
		italic: formatterFactory(ITALIC, ITALIC_END),
		underline: formatterFactory(UNDERLINE, UNDERLINE_END),
		inverse: formatterFactory(INVERSE, INVERSE_END),
		hidden: formatterFactory(HIDDEN, HIDDEN_END),
		strikethrough: formatterFactory(STRIKETHROUGH, STRIKETHROUGH_END),

		black: formatterFactory(BLACK, FG),
		red: formatterFactory(RED, FG),
		green: formatterFactory(GREEN, FG),
		yellow: formatterFactory(YELLOW, FG),
		blue: formatterFactory(BLUE, FG),
		magenta: formatterFactory(MAGENTA, FG),
		cyan: formatterFactory(CYAN, FG),
		white: formatterFactory(WHITE, FG),
		gray: formatterFactory(GRAY, FG),

		bgBlack: formatterFactory(BG_BLACK, BG),
		bgRed: formatterFactory(BG_RED, BG),
		bgGreen: formatterFactory(BG_GREEN, BG),
		bgYellow: formatterFactory(BG_YELLOW, BG),
		bgBlue: formatterFactory(BG_BLUE, BG),
		bgMagenta: formatterFactory(BG_MAGENTA, BG),
		bgCyan: formatterFactory(BG_CYAN, BG),
		bgWhite: formatterFactory(BG_WHITE, BG),

		blackBright: formatterFactory(GRAY, FG),
		redBright: formatterFactory(RED_BRIGHT, FG),
		greenBright: formatterFactory(GREEN_BRIGHT, FG),
		yellowBright: formatterFactory(YELLOW_BRIGHT, FG),
		blueBright: formatterFactory(BLUE_BRIGHT, FG),
		magentaBright: formatterFactory(MAGENTA_BRIGHT, FG),
		cyanBright: formatterFactory(CYAN_BRIGHT, FG),
		whiteBright: formatterFactory(WHITE_BRIGHT, FG),

		bgBlackBright: formatterFactory(BG_BLACK_BRIGHT, BG),
		bgRedBright: formatterFactory(BG_RED_BRIGHT, BG),
		bgGreenBright: formatterFactory(BG_GREEN_BRIGHT, BG),
		bgYellowBright: formatterFactory(BG_YELLOW_BRIGHT, BG),
		bgBlueBright: formatterFactory(BG_BLUE_BRIGHT, BG),
		bgMagentaBright: formatterFactory(BG_MAGENTA_BRIGHT, BG),
		bgCyanBright: formatterFactory(BG_CYAN_BRIGHT, BG),
		bgWhiteBright: formatterFactory(BG_WHITE_BRIGHT, BG),
	};
}

/**
 * Default color instance, auto-detected from environment.
 *
 * @example
 * import c from 'ansispeck';
 *
 * console.log(c.red('error'));
 */
const colors: Colors = createColors();

// export default colors;
export { colors, colors as default, createColors, isColorSupported };
export type { Colors, Formattable, Formatter } from './types.ts';
