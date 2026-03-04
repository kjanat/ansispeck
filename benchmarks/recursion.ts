import { bench, run, summary } from 'mitata';

import ansispeck from '#dist/ansispeck';
import auto from '#dist/ansispeck/auto';
import noop from '#dist/ansispeck/noop';
import raw from '#dist/ansispeck/raw';
import rope from '#dist/ansispeck/rope';
import safe from '#dist/ansispeck/safe';
import ansi from 'ansi-colors';
import chalk from 'chalk';
import * as colorette from 'colorette';
import kleur from 'kleur';
import * as kleurColors from 'kleur/colors';
import picocolors from 'picocolors';

const DEFAULT_COUNT = 10_000;
const input = 'lorem ipsum dolor sit amet';

const repeatChunk = (chunk: ReturnType<typeof rope.red>, count: number): ReturnType<typeof rope.red> => {
	let remaining = count;
	let output = rope.text('');
	let power = chunk;

	while (remaining > 0) {
		if ((remaining & 1) === 1) output = rope.concat(output, power);
		remaining >>= 1;
		if (remaining > 0) power = rope.concat(power, power);
	}

	return output;
};

export function register({ count = DEFAULT_COUNT }: { count?: number } = {}): void {
	summary(() => {
		bench('ansispeck', () => {
			return ansispeck.blue(ansispeck.red(input).repeat(count));
		});
		bench('ansispeck/auto', () => {
			return auto.blue(auto.red(input).repeat(count));
		});
		bench('ansispeck/raw', () => {
			return raw.blue(raw.red(input).repeat(count));
		});
		bench('ansispeck/noop', () => {
			return noop.blue(noop.red(input).repeat(count));
		});
		bench('ansispeck/safe', () => {
			return safe.blue`${safe.red`${input}`.repeat(count)}`;
		});
		bench('ansispeck/rope', () => {
			return rope.render(rope.blue(repeatChunk(rope.red(input), count)));
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
