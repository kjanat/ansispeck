import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import { env } from 'bun';
import { detectColorSupport, detectHyperlinkSupport } from '#internal/detect';

const KEYS = ['FORCE_COLOR', 'NO_COLOR', 'CI', 'TERM', 'NO_HYPERLINKS', 'FORCE_HYPERLINKS'];
const saved: Record<string, string | undefined> = {};

beforeEach(() => {
	for (const key of KEYS) {
		saved[key] = process.env[key];
		delete process.env[key];
	}
});

afterEach(() => {
	for (const key of KEYS) {
		const value = saved[key];
		if (value === undefined) delete process.env[key];
		else process.env[key] = value;
	}
});

describe('detectColorSupport precedence', () => {
	test('FORCE_COLOR beats NO_COLOR', () => {
		env['FORCE_COLOR'] = '1';
		env['NO_COLOR'] = '1';
		expect(detectColorSupport()).toBe(true);
	});

	test('NO_COLOR disables when not forced', () => {
		env['NO_COLOR'] = '1';
		env['CI'] = 'true';
		expect(detectColorSupport()).toBe(false);
	});

	test('CI enables', () => {
		env['CI'] = 'true';
		expect(detectColorSupport()).toBe(true);
	});

	test('NO_COLOR beats CI', () => {
		env['NO_COLOR'] = '1';
		env['CI'] = 'true';
		expect(detectColorSupport()).toBe(false);
	});

	test('empty FORCE_COLOR does not force', () => {
		env['FORCE_COLOR'] = '';
		env['NO_COLOR'] = '1';
		expect(detectColorSupport()).toBe(false);
	});
});

describe('detectHyperlinkSupport precedence', () => {
	test('NO_HYPERLINKS beats FORCE_HYPERLINKS', () => {
		env['NO_HYPERLINKS'] = '1';
		env['FORCE_HYPERLINKS'] = '1';
		expect(detectHyperlinkSupport()).toBe(false);
	});

	test('FORCE_HYPERLINKS enables when not disabled', () => {
		env['FORCE_HYPERLINKS'] = '1';
		expect(detectHyperlinkSupport()).toBe(true);
	});

	test('NO_HYPERLINKS disables', () => {
		env['NO_HYPERLINKS'] = '1';
		expect(detectHyperlinkSupport()).toBe(false);
	});

	test('empty NO_HYPERLINKS does not disable', () => {
		env['NO_HYPERLINKS'] = '';
		env['FORCE_HYPERLINKS'] = '1';
		expect(detectHyperlinkSupport()).toBe(true);
	});

	test('empty FORCE_HYPERLINKS does not force', () => {
		env['FORCE_HYPERLINKS'] = '';
		expect(detectHyperlinkSupport()).toBe(false);
	});

	test('is independent of color signals', () => {
		env['FORCE_COLOR'] = '1';
		env['NO_HYPERLINKS'] = '1';
		expect(detectColorSupport()).toBe(true);
		expect(detectHyperlinkSupport()).toBe(false);
	});
});
