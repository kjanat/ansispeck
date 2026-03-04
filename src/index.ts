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

/** Build an ANSI code from a numeric SGR parameter. */
const c = (n: number): string => `${E}${n}m`;

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

// If colors are disabled, return a single shared object instead of building ~30 closures.
const disabledColors: Colors = {
	isColorSupported: false,

	reset: noop,
	bold: noop,
	dim: noop,
	italic: noop,
	underline: noop,
	inverse: noop,
	hidden: noop,
	strikethrough: noop,

	black: noop,
	red: noop,
	green: noop,
	yellow: noop,
	blue: noop,
	magenta: noop,
	cyan: noop,
	white: noop,
	gray: noop,

	bgBlack: noop,
	bgRed: noop,
	bgGreen: noop,
	bgYellow: noop,
	bgBlue: noop,
	bgMagenta: noop,
	bgCyan: noop,
	bgWhite: noop,

	blackBright: noop,
	redBright: noop,
	greenBright: noop,
	yellowBright: noop,
	blueBright: noop,
	magentaBright: noop,
	cyanBright: noop,
	whiteBright: noop,

	bgBlackBright: noop,
	bgRedBright: noop,
	bgGreenBright: noop,
	bgYellowBright: noop,
	bgBlueBright: noop,
	bgMagentaBright: noop,
	bgCyanBright: noop,
	bgWhiteBright: noop,
};

/** Create a color set with explicit enabled/disabled toggle. */
function createColors(enabled: boolean = isColorSupported): Colors {
	if (!enabled) return disabledColors;
	const f = enabled ? fmt : (): Formatter => noop;
	const fg = (n: number): Formatter => f(c(n), FG);
	const bg = (n: number): Formatter => f(c(n), BG);
	const R = c(0);
	return {
		isColorSupported: enabled,

		reset: f(R, R),
		bold: f(c(1), ME, ME + c(1)),
		dim: f(c(2), ME, ME + c(2)),
		italic: f(c(3), c(23)),
		underline: f(c(4), c(24)),
		inverse: f(c(7), c(27)),
		hidden: f(c(8), c(28)),
		strikethrough: f(c(9), c(29)),

		black: fg(30),
		red: fg(31),
		green: fg(32),
		yellow: fg(33),
		blue: fg(34),
		magenta: fg(35),
		cyan: fg(36),
		white: fg(37),
		gray: fg(90),

		bgBlack: bg(40),
		bgRed: bg(41),
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
