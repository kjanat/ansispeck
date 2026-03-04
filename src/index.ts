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

/** Build an ANSI code from a numeric SGR parameter. */
const c = (n: number): string => `${E}${n}m`;

const BLACK = `${E}30m`;
const RED = `${E}31m`;
const GREEN = `${E}32m`;
const YELLOW = `${E}33m`;
const BLUE = `${E}34m`;
const BG_RED = `${E}41m`;

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
	const fg = (n: number): Formatter => formatterFactory(c(n), FG);
	const bg = (n: number): Formatter => formatterFactory(c(n), BG);
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
		magenta: fg(35),
		cyan: fg(36),
		white: fg(37),
		gray: fg(90),

		bgBlack: bg(40),
		bgRed: formatterFactory(BG_RED, BG),
		bgGreen: bg(42),
		bgYellow: bg(43),
		bgBlue: bg(44),
		bgMagenta: bg(45),
		bgCyan: bg(46),
		bgWhite: bg(47),

		blackBright: fg(90),
		redBright: fg(91),
		greenBright: fg(92),
		yellowBright: fg(93),
		blueBright: fg(94),
		magentaBright: fg(95),
		cyanBright: fg(96),
		whiteBright: fg(97),

		bgBlackBright: bg(100),
		bgRedBright: bg(101),
		bgGreenBright: bg(102),
		bgYellowBright: bg(103),
		bgBlueBright: bg(104),
		bgMagentaBright: bg(105),
		bgCyanBright: bg(106),
		bgWhiteBright: bg(107),
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
