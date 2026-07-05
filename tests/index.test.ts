import colors, { type Colors, createColors, isColorSupported, strip } from '#ansispeck';
import { describe, expect, test } from 'bun:test';

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
		const result = c.red(`hello\x1b[39mworld`);
		expect(result).toBe('\x1b[31mhello\x1b[31mworld\x1b[39m');
	});

	test('bare close in the scan-skip prefix is intentionally not replaced', () => {
		// A composed close is always preceded by its own open, so the scan
		// starts at min(open, close) length for speed (picocolors tradeoff).
		// Only a bare, uncomposed close this early goes unreplaced.
		const result = c.red(`\x1b[39mworld`);
		expect(result).toBe('\x1b[31m\x1b[39mworld\x1b[39m');
	});

	test('composed close right after open is still replaced (long truecolor open)', () => {
		const result = c.rgb(255, 136, 0)(c.red('in') + 'out');
		expect(result).toBe('\x1b[38;2;255;136;0m\x1b[31min\x1b[38;2;255;136;0mout\x1b[39m');
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
		'overline',
		'doubleUnderline',
		'blink',
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

describe('link', () => {
	const c = createColors(true);
	const d = createColors(false);

	test('wraps text in OSC 8 hyperlink', () => {
		expect(c.link('https://example.com', 'docs')).toBe('\x1b]8;;https://example.com\x1b\\docs\x1b]8;;\x1b\\');
	});

	test('text defaults to url', () => {
		expect(c.link('https://example.com')).toBe('\x1b]8;;https://example.com\x1b\\https://example.com\x1b]8;;\x1b\\');
	});

	test('accepts URL instance', () => {
		expect(c.link(new URL('https://example.com'), 'docs')).toBe('\x1b]8;;https://example.com/\x1b\\docs\x1b]8;;\x1b\\');
	});

	test('coerces non-string text', () => {
		expect(c.link('https://example.com', 42)).toBe('\x1b]8;;https://example.com\x1b\\42\x1b]8;;\x1b\\');
	});

	test('disabled returns plain text', () => {
		expect(d.link('https://example.com', 'docs')).toBe('docs');
		expect(d.link('https://example.com')).toBe('https://example.com');
	});

	test('template tag', () => {
		const id = 42;
		expect(c.link`https://example.com/issues/${id}`).toBe(
			'\x1b]8;;https://example.com/issues/42\x1b\\https://example.com/issues/42\x1b]8;;\x1b\\',
		);
	});

	test('template tag without interpolation', () => {
		expect(c.link`https://example.com`).toBe('\x1b]8;;https://example.com\x1b\\https://example.com\x1b]8;;\x1b\\');
	});

	test('template tag disabled returns url', () => {
		expect(d.link`https://example.com/${'a'}`).toBe('https://example.com/a');
	});
});

describe('extended modifiers', () => {
	const c = createColors(true);

	test('overline, doubleUnderline, blink', () => {
		expect(c.overline('x')).toBe('\x1b[53mx\x1b[55m');
		expect(c.doubleUnderline('x')).toBe('\x1b[21mx\x1b[24m');
		expect(c.blink('x')).toBe('\x1b[5mx\x1b[25m');
	});

	test('underline nests inside doubleUnderline (shared close 24)', () => {
		expect(c.doubleUnderline(c.underline('in') + 'out')).toBe('\x1b[21m\x1b[4min\x1b[21mout\x1b[24m');
	});
});

describe('256-color and truecolor', () => {
	const c = createColors(true);
	const d = createColors(false);

	test('fg256/bg256', () => {
		expect(c.fg256(208)('x')).toBe('\x1b[38;5;208mx\x1b[39m');
		expect(c.bg256(17)('x')).toBe('\x1b[48;5;17mx\x1b[49m');
	});

	test('rgb/bgRgb', () => {
		expect(c.rgb(255, 136, 0)('x')).toBe('\x1b[38;2;255;136;0mx\x1b[39m');
		expect(c.bgRgb(0, 0, 0)('x')).toBe('\x1b[48;2;0;0;0mx\x1b[49m');
	});

	test('hex/bgHex 6-digit', () => {
		expect(c.hex('#ff8800')('x')).toBe('\x1b[38;2;255;136;0mx\x1b[39m');
		expect(c.bgHex('#ff8800')('x')).toBe('\x1b[48;2;255;136;0mx\x1b[49m');
	});

	test('hex 3-digit expands', () => {
		expect(c.hex('#f80')('x')).toBe('\x1b[38;2;255;136;0mx\x1b[39m');
	});

	test('hex without # prefix', () => {
		expect(c.hex('ff8800')('x')).toBe('\x1b[38;2;255;136;0mx\x1b[39m');
	});

	test('nested named color close is replaced (long open)', () => {
		expect(c.rgb(255, 136, 0)(c.red('in') + 'out')).toBe(
			'\x1b[38;2;255;136;0m\x1b[31min\x1b[38;2;255;136;0mout\x1b[39m',
		);
	});

	test('disabled returns identity', () => {
		expect(d.fg256(208)('x')).toBe('x');
		expect(d.rgb(1, 2, 3)('x')).toBe('x');
		expect(d.hex('#f80')('x')).toBe('x');
	});
});

describe('strip', () => {
	const c = createColors(true);

	test('removes SGR codes', () => {
		expect(strip(c.bold(c.red('err')))).toBe('err');
	});

	test('removes truecolor codes', () => {
		expect(strip(c.rgb(255, 136, 0)('warn'))).toBe('warn');
	});

	test('removes OSC 8 links, keeps text', () => {
		expect(strip(c.link('https://example.com', 'docs'))).toBe('docs');
	});

	test('plain text untouched', () => {
		expect(strip('hello')).toBe('hello');
	});

	test('coerces non-string input', () => {
		expect(strip(42)).toBe('42');
		expect(strip(null)).toBe('null');
	});
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
