// deno-lint-ignore-file no-sloppy-imports
import ansi from 'ansi-colors';
import chalk from 'chalk';
import * as colorette from 'colorette';
import kleur from 'kleur';
import * as kleurColors from 'kleur/colors';
import { bench, boxplot, do_not_optimize, run } from 'mitata';
import picocolors from 'picocolors';
import ansispeck from '#ansispeck-dist';
import auto from '#ansispeck-dist/auto';
import noop from '#ansispeck-dist/noop';
import raw from '#ansispeck-dist/raw';
import rope from '#ansispeck-dist/rope';
import safe from '#ansispeck-dist/safe';

const DEFAULT_COUNT = 1;

export function register({ count = DEFAULT_COUNT }: { count?: number } = {}): void {
	let n = 0;
	let sink = '';
	boxplot(() => {
		bench('ansispeck', () => {
			for (let i = 0; i < count; i++) sink = ansispeck.red(`Add plugin to use time limit ${++n}`);
			do_not_optimize(sink);
		});
		bench('ansispeck/auto', () => {
			for (let i = 0; i < count; i++) sink = auto.red(`Add plugin to use time limit ${++n}`);
			do_not_optimize(sink);
		});
		bench('ansispeck/raw', () => {
			for (let i = 0; i < count; i++) sink = raw.red(`Add plugin to use time limit ${++n}`);
			do_not_optimize(sink);
		});
		bench('ansispeck/safe', () => {
			for (let i = 0; i < count; i++) sink = safe.red`Add plugin to use time limit ${++n}`;
			do_not_optimize(sink);
		});
		bench('ansispeck/rope', () => {
			for (let i = 0; i < count; i++) sink = rope.render(rope.red(`Add plugin to use time limit ${++n}`));
			do_not_optimize(sink);
		});
		bench('ansispeck/noop', () => {
			for (let i = 0; i < count; i++) sink = noop.red(`Add plugin to use time limit ${++n}`);
			do_not_optimize(sink);
		});
		bench('picocolors', () => {
			for (let i = 0; i < count; i++) sink = picocolors.red(`Add plugin to use time limit ${++n}`);
			do_not_optimize(sink);
		});
		bench('colorette', () => {
			for (let i = 0; i < count; i++) sink = colorette.red(`Add plugin to use time limit ${++n}`);
			do_not_optimize(sink);
		});
		bench('kleur', () => {
			for (let i = 0; i < count; i++) sink = kleur.red(`Add plugin to use time limit ${++n}`);
			do_not_optimize(sink);
		});
		bench('kleur/colors', () => {
			for (let i = 0; i < count; i++) sink = kleurColors.red(`Add plugin to use time limit ${++n}`);
			do_not_optimize(sink);
		});
		bench('chalk', () => {
			for (let i = 0; i < count; i++) sink = chalk.red(`Add plugin to use time limit ${++n}`);
			do_not_optimize(sink);
		});
		bench('ansi-colors', () => {
			for (let i = 0; i < count; i++) sink = ansi.red(`Add plugin to use time limit ${++n}`);
			do_not_optimize(sink);
		});
	});
}

if (import.meta.main) {
	register();
	await run();
}
