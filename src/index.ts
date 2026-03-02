/**
 * @module femtocolors
 * Sub-kilobyte terminal ANSI color formatting.
 */

/** Input accepted by all formatters. */
export type Formattable = string | number | null | undefined;

/** Wraps input in ANSI escape codes. */
export type Formatter = (input: Formattable) => string;

/** All available color/style formatters plus color-support flag. */
export interface Colors {
	readonly isColorSupported: boolean;

	readonly reset: Formatter;
	readonly bold: Formatter;
	readonly dim: Formatter;
	readonly italic: Formatter;
	readonly underline: Formatter;
	readonly inverse: Formatter;
	readonly hidden: Formatter;
	readonly strikethrough: Formatter;

	readonly black: Formatter;
	readonly red: Formatter;
	readonly green: Formatter;
	readonly yellow: Formatter;
	readonly blue: Formatter;
	readonly magenta: Formatter;
	readonly cyan: Formatter;
	readonly white: Formatter;
	readonly gray: Formatter;

	readonly bgBlack: Formatter;
	readonly bgRed: Formatter;
	readonly bgGreen: Formatter;
	readonly bgYellow: Formatter;
	readonly bgBlue: Formatter;
	readonly bgMagenta: Formatter;
	readonly bgCyan: Formatter;
	readonly bgWhite: Formatter;

	readonly blackBright: Formatter;
	readonly redBright: Formatter;
	readonly greenBright: Formatter;
	readonly yellowBright: Formatter;
	readonly blueBright: Formatter;
	readonly magentaBright: Formatter;
	readonly cyanBright: Formatter;
	readonly whiteBright: Formatter;

	readonly bgBlackBright: Formatter;
	readonly bgRedBright: Formatter;
	readonly bgGreenBright: Formatter;
	readonly bgYellowBright: Formatter;
	readonly bgBlueBright: Formatter;
	readonly bgMagentaBright: Formatter;
	readonly bgCyanBright: Formatter;
	readonly bgWhiteBright: Formatter;
}

// Shared ANSI fragments — hoisted to avoid repeating in every formatter call
const E = '\x1b[';
const FG = `${E}39m`;
const BG = `${E}49m`;
const ME = `${E}22m`; // modifier end (bold/dim share this close code)

/** Build an ANSI code from a numeric SGR parameter. */
function c(n: number): string {
	return `${E}${n}m`;
}

const p = globalThis.process;
const argv: readonly string[] = p?.argv ?? [];
const env: Record<string, string | undefined> = p?.env ?? {};

/** Whether the current environment supports ANSI colors. */
export const isColorSupported: boolean = !(env.NO_COLOR || argv.includes('--no-color'))
	&& !!(env.FORCE_COLOR || argv.includes('--color') || p?.platform === 'win32'
		|| (p?.stdout as { isTTY?: boolean })?.isTTY && env.TERM !== 'dumb' || env.CI);

/**
 * Wraps input in ANSI open/close codes, replacing nested close codes to prevent style leaks.
 * @see picocolors — same approach, same correctness guarantee.
 */
function fmt(open: string, close: string, replace: string = open): Formatter {
	return (input) => {
		let s = '' + input;
		let i = s.indexOf(close, open.length);
		if (~i) {
			let result = '';
			let cursor = 0;
			do {
				result += s.substring(cursor, i) + replace;
				cursor = i + close.length;
				i = s.indexOf(close, cursor);
			} while (~i);
			s = result + s.substring(cursor);
		}
		return open + s + close;
	};
}

const noop: Formatter = (input) => '' + input;

/** Create a color set with explicit enabled/disabled toggle. */
export function createColors(enabled: boolean = isColorSupported): Colors {
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
 * ```ts
 * import c from 'femtocolors';
 * console.log(c.red('error'));
 * ```
 */
const colors: Colors = createColors();
export default colors;
