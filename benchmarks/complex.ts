import { bench, do_not_optimize, run, summary } from 'mitata';

import ansi from 'ansi-colors';
import chalk from 'chalk';
import * as colorette from 'colorette';
import kleur from 'kleur';
import * as kleurColors from 'kleur/colors';
import picocolors from 'picocolors';
import femtocolors from '../dist/index.js';

const DEFAULT_COUNT = 1;

export function register({ count = DEFAULT_COUNT } = {}): void {
	let n = 0;
	let sink = '';
	summary(() => {
		bench('femtocolors', () => {
			for (let i = 0; i < count; i++) {
				sink = femtocolors.red('.')
					+ femtocolors.yellow('.')
					+ femtocolors.green('.')
					+ femtocolors.bgRed(femtocolors.black(' ERROR '))
					+ femtocolors.red(
						' Add plugin '
							+ femtocolors.yellow('name')
							+ ' to use time limit with '
							+ femtocolors.yellow(`${++n}`),
					);
			}
			do_not_optimize(sink);
		});

		bench('picocolors', () => {
			for (let i = 0; i < count; i++) {
				sink = picocolors.red('.')
					+ picocolors.yellow('.')
					+ picocolors.green('.')
					+ picocolors.bgRed(picocolors.black(' ERROR '))
					+ picocolors.red(
						' Add plugin '
							+ picocolors.yellow('name')
							+ ' to use time limit with '
							+ picocolors.yellow(`${++n}`),
					);
			}
			do_not_optimize(sink);
		});

		bench('colorette', () => {
			for (let i = 0; i < count; i++) {
				sink = colorette.red('.')
					+ colorette.yellow('.')
					+ colorette.green('.')
					+ colorette.bgRed(colorette.black(' ERROR '))
					+ colorette.red(
						' Add plugin '
							+ colorette.yellow('name')
							+ ' to use time limit with '
							+ colorette.yellow(`${++n}`),
					);
			}
			do_not_optimize(sink);
		});

		bench('kleur', () => {
			for (let i = 0; i < count; i++) {
				sink = kleur.red('.')
					+ kleur.yellow('.')
					+ kleur.green('.')
					+ kleur.bgRed(kleur.black(' ERROR '))
					+ kleur.red(
						' Add plugin ' + kleur.yellow('name') + ' to use time limit with ' + kleur.yellow(`${++n}`),
					);
			}
			do_not_optimize(sink);
		});

		bench('kleur/colors', () => {
			for (let i = 0; i < count; i++) {
				sink = kleurColors.red('.')
					+ kleurColors.yellow('.')
					+ kleurColors.green('.')
					+ kleurColors.bgRed(kleurColors.black(' ERROR '))
					+ kleurColors.red(
						' Add plugin '
							+ kleurColors.yellow('name')
							+ ' to use time limit with '
							+ kleurColors.yellow(`${++n}`),
					);
			}
			do_not_optimize(sink);
		});

		bench('chalk', () => {
			for (let i = 0; i < count; i++) {
				sink = chalk.red('.')
					+ chalk.yellow('.')
					+ chalk.green('.')
					+ chalk.bgRed(chalk.black(' ERROR '))
					+ chalk.red(
						' Add plugin ' + chalk.yellow('name') + ' to use time limit with ' + chalk.yellow(`${++n}`),
					);
			}
			do_not_optimize(sink);
		});

		bench('ansi-colors', () => {
			for (let i = 0; i < count; i++) {
				sink = ansi.red('.')
					+ ansi.yellow('.')
					+ ansi.green('.')
					+ ansi.bgRed(ansi.black(' ERROR '))
					+ ansi.red(
						' Add plugin ' + ansi.yellow('name') + ' to use time limit with ' + ansi.yellow(`${++n}`),
					);
			}
			do_not_optimize(sink);
		});
	});
}

if (import.meta.main) {
	register();
	await run();
}
