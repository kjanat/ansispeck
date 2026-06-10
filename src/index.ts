/**
 * @module ansispeck
 * ~1 KB (gzipped) terminal ANSI color formatting.
 */

/** Input accepted by all formatters. */
export type Formattable = string | number | null | undefined;

/** Wraps input in ANSI escape codes. */
export type Formatter = (input: Formattable) => string;

/** Wraps text in an OSC 8 terminal hyperlink. Text defaults to the URL. */
export interface LinkFormatter {
	(url: string | URL, text?: Formattable | URL): string;
	(strings: TemplateStringsArray, ...values: readonly unknown[]): string;
}

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
	readonly overline: Formatter;
	readonly doubleUnderline: Formatter;
	readonly blink: Formatter;

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

	readonly link: LinkFormatter;

	readonly fg256: (n: number) => Formatter;
	readonly bg256: (n: number) => Formatter;
	readonly rgb: (r: number, g: number, b: number) => Formatter;
	readonly bgRgb: (r: number, g: number, b: number) => Formatter;
	readonly hex: (color: string) => Formatter;
	readonly bgHex: (color: string) => Formatter;
}

// Shared ANSI fragments — hoisted to avoid repeating in every formatter call
const ESC = '\x1b';
const E = `${ESC}[`;
const FG = `${E}39m`;
const BG = `${E}49m`;
const ME = `${E}22m`; // modifier end (bold/dim share this close code)
const OSC8 = '\x1b]8;;';
const ST = '\x1b\\'; // string terminator

/** Build an ANSI code from a numeric SGR parameter. */
function c(n: number): string {
	return `${E}${n}m`;
}

/** Parse '#rgb' or '#rrggbb' into an 'r;g;b' SGR fragment. */
function hx(color: string): string {
	let h = color.replace('#', '');
	if (h.length === 3) h = h.replace(/[\da-f]/gi, '$&$&');
	const n = parseInt(h, 16);
	return `${(n >> 16) & 255};${(n >> 8) & 255};${n & 255}`;
}

/** Matches SGR codes and OSC sequences (BEL- or ST-terminated). */
const ANSI = new RegExp(`${ESC}\\[[\\d;]*m|${ESC}\\][\\s\\S]*?(?:\\x07|${ESC}\\\\)`, 'g');

/** Remove all ANSI SGR and OSC escape sequences from input. */
export function strip(input: Formattable): string {
	return ('' + input).replace(ANSI, '');
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
 * Uses nesting-safe close-code replacement to prevent style leaks.
 */
function fmt(open: string, close: string, replace: string = open): Formatter {
	return (input) => {
		let s = '' + input;
		let i = s.indexOf(close);
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

/** Join a template literal's strings and interpolated values. */
function join(strings: TemplateStringsArray, values: readonly unknown[]): string {
	let s = strings[0] ?? '';
	for (let i = 0; i < values.length; i++) s += String(values[i]) + (strings[i + 1] ?? '');
	return s;
}

/** Build a LinkFormatter handling both call styles: (url, text?) and template tag. */
function mkLink(wrap: (url: string, text: string) => string): LinkFormatter {
	return (first: string | URL | TemplateStringsArray, ...rest: readonly unknown[]): string => {
		if (typeof first === 'object' && 'raw' in first) {
			const url = join(first, rest);
			return wrap(url, url);
		}
		const url = String(first);
		return wrap(url, rest[0] === undefined ? url : String(rest[0]));
	};
}

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
		overline: f(c(53), c(55)),
		doubleUnderline: f(c(21), c(24)),
		blink: f(c(5), c(25)),

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

		link: mkLink(
			enabled
				? (url, text) => OSC8 + url + ST + text + OSC8 + ST
				: (_url, text) => text,
		),

		fg256: (n) => f(`${E}38;5;${n}m`, FG),
		bg256: (n) => f(`${E}48;5;${n}m`, BG),
		rgb: (r, g, b) => f(`${E}38;2;${r};${g};${b}m`, FG),
		bgRgb: (r, g, b) => f(`${E}48;2;${r};${g};${b}m`, BG),
		hex: (color) => f(`${E}38;2;${hx(color)}m`, FG),
		bgHex: (color) => f(`${E}48;2;${hx(color)}m`, BG),
	};
}

/**
 * Default color instance, auto-detected from environment.
 *
 * @example
 * ```ts
 * import c from 'ansispeck';
 * console.log(c.red('error'));
 * ```
 */
const colors: Colors = createColors();
export default colors;
