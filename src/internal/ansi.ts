/**
 * @module ansispeck/internal/ansi
 * Single source of truth for ANSI codes and formatter factories.
 */

import type { Formattable, Formatter, FormatterName, LinkFormatter } from '#types';

// Shared ANSI fragments — hoisted to avoid repeating in every formatter call
export const ESC = '\x1b';
const E = `${ESC}[`;
export const FG_CLOSE = `${E}39m`;
export const BG_CLOSE = `${E}49m`;
const ME = `${E}22m`; // modifier end (bold/dim share this close code)
const OSC8 = `${ESC}]8;;`;
const ST = `${ESC}\\`; // string terminator

/** Build an ANSI code from a numeric SGR parameter. */
export function c(n: number): string {
	return `${E}${n}m`;
}

/** 256-color palette open codes. */
export const fg256Open = (n: number): string => `${E}38;5;${n}m`;
export const bg256Open = (n: number): string => `${E}48;5;${n}m`;

/** Truecolor open codes. */
export const rgbOpen = (r: number, g: number, b: number): string => `${E}38;2;${r};${g};${b}m`;
export const bgRgbOpen = (r: number, g: number, b: number): string => `${E}48;2;${r};${g};${b}m`;

/** Parse '#rgb' or '#rrggbb' into an 'r;g;b' SGR fragment. */
function hx(color: string): string {
	let h = color.replace('#', '');
	if (h.length === 3) h = h.replace(/[\da-f]/gi, '$&$&');
	const n = parseInt(h, 16);
	return `${(n >> 16) & 255};${(n >> 8) & 255};${n & 255}`;
}
export const hexOpen = (color: string): string => `${E}38;2;${hx(color)}m`;
export const bgHexOpen = (color: string): string => `${E}48;2;${hx(color)}m`;

/** Matches SGR codes and OSC sequences (BEL- or ST-terminated). */
const ANSI = new RegExp(`${ESC}\\[[\\d;]*m|${ESC}\\][\\s\\S]*?(?:\\x07|${ESC}\\\\)`, 'g');

/** Remove all ANSI SGR and OSC escape sequences from input. */
export function strip(input: Formattable): string {
	return ('' + input).replace(ANSI, '');
}

/** Coerce formatter input to string. */
export const text = (input: Formattable): string => '' + input;

/** Per-formatter wrap factory: receives open/close/replace codes, returns the flavor's formatter. */
export type Wrap<T> = (open: string, close: string, replace?: string) => T;

/**
 * Wraps input in ANSI open/close codes, replacing nested close codes to prevent style leaks.
 */
export function fmt(open: string, close: string, replace: string = open): Formatter {
	// Any close produced by composition is preceded by its own open (>= skip
	// chars), so starting the scan there is safe — and lets indexOf bail
	// without scanning when the input is shorter than the skip.
	const skip = open.length < close.length ? open.length : close.length;
	return (input) => {
		let s = '' + input;
		let i = s.indexOf(close, skip);
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

/** Join a template literal's strings and interpolated values. */
function join(strings: TemplateStringsArray, values: readonly unknown[]): string {
	let s = strings[0] ?? '';
	for (let i = 0; i < values.length; i++) s += String(values[i]) + (strings[i + 1] ?? '');
	return s;
}

/** Build a LinkFormatter handling both call styles: (url, text?) and template tag. */
export function mkLink(wrap: (url: string, text: string) => string): LinkFormatter {
	return (first: string | URL | TemplateStringsArray, ...rest: readonly unknown[]): string => {
		if (typeof first === 'object' && 'raw' in first) {
			const url = join(first, rest);
			return wrap(url, url);
		}
		const url = String(first);
		return wrap(url, rest[0] === undefined ? url : String(rest[0]));
	};
}

/** OSC 8 hyperlink wrapper used by enabled palettes. */
export const linkOpen = (url: string, body: string): string => OSC8 + url + ST + body + OSC8 + ST;

/** Build a complete palette by applying `wrap` to every formatter's SGR codes. */
export function mapPalette<T>(wrap: Wrap<T>): Readonly<Record<FormatterName, T>> {
	const R = c(0);
	return {
		reset: wrap(R, R),
		bold: wrap(c(1), ME, ME + c(1)),
		dim: wrap(c(2), ME, ME + c(2)),
		italic: wrap(c(3), c(23)),
		underline: wrap(c(4), c(24)),
		blink: wrap(c(5), c(25)),
		inverse: wrap(c(7), c(27)),
		hidden: wrap(c(8), c(28)),
		strikethrough: wrap(c(9), c(29)),
		doubleUnderline: wrap(c(21), c(24)),
		overline: wrap(c(53), c(55)),

		black: wrap(c(30), FG_CLOSE),
		blue: wrap(c(34), FG_CLOSE),
		cyan: wrap(c(36), FG_CLOSE),
		gray: wrap(c(90), FG_CLOSE),
		green: wrap(c(32), FG_CLOSE),
		magenta: wrap(c(35), FG_CLOSE),
		red: wrap(c(31), FG_CLOSE),
		white: wrap(c(37), FG_CLOSE),
		yellow: wrap(c(33), FG_CLOSE),

		bgBlack: wrap(c(40), BG_CLOSE),
		bgBlue: wrap(c(44), BG_CLOSE),
		bgCyan: wrap(c(46), BG_CLOSE),
		bgGreen: wrap(c(42), BG_CLOSE),
		bgMagenta: wrap(c(45), BG_CLOSE),
		bgRed: wrap(c(41), BG_CLOSE),
		bgWhite: wrap(c(47), BG_CLOSE),
		bgYellow: wrap(c(43), BG_CLOSE),

		blackBright: wrap(c(90), FG_CLOSE),
		blueBright: wrap(c(94), FG_CLOSE),
		cyanBright: wrap(c(96), FG_CLOSE),
		greenBright: wrap(c(92), FG_CLOSE),
		magentaBright: wrap(c(95), FG_CLOSE),
		redBright: wrap(c(91), FG_CLOSE),
		whiteBright: wrap(c(97), FG_CLOSE),
		yellowBright: wrap(c(93), FG_CLOSE),

		bgBlackBright: wrap(c(100), BG_CLOSE),
		bgBlueBright: wrap(c(104), BG_CLOSE),
		bgCyanBright: wrap(c(106), BG_CLOSE),
		bgGreenBright: wrap(c(102), BG_CLOSE),
		bgMagentaBright: wrap(c(105), BG_CLOSE),
		bgRedBright: wrap(c(101), BG_CLOSE),
		bgWhiteBright: wrap(c(107), BG_CLOSE),
		bgYellowBright: wrap(c(103), BG_CLOSE),
	};
}
