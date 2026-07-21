import { describe, expect, test } from 'bun:test';
import safe, { createSafeColors } from '#ansispeck/safe';

describe('safe template tags', () => {
	const s = createSafeColors(true);
	const d = createSafeColors(false);

	test('wraps a plain template', () => {
		expect(s.red`error`).toBe('\x1b[31merror\x1b[39m');
	});

	test('re-opens style after each interpolation', () => {
		const value = 'v';
		expect(s.red`a ${value} b`).toBe('\x1b[31ma v\x1b[31m b\x1b[39m');
	});

	test('interpolated close codes cannot leak the enclosing style', () => {
		const hostile = 'x\x1b[39m';
		const result = s.red`pre ${hostile} post`;
		// the re-opened \x1b[31m after the value restores red for " post"
		expect(result).toBe('\x1b[31mpre x\x1b[39m\x1b[31m post\x1b[39m');
	});

	test('nested tags compose', () => {
		expect(s.bold`b ${s.red`r`} b`).toBe('\x1b[1mb \x1b[31mr\x1b[39m\x1b[1m b\x1b[22m');
	});

	test('multiple interpolations', () => {
		expect(s.green`${1} and ${2}`).toBe('\x1b[32m1\x1b[32m and 2\x1b[39m');
	});

	test('disabled returns plain text', () => {
		expect(d.red`a ${'v'} b`).toBe('a v b');
	});

	test('factories produce template tags', () => {
		expect(s.fg256(208)`x`).toBe('\x1b[38;5;208mx\x1b[39m');
		expect(s.rgb(255, 136, 0)`x ${'y'}`).toBe('\x1b[38;2;255;136;0mx y\x1b[39m');
		expect(s.hex('#f80')`x`).toBe('\x1b[38;2;255;136;0mx\x1b[39m');
	});

	test('link works on the safe palette', () => {
		expect(s.link('https://example.com', 'docs')).toBe('\x1b]8;;https://example.com\x1b\\docs\x1b]8;;\x1b\\');
	});

	test('default export reflects detection', () => {
		expect(typeof safe.isColorSupported).toBe('boolean');
		expect(typeof safe.red).toBe('function');
	});

	test('exposes whitespace helpers', () => {
		expect(s.space(2)).toBe('  ');
		expect(s.tab(2)).toBe('\t\t');
	});
});
