/**
 * @module femtocolor
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

// ── SGR data map ────────────────────────────────────────────────

/** SGR entry: [open, close] or [open, close, replace] for bold/dim. */
type SgrEntry = readonly [number, number] | readonly [number, number, number];

/** Single source of truth for all SGR codes. */
const SGR = {
	reset: [0, 0],
	bold: [1, 22, 1],
	dim: [2, 22, 2],
	italic: [3, 23],
	underline: [4, 24],
	inverse: [7, 27],
	hidden: [8, 28],
	strikethrough: [9, 29],

	black: [30, 39],
	red: [31, 39],
	green: [32, 39],
	yellow: [33, 39],
	blue: [34, 39],
	magenta: [35, 39],
	cyan: [36, 39],
	white: [37, 39],
	gray: [90, 39],

	bgBlack: [40, 49],
	bgRed: [41, 49],
	bgGreen: [42, 49],
	bgYellow: [43, 49],
	bgBlue: [44, 49],
	bgMagenta: [45, 49],
	bgCyan: [46, 49],
	bgWhite: [47, 49],

	blackBright: [90, 39],
	redBright: [91, 39],
	greenBright: [92, 39],
	yellowBright: [93, 39],
	blueBright: [94, 39],
	magentaBright: [95, 39],
	cyanBright: [96, 39],
	whiteBright: [97, 39],

	bgBlackBright: [100, 49],
	bgRedBright: [101, 49],
	bgGreenBright: [102, 49],
	bgYellowBright: [103, 49],
	bgBlueBright: [104, 49],
	bgMagentaBright: [105, 49],
	bgCyanBright: [106, 49],
	bgWhiteBright: [107, 49],
} as const satisfies Record<string, SgrEntry>;

// ── Environment detection ───────────────────────────────────────

const p = globalThis.process;
const argv: readonly string[] = p?.argv ?? [];
const env: Record<string, string | undefined> = p?.env ?? {};

const stdout: { isTTY?: boolean } = p?.stdout ?? {};

/** Whether the current environment supports ANSI colors. */
export const isColorSupported: boolean = !(env.NO_COLOR || argv.includes('--no-color'))
	&& !!(env.FORCE_COLOR || argv.includes('--color') || p?.platform === 'win32'
		|| stdout.isTTY && env.TERM !== 'dumb' || env.CI);

// ── Core engine ─────────────────────────────────────────────────

/**
 * Replaces nested occurrences of a close code so styles don't leak.
 * @see picocolors — same approach, same correctness guarantee.
 */
function replaceClose(s: string, close: string, replace: string, index: number): string {
	let result = '';
	let cursor = 0;
	do {
		result += s.substring(cursor, index) + replace;
		cursor = index + close.length;
		index = s.indexOf(close, cursor);
	} while (~index);
	return result + s.substring(cursor);
}

function fmt(open: string, close: string, replace: string = open): Formatter {
	return (input) => {
		const s = '' + input;
		const i = s.indexOf(close, open.length);
		return ~i ? open + replaceClose(s, close, replace, i) + close : open + s + close;
	};
}

const noop: Formatter = (input) => '' + input;

/** Build an ANSI code from a numeric SGR parameter. */
function c(n: number): string {
	return `\x1b[${n}m`;
}

/** Create a color set with explicit enabled/disabled toggle. */
export function createColors(enabled: boolean = isColorSupported): Colors {
	/** Build a Formatter from an SGR entry. */
	function s(entry: SgrEntry): Formatter {
		if (!enabled) return noop;
		const open = c(entry[0]);
		const close = c(entry[1]);
		const replace = entry.length === 3 ? close + c(entry[2]) : open;
		return fmt(open, close, replace);
	}

	return {
		isColorSupported: enabled,

		reset: s(SGR.reset),
		bold: s(SGR.bold),
		dim: s(SGR.dim),
		italic: s(SGR.italic),
		underline: s(SGR.underline),
		inverse: s(SGR.inverse),
		hidden: s(SGR.hidden),
		strikethrough: s(SGR.strikethrough),

		black: s(SGR.black),
		red: s(SGR.red),
		green: s(SGR.green),
		yellow: s(SGR.yellow),
		blue: s(SGR.blue),
		magenta: s(SGR.magenta),
		cyan: s(SGR.cyan),
		white: s(SGR.white),
		gray: s(SGR.gray),

		bgBlack: s(SGR.bgBlack),
		bgRed: s(SGR.bgRed),
		bgGreen: s(SGR.bgGreen),
		bgYellow: s(SGR.bgYellow),
		bgBlue: s(SGR.bgBlue),
		bgMagenta: s(SGR.bgMagenta),
		bgCyan: s(SGR.bgCyan),
		bgWhite: s(SGR.bgWhite),

		blackBright: s(SGR.blackBright),
		redBright: s(SGR.redBright),
		greenBright: s(SGR.greenBright),
		yellowBright: s(SGR.yellowBright),
		blueBright: s(SGR.blueBright),
		magentaBright: s(SGR.magentaBright),
		cyanBright: s(SGR.cyanBright),
		whiteBright: s(SGR.whiteBright),

		bgBlackBright: s(SGR.bgBlackBright),
		bgRedBright: s(SGR.bgRedBright),
		bgGreenBright: s(SGR.bgGreenBright),
		bgYellowBright: s(SGR.bgYellowBright),
		bgBlueBright: s(SGR.bgBlueBright),
		bgMagentaBright: s(SGR.bgMagentaBright),
		bgCyanBright: s(SGR.bgCyanBright),
		bgWhiteBright: s(SGR.bgWhiteBright),
	};
}

/**
 * Default color instance, auto-detected from environment.
 *
 * @example
 * ```ts
 * import c from 'femtocolor';
 * console.log(c.red('error'));
 * ```
 */
const colors: Colors = createColors();
export default colors;
