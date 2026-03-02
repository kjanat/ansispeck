import { bench, boxplot, run } from 'mitata';

import ansi from 'ansi-colors';
import chalk from 'chalk';
import * as colorette from 'colorette';
import kleur from 'kleur';
import * as kleurColors from 'kleur/colors';
import picocolors from 'picocolors';
import femtocolors from '../dist/index.mjs';

const DEFAULT_COUNT = 1;

let n = 0;

export function register({ count = DEFAULT_COUNT } = {}): void {
	boxplot(() => {
		bench('femtocolors', () => {
			for (let i = 0; i < count; i++) femtocolors.red(`Add plugin to use time limit ${++n}`);
		});
		bench('picocolors', () => {
			for (let i = 0; i < count; i++) picocolors.red(`Add plugin to use time limit ${++n}`);
		});
		bench('colorette', () => {
			for (let i = 0; i < count; i++) colorette.red(`Add plugin to use time limit ${++n}`);
		});
		bench('kleur', () => {
			for (let i = 0; i < count; i++) kleur.red(`Add plugin to use time limit ${++n}`);
		});
		bench('kleur/colors', () => {
			for (let i = 0; i < count; i++) kleurColors.red(`Add plugin to use time limit ${++n}`);
		});
		bench('chalk', () => {
			for (let i = 0; i < count; i++) chalk.red(`Add plugin to use time limit ${++n}`);
		});
		bench('ansi-colors', () => {
			for (let i = 0; i < count; i++) ansi.red(`Add plugin to use time limit ${++n}`);
		});
	});
}

if (import.meta.main) {
	register();
	await run();
}
