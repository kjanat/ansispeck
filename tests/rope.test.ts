import { describe, expect, test } from 'bun:test';
import rope, { concat, createRope, render, text } from '#ansispeck/rope';

describe('rope', () => {
	const r = createRope(true);
	const d = createRope(false);

	test('renders a styled text chunk', () => {
		expect(r.render(r.red('err'))).toBe('\x1b[31merr\x1b[39m');
	});

	test('concat composes chunks and plain values', () => {
		expect(r.render(r.concat('a', r.red('b'), 'c'))).toBe('a\x1b[31mb\x1b[39mc');
	});

	test('re-opens enclosing style sharing a close code', () => {
		const inner = r.concat('a', r.blue('b'), 'c');
		expect(r.render(r.red(inner))).toBe('\x1b[31ma\x1b[34mb\x1b[39m\x1b[31mc\x1b[39m');
	});

	test('reset re-opens all enclosing styles', () => {
		const out = r.render(r.bold(r.concat('a', r.reset('b'), 'c')));
		expect(out).toBe('\x1b[1ma\x1b[0mb\x1b[0m\x1b[1mc\x1b[22m');
	});

	test('different close codes do not re-open', () => {
		const out = r.render(r.bold(r.concat('a', r.red('b'), 'c')));
		expect(out).toBe('\x1b[1ma\x1b[31mb\x1b[39mc\x1b[22m');
	});

	test('deep left-leaning tree renders without recursion overflow', () => {
		let chunk = text('0');
		for (let i = 0; i < 50_000; i++) chunk = concat(chunk, 'x');
		const rendered = render(chunk);
		expect(rendered.length).toBe(50_001);
	});

	test('undefined inputs to concat are skipped', () => {
		expect(r.render(r.concat(undefined, 'a', undefined))).toBe('a');
	});

	test('factories produce chunk formatters', () => {
		expect(r.render(r.fg256(208)('x'))).toBe('\x1b[38;5;208mx\x1b[39m');
		expect(r.render(r.hex('#f80')('x'))).toBe('\x1b[38;2;255;136;0mx\x1b[39m');
	});

	test('disabled rope renders plain text', () => {
		expect(d.render(d.red(d.concat('a', d.blue('b'))))).toBe('ab');
	});

	test('render accepts plain values', () => {
		expect(render('plain')).toBe('plain');
		expect(render(42)).toBe('42');
	});

	test('exposes whitespace helpers', () => {
		expect(r.space(2)).toBe('  ');
		expect(r.tab(2)).toBe('\t\t');
		expect(r.render(r.concat('a', r.tab(), 'b'))).toBe('a\tb');
	});

	test('exposes grey as the gray alias', () => {
		expect(r.grey).toBe(r.gray);
	});

	test('default export reflects detection', () => {
		expect(typeof rope.isColorSupported).toBe('boolean');
		expect(typeof rope.render).toBe('function');
	});
});
