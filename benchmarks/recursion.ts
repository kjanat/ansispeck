import { bench, run, summary } from 'mitata';

import ansi from 'ansi-colors';
import chalk from 'chalk';
import * as colorette from 'colorette';
import kleur from 'kleur';
import * as kleurColors from 'kleur/colors';
import picocolors from 'picocolors';
import femtocolors from '../dist/index.js';

const DEFAULT_COUNT = 10_000;
const input = 'lorem ipsum dolor sit amet';

export function register({ count = DEFAULT_COUNT } = {}): void {
	summary(() => {
		bench('femtocolors', () => {
			return femtocolors.blue(femtocolors.red(input).repeat(count));
		});
		bench('picocolors', () => {
			return picocolors.blue(picocolors.red(input).repeat(count));
		});
		bench('colorette', () => {
			return colorette.blue(colorette.red(input).repeat(count));
		});
		bench('kleur', () => {
			return kleur.blue(kleur.red(input).repeat(count));
		});
		bench('kleur/colors', () => {
			return kleurColors.blue(kleurColors.red(input).repeat(count));
		});
		bench('chalk', () => {
			return chalk.blue(chalk.red(input).repeat(count));
		});
		bench('ansi-colors', () => {
			return ansi.blue(ansi.red(input).repeat(count));
		});
	});
}

if (import.meta.main) {
	register();
	await run();
}
