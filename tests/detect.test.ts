import { describe, expect, test } from 'bun:test';
import { detectColorSupportFor, detectHyperlinkSupportFor, type DetectionContext } from '#internal/detect';

const context = (overrides: Partial<DetectionContext> = {}): DetectionContext => ({
	argv: [],
	env: {},
	isTTY: false,
	platform: 'linux',
	...overrides,
});

describe('detectColorSupport precedence', () => {
	test('FORCE_COLOR beats NO_COLOR', () => {
		expect(detectColorSupportFor(context({ env: { FORCE_COLOR: '1', NO_COLOR: '1' } }))).toBe(true);
	});

	test('NO_COLOR disables when not forced', () => {
		expect(detectColorSupportFor(context({ env: { CI: 'true', NO_COLOR: '1' } }))).toBe(false);
	});

	test('CI enables', () => {
		expect(detectColorSupportFor(context({ env: { CI: 'true' } }))).toBe(true);
	});

	test('NO_COLOR beats CI', () => {
		expect(detectColorSupportFor(context({ env: { CI: 'true', NO_COLOR: '1' } }))).toBe(false);
	});

	test('empty FORCE_COLOR does not force', () => {
		expect(detectColorSupportFor(context({ env: { FORCE_COLOR: '', NO_COLOR: '1' } }))).toBe(false);
	});

	test('TTY enables', () => {
		expect(detectColorSupportFor(context({ isTTY: true }))).toBe(true);
	});

	test('non-TTY disables', () => {
		expect(detectColorSupportFor(context({ isTTY: false }))).toBe(false);
	});

	test('dumb terminal disables TTY', () => {
		expect(detectColorSupportFor(context({ env: { TERM: 'dumb' }, isTTY: true }))).toBe(false);
	});
});

describe('detectHyperlinkSupport precedence', () => {
	test('NO_HYPERLINKS beats FORCE_HYPERLINKS', () => {
		expect(
			detectHyperlinkSupportFor(context({ env: { FORCE_HYPERLINKS: '1', NO_HYPERLINKS: '1' } })),
		).toBe(false);
	});

	test('FORCE_HYPERLINKS enables when not disabled', () => {
		expect(detectHyperlinkSupportFor(context({ env: { FORCE_HYPERLINKS: '1' } }))).toBe(true);
	});

	test('NO_HYPERLINKS disables', () => {
		expect(detectHyperlinkSupportFor(context({ env: { NO_HYPERLINKS: '1' } }))).toBe(false);
	});

	test('empty NO_HYPERLINKS does not disable', () => {
		expect(
			detectHyperlinkSupportFor(context({ env: { FORCE_HYPERLINKS: '1', NO_HYPERLINKS: '' } })),
		).toBe(true);
	});

	test('empty FORCE_HYPERLINKS does not force', () => {
		expect(detectHyperlinkSupportFor(context({ env: { FORCE_HYPERLINKS: '' } }))).toBe(false);
	});

	test('is independent of color signals', () => {
		const ctx = context({ env: { FORCE_COLOR: '1', NO_HYPERLINKS: '1' } });
		expect(detectColorSupportFor(ctx)).toBe(true);
		expect(detectHyperlinkSupportFor(ctx)).toBe(false);
	});

	test('TTY enables', () => {
		expect(detectHyperlinkSupportFor(context({ isTTY: true }))).toBe(true);
	});

	test('non-TTY disables', () => {
		expect(detectHyperlinkSupportFor(context({ isTTY: false }))).toBe(false);
	});

	test('dumb terminal disables TTY', () => {
		expect(detectHyperlinkSupportFor(context({ env: { TERM: 'dumb' }, isTTY: true }))).toBe(false);
	});
});
