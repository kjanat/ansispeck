import { bench, do_not_optimize, run, summary } from 'mitata';

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

interface Counter {
	value: number;
}

const nextInput = (counter: Counter): string => {
	counter.value += 1;
	return `${input}${counter.value}`;
};

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
	const ansispeckCounter: Counter = { value: 0 };
	const autoCounter: Counter = { value: 0 };
	const rawCounter: Counter = { value: 0 };
	const noopCounter: Counter = { value: 0 };
	const safeCounter: Counter = { value: 0 };
	const ropeCounter: Counter = { value: 0 };
	const picocolorsCounter: Counter = { value: 0 };
	const coloretteCounter: Counter = { value: 0 };
	const kleurCounter: Counter = { value: 0 };
	const kleurColorsCounter: Counter = { value: 0 };
	const chalkCounter: Counter = { value: 0 };
	const ansiCounter: Counter = { value: 0 };

	let sink = '';

	summary(() => {
		bench('ansispeck', () => {
			sink = ansispeck.blue(ansispeck.red(nextInput(ansispeckCounter)).repeat(count));
			do_not_optimize(sink);
		});
		bench('ansispeck/auto', () => {
			sink = auto.blue(auto.red(nextInput(autoCounter)).repeat(count));
			do_not_optimize(sink);
		});
		bench('ansispeck/raw', () => {
			sink = raw.blue(raw.red(nextInput(rawCounter)).repeat(count));
			do_not_optimize(sink);
		});
		bench('ansispeck/noop', () => {
			sink = noop.blue(noop.red(nextInput(noopCounter)).repeat(count));
			do_not_optimize(sink);
		});
		bench('ansispeck/safe', () => {
			const source = nextInput(safeCounter);
			sink = safe.blue`${safe.red`${source}`.repeat(count)}`;
			do_not_optimize(sink);
		});
		bench('ansispeck/rope', () => {
			sink = rope.render(rope.blue(repeatChunk(rope.red(nextInput(ropeCounter)), count)));
			do_not_optimize(sink);
		});
		bench('picocolors', () => {
			sink = picocolors.blue(picocolors.red(nextInput(picocolorsCounter)).repeat(count));
			do_not_optimize(sink);
		});
		bench('colorette', () => {
			sink = colorette.blue(colorette.red(nextInput(coloretteCounter)).repeat(count));
			do_not_optimize(sink);
		});
		bench('kleur', () => {
			sink = kleur.blue(kleur.red(nextInput(kleurCounter)).repeat(count));
			do_not_optimize(sink);
		});
		bench('kleur/colors', () => {
			sink = kleurColors.blue(kleurColors.red(nextInput(kleurColorsCounter)).repeat(count));
			do_not_optimize(sink);
		});
		bench('chalk', () => {
			sink = chalk.blue(chalk.red(nextInput(chalkCounter)).repeat(count));
			do_not_optimize(sink);
		});
		bench('ansi-colors', () => {
			sink = ansi.blue(ansi.red(nextInput(ansiCounter)).repeat(count));
			do_not_optimize(sink);
		});
	});
}

if (import.meta.main) {
	register();
	await run();
}
