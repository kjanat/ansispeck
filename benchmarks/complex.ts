import { bench, run, summary } from 'mitata';

import ansi from 'ansi-colors';
import chalk from 'chalk';
import * as colorette from 'colorette';
import kleur from 'kleur';
import * as kleurColors from 'kleur/colors';
import picocolors from 'picocolors';
import femtocolors from '../dist/index.mjs';

const DEFAULT_COUNT = 1;

export function register({ count = DEFAULT_COUNT } = {}): void {
	summary(() => {
		let index = 1e8;

		bench('femtocolors', () => {
			for (let i = 0; i < count; i++) {
				femtocolors.red('.')
					+ femtocolors.yellow('.')
					+ femtocolors.green('.')
					+ femtocolors.bgRed(femtocolors.black(' ERROR '))
					+ femtocolors.red(
						' Add plugin '
							+ femtocolors.yellow('name')
							+ ' to use time limit with '
							+ femtocolors.yellow(`${++index}`),
					);
			}
		});

		bench('picocolors', () => {
			for (let i = 0; i < count; i++) {
				picocolors.red('.')
					+ picocolors.yellow('.')
					+ picocolors.green('.')
					+ picocolors.bgRed(picocolors.black(' ERROR '))
					+ picocolors.red(
						' Add plugin '
							+ picocolors.yellow('name')
							+ ' to use time limit with '
							+ picocolors.yellow(`${++index}`),
					);
			}
		});

		bench('colorette', () => {
			for (let i = 0; i < count; i++) {
				colorette.red('.')
					+ colorette.yellow('.')
					+ colorette.green('.')
					+ colorette.bgRed(colorette.black(' ERROR '))
					+ colorette.red(
						' Add plugin '
							+ colorette.yellow('name')
							+ ' to use time limit with '
							+ colorette.yellow(`${++index}`),
					);
			}
		});

		bench('kleur', () => {
			for (let i = 0; i < count; i++) {
				kleur.red('.')
					+ kleur.yellow('.')
					+ kleur.green('.')
					+ kleur.bgRed(kleur.black(' ERROR '))
					+ kleur.red(
						' Add plugin ' + kleur.yellow('name') + ' to use time limit with ' + kleur.yellow(`${++index}`),
					);
			}
		});

		bench('kleur/colors', () => {
			for (let i = 0; i < count; i++) {
				kleurColors.red('.')
					+ kleurColors.yellow('.')
					+ kleurColors.green('.')
					+ kleurColors.bgRed(kleurColors.black(' ERROR '))
					+ kleurColors.red(
						' Add plugin '
							+ kleurColors.yellow('name')
							+ ' to use time limit with '
							+ kleurColors.yellow(`${++index}`),
					);
			}
		});

		bench('chalk', () => {
			for (let i = 0; i < count; i++) {
				chalk.red('.')
					+ chalk.yellow('.')
					+ chalk.green('.')
					+ chalk.bgRed(chalk.black(' ERROR '))
					+ chalk.red(
						' Add plugin ' + chalk.yellow('name') + ' to use time limit with ' + chalk.yellow(`${++index}`),
					);
			}
		});

		bench('ansi-colors', () => {
			for (let i = 0; i < count; i++) {
				ansi.red('.')
					+ ansi.yellow('.')
					+ ansi.green('.')
					+ ansi.bgRed(ansi.black(' ERROR '))
					+ ansi.red(
						' Add plugin ' + ansi.yellow('name') + ' to use time limit with ' + ansi.yellow(`${++index}`),
					);
			}
		});
	});
}

if (import.meta.main) {
	register();
	await run();
}
