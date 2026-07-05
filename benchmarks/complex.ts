import { bench, do_not_optimize, run, summary } from 'mitata';

import ansispeck from '#ansispeck-dist';
import auto from '#ansispeck-dist/auto';
import noop from '#ansispeck-dist/noop';
import raw from '#ansispeck-dist/raw';
import rope from '#ansispeck-dist/rope';
import safe from '#ansispeck-dist/safe';
import ansi from 'ansi-colors';
import chalk from 'chalk';
import * as colorette from 'colorette';
import kleur from 'kleur';
import * as kleurColors from 'kleur/colors';
import picocolors from 'picocolors';

const DEFAULT_COUNT = 1;

export function register({ count = DEFAULT_COUNT }: { count?: number } = {}): void {
	let n = 0;
	let sink = '';
	summary(() => {
		bench('ansispeck', () => {
			for (let i = 0; i < count; i++) {
				sink = ansispeck.red('.')
					+ ansispeck.yellow('.')
					+ ansispeck.green('.')
					+ ansispeck.bgRed(ansispeck.black(' ERROR '))
					+ ansispeck.red(
						' Add plugin ' + ansispeck.yellow('name') + ' to use time limit with ' + ansispeck.yellow(`${++n}`),
					);
			}
			do_not_optimize(sink);
		});

		bench('ansispeck/auto', () => {
			for (let i = 0; i < count; i++) {
				sink = auto.red('.')
					+ auto.yellow('.')
					+ auto.green('.')
					+ auto.bgRed(auto.black(' ERROR '))
					+ auto.red(' Add plugin ' + auto.yellow('name') + ' to use time limit with ' + auto.yellow(`${++n}`));
			}
			do_not_optimize(sink);
		});

		bench('ansispeck/raw', () => {
			for (let i = 0; i < count; i++) {
				sink = raw.red('.')
					+ raw.yellow('.')
					+ raw.green('.')
					+ raw.bgRed(raw.black(' ERROR '))
					+ raw.red(' Add plugin ' + raw.yellow('name') + ' to use time limit with ' + raw.yellow(`${++n}`));
			}
			do_not_optimize(sink);
		});

		bench('ansispeck/safe', () => {
			for (let i = 0; i < count; i++) {
				sink = safe.red`.`
					+ safe.yellow`.`
					+ safe.green`.`
					+ safe.bgRed`${safe.black` ERROR `}`
					+ safe.red` Add plugin ${safe.yellow`name`} to use time limit with ${safe.yellow`${++n}`}`;
			}
			do_not_optimize(sink);
		});

		bench('ansispeck/rope', () => {
			for (let i = 0; i < count; i++) {
				sink = rope.render(
					rope.concat(
						rope.red('.'),
						rope.yellow('.'),
						rope.green('.'),
						rope.bgRed(rope.black(' ERROR ')),
						rope.red(
							rope.concat(' Add plugin ', rope.yellow('name'), ' to use time limit with ', rope.yellow(`${++n}`)),
						),
					),
				);
			}
			do_not_optimize(sink);
		});

		bench('ansispeck/noop', () => {
			for (let i = 0; i < count; i++) {
				sink = noop.red('.')
					+ noop.yellow('.')
					+ noop.green('.')
					+ noop.bgRed(noop.black(' ERROR '))
					+ noop.red(' Add plugin ' + noop.yellow('name') + ' to use time limit with ' + noop.yellow(`${++n}`));
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
						' Add plugin ' + picocolors.yellow('name') + ' to use time limit with ' + picocolors.yellow(`${++n}`),
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
						' Add plugin ' + colorette.yellow('name') + ' to use time limit with ' + colorette.yellow(`${++n}`),
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
					+ kleur.red(' Add plugin ' + kleur.yellow('name') + ' to use time limit with ' + kleur.yellow(`${++n}`));
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
						' Add plugin ' + kleurColors.yellow('name') + ' to use time limit with ' + kleurColors.yellow(`${++n}`),
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
					+ chalk.red(' Add plugin ' + chalk.yellow('name') + ' to use time limit with ' + chalk.yellow(`${++n}`));
			}
			do_not_optimize(sink);
		});

		bench('ansi-colors', () => {
			for (let i = 0; i < count; i++) {
				sink = ansi.red('.')
					+ ansi.yellow('.')
					+ ansi.green('.')
					+ ansi.bgRed(ansi.black(' ERROR '))
					+ ansi.red(' Add plugin ' + ansi.yellow('name') + ' to use time limit with ' + ansi.yellow(`${++n}`));
			}
			do_not_optimize(sink);
		});
	});
}

if (import.meta.main) {
	register();
	await run();
}
