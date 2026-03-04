import auto, { isColorSupported, red } from 'ansispeck';
import noop from 'ansispeck/noop';
import raw from 'ansispeck/raw';
import rope, { createRope } from 'ansispeck/rope';
import safe, { isColorSupported as isSafeColorSupported } from 'ansispeck/safe';
import { describe, expect, test } from 'bun:test';

import type { Palette, TemplatePalette } from 'ansispeck';

const formatterNames: (keyof Palette)[] = [
	'reset',
	'bold',
	'dim',
	'italic',
	'underline',
	'inverse',
	'hidden',
	'strikethrough',
	'black',
	'red',
	'green',
	'yellow',
	'blue',
	'magenta',
	'cyan',
	'white',
	'gray',
	'bgBlack',
	'bgRed',
	'bgGreen',
	'bgYellow',
	'bgBlue',
	'bgMagenta',
	'bgCyan',
	'bgWhite',
	'blackBright',
	'redBright',
	'greenBright',
	'yellowBright',
	'blueBright',
	'magentaBright',
	'cyanBright',
	'whiteBright',
	'bgBlackBright',
	'bgRedBright',
	'bgGreenBright',
	'bgYellowBright',
	'bgBlueBright',
	'bgMagentaBright',
	'bgCyanBright',
	'bgWhiteBright',
];

describe('raw entrypoint', () => {
	test('wraps values with expected ansi pairs', () => {
		expect(raw.red('x')).toBe('\x1b[31mx\x1b[39m');
		expect(raw.bold('x')).toBe('\x1b[1mx\x1b[22m');
		expect(raw.bgRed('x')).toBe('\x1b[41mx\x1b[49m');
	});

	test('coerces non-string inputs', () => {
		expect(raw.red(1)).toBe('\x1b[31m1\x1b[39m');
		expect(raw.red(false)).toBe('\x1b[31mfalse\x1b[39m');
		expect(raw.red(null)).toBe('\x1b[31mnull\x1b[39m');
	});

	test('does not repair embedded close codes (speed-first)', () => {
		expect(raw.red('hello\x1b[39mworld')).toBe('\x1b[31mhello\x1b[39mworld\x1b[39m');
		expect(raw.bold('hello\x1b[22mworld')).toBe('\x1b[1mhello\x1b[22mworld\x1b[22m');
		expect(raw.red(`a${raw.yellow('x')}b`)).toBe('\x1b[31ma\x1b[33mx\x1b[39mb\x1b[39m');
	});
});

describe('noop entrypoint', () => {
	test('returns plain text for all formatters', () => {
		expect(noop.red('x')).toBe('x');
		expect(noop.bold('x')).toBe('x');
		expect(noop.bgRed('x')).toBe('x');
		expect(noop.red(0)).toBe('0');
	});
});

describe('auto entrypoint', () => {
	test('named export matches default object formatter', () => {
		expect(red('sample')).toBe(auto.red('sample'));
	});

	test('detection routes to raw or noop behavior', () => {
		const expected = isColorSupported ? raw.red('x') : noop.red('x');
		expect(auto.red('x')).toBe(expected);
	});
});

describe('safe entrypoint', () => {
	test('exports template formatter palette', () => {
		const names: (keyof TemplatePalette)[] = formatterNames;
		for (const name of names) {
			expect(typeof safe[name]).toBe('function');
		}
	});

	test('reopens style around interpolations when colors enabled', () => {
		const nested = safe.red`Error ${safe.yellow`42`}!`;
		if (!isSafeColorSupported) {
			expect(nested).toBe('Error 42!');
			return;
		}

		expect(nested).toBe('\x1b[31mError \x1b[33m42\x1b[39m\x1b[31m!\x1b[39m');
	});
});

describe('rope entrypoint', () => {
	test('renders nested composition without close-code scanning', () => {
		const colored = createRope(true);
		const value = colored.red(colored.concat('a', colored.yellow('x'), 'b'));
		expect(colored.render(value)).toBe('\x1b[31ma\x1b[33mx\x1b[39m\x1b[31mb\x1b[39m');
	});

	test('handles shared modifier close boundaries', () => {
		const colored = createRope(true);
		const value = colored.bold(colored.concat('a', colored.dim('x'), 'b'));
		expect(colored.render(value)).toBe('\x1b[1ma\x1b[2mx\x1b[22m\x1b[1mb\x1b[22m');
	});

	test('respects explicit disabled mode', () => {
		const disabled = createRope(false);
		const value = disabled.red(disabled.concat('a', disabled.yellow('x'), 'b'));
		expect(disabled.render(value)).toBe('axb');
	});

	test('exports default rope palette', () => {
		expect(typeof rope.red).toBe('function');
		expect(typeof rope.render).toBe('function');
		expect(typeof rope.concat).toBe('function');
	});
});

describe('palette surface', () => {
	test('all formatter names exist in raw/noop/auto default objects', () => {
		for (const name of formatterNames) {
			expect(typeof raw[name]).toBe('function');
			expect(typeof noop[name]).toBe('function');
			expect(typeof auto[name]).toBe('function');
		}
	});
});
