import index, { isColorSupported, isHyperlinkSupported } from '#ansispeck';
import noop from '#ansispeck/noop';
import raw from '#ansispeck/raw';
import { describe, expect, test } from 'bun:test';

describe('entrypoints', () => {
	test('raw always emits codes', () => {
		expect(raw.isColorSupported).toBe(true);
		expect(raw.red('x')).toBe('\x1b[31mx\x1b[39m');
	});

	test('raw always emits hyperlinks', () => {
		expect(raw.isHyperlinkSupported).toBe(true);
		expect(raw.link('https://example.com', 'docs')).toBe('\x1b]8;;https://example.com\x1b\\docs\x1b]8;;\x1b\\');
	});

	test('noop never emits hyperlinks', () => {
		expect(noop.isHyperlinkSupported).toBe(false);
	});

	test('index hyperlink support matches detection', () => {
		expect(index.isHyperlinkSupported).toBe(isHyperlinkSupported);
	});

	test('raw keeps nesting-safe close replacement', () => {
		expect(raw.red(raw.blue('in') + 'out')).toBe('\x1b[31m\x1b[34min\x1b[31mout\x1b[39m');
	});

	test('noop never emits codes', () => {
		expect(noop.isColorSupported).toBe(false);
		expect(noop.red('x')).toBe('x');
		expect(noop.link('https://example.com', 'docs')).toBe('docs');
		expect(noop.rgb(1, 2, 3)('x')).toBe('x');
	});

	test('index default matches detected support', () => {
		expect(index.isColorSupported).toBe(isColorSupported);
		const expected = isColorSupported ? '\x1b[31mx\x1b[39m' : 'x';
		expect(index.red('x')).toBe(expected);
	});

	test('palettes expose identical formatter names', () => {
		const rawKeys = Object.keys(raw).sort();
		expect(Object.keys(noop).sort()).toEqual(rawKeys);
		expect(Object.keys(index).sort()).toEqual(rawKeys);
	});
});
