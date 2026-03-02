import { describe, expect, test } from 'bun:test';
import colors, { type Colors, createColors, isColorSupported } from '../src/index.ts';

describe('createColors', () => {
	const enabled = createColors(true);
	const disabled = createColors(false);

	test('enabled flag reflects argument', () => {
		expect(enabled.isColorSupported).toBe(true);
		expect(disabled.isColorSupported).toBe(false);
	});

	test('disabled returns identity', () => {
		expect(disabled.red('hello')).toBe('hello');
		expect(disabled.bold('hello')).toBe('hello');
		expect(disabled.bgRed('hello')).toBe('hello');
	});

	test('disabled coerces non-string input', () => {
		expect(disabled.red(42)).toBe('42');
		expect(disabled.red(null)).toBe('null');
		expect(disabled.red(undefined)).toBe('undefined');
	});
});

describe('formatters (enabled)', () => {
	const c = createColors(true);

	test('wraps string in ANSI codes', () => {
		expect(c.red('err')).toBe('\x1b[31merr\x1b[39m');
		expect(c.bold('hi')).toBe('\x1b[1mhi\x1b[22m');
		expect(c.bgRed('bg')).toBe('\x1b[41mbg\x1b[49m');
	});

	test('coerces non-string input', () => {
		expect(c.red(0)).toBe('\x1b[31m0\x1b[39m');
		expect(c.red(null)).toBe('\x1b[31mnull\x1b[39m');
		expect(c.red(undefined)).toBe('\x1b[31mundefined\x1b[39m');
	});

	test('handles empty string', () => {
		expect(c.red('')).toBe('\x1b[31m\x1b[39m');
	});

	test('handles nested close codes (replaceClose)', () => {
		// Close code must appear after open.length offset to trigger replacement
		const result = c.red(`hello\x1b[39mworld`);
		expect(result).toBe('\x1b[31mhello\x1b[31mworld\x1b[39m');
	});

	test('bold/dim use compound replace for nesting', () => {
		const result = c.bold(`hello\x1b[22mworld`);
		expect(result).toBe('\x1b[1mhello\x1b[22m\x1b[1mworld\x1b[22m');
	});
});

describe('all formatters exist', () => {
	const c = createColors(true);
	const names: (keyof Colors)[] = [
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

	for (const name of names) {
		test(`${name} is a function`, () => {
			expect(typeof c[name]).toBe('function');
		});
	}
});

describe('exports', () => {
	test('isColorSupported is boolean', () => {
		expect(typeof isColorSupported).toBe('boolean');
	});
});

describe('default export', () => {
	test('is a Colors object', () => {
		expect(typeof colors.red).toBe('function');
		expect(typeof colors.isColorSupported).toBe('boolean');
	});
});

describe('composition', () => {
	const c = createColors(true);

	test('styles compose correctly', () => {
		const result = c.bold(c.red('error'));
		expect(result).toBe('\x1b[1m\x1b[31merror\x1b[39m\x1b[22m');
	});
});
