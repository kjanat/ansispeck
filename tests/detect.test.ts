import { detectColorSupport } from '#internal/detect';
import { env } from 'bun';
import { afterEach, beforeEach, describe, expect, test } from 'bun:test';

const KEYS = ['FORCE_COLOR', 'NO_COLOR', 'CI', 'TERM'];
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
		env.FORCE_COLOR = '1';
		env.NO_COLOR = '1';
		expect(detectColorSupport()).toBe(true);
	});

	test('NO_COLOR disables when not forced', () => {
		env.NO_COLOR = '1';
		env.CI = 'true';
		expect(detectColorSupport()).toBe(false);
	});

	test('CI enables', () => {
		env.CI = 'true';
		expect(detectColorSupport()).toBe(true);
	});

	test('NO_COLOR beats CI', () => {
		env.NO_COLOR = '1';
		env.CI = 'true';
		expect(detectColorSupport()).toBe(false);
	});

	test('empty FORCE_COLOR does not force', () => {
		env.FORCE_COLOR = '';
		env.NO_COLOR = '1';
		expect(detectColorSupport()).toBe(false);
	});
});
