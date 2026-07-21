// deno-lint-ignore-file no-sloppy-imports
import ansi from 'ansi-colors';
import chalk from 'chalk';
import * as colorette from 'colorette';
import kleur from 'kleur';
import * as kleurColors from 'kleur/colors';
import { bench, do_not_optimize, run, summary } from 'mitata';
import picocolors from 'picocolors';
import ansispeck from '#ansispeck-dist';
import auto from '#ansispeck-dist/auto';
import noop from '#ansispeck-dist/noop';
import raw from '#ansispeck-dist/raw';
import type { Chunk } from '#ansispeck-dist/rope';
import rope from '#ansispeck-dist/rope';
import safe from '#ansispeck-dist/safe';

const DEFAULT_COUNT = 10_000;

interface Counter {
	value: number;
}

/** Fresh input every iteration so the styled string can never be constant-folded. */
function nextInput(counter: Counter): string {
	counter.value++;
	return 'lorem ipsum dolor sit amet' + counter.value;
}

/** Repeat a chunk `count` times by binary doubling (O(log count) concat nodes). */
function repeatChunk(chunk: Chunk, count: number): Chunk {
	let result: Chunk | undefined;
	let power = chunk;
	let remaining = count;
	while (remaining > 0) {
		if ((remaining & 1) === 1) result = result === undefined ? power : rope.concat(result, power);
		remaining >>>= 1;
		if (remaining > 0) power = rope.concat(power, power);
	}
	return result ?? rope.text('');
}

export function register({ count = DEFAULT_COUNT }: { count?: number } = {}): void {
	let sink = '';
	summary(() => {
		const ansispeckCounter: Counter = { value: 0 };
		bench('ansispeck', () => {
			sink = ansispeck.blue(ansispeck.red(nextInput(ansispeckCounter)).repeat(count));
			do_not_optimize(sink);
		});
		const autoCounter: Counter = { value: 0 };
		bench('ansispeck/auto', () => {
			sink = auto.blue(auto.red(nextInput(autoCounter)).repeat(count));
			do_not_optimize(sink);
		});
		const rawCounter: Counter = { value: 0 };
		bench('ansispeck/raw', () => {
			sink = raw.blue(raw.red(nextInput(rawCounter)).repeat(count));
			do_not_optimize(sink);
		});
		const safeCounter: Counter = { value: 0 };
		bench('ansispeck/safe', () => {
			const source = nextInput(safeCounter);
			sink = safe.blue`${safe.red`${source}`.repeat(count)}`;
			do_not_optimize(sink);
		});
		const ropeCounter: Counter = { value: 0 };
		bench('ansispeck/rope', () => {
			sink = rope.render(rope.blue(repeatChunk(rope.red(nextInput(ropeCounter)), count)));
			do_not_optimize(sink);
		});
		const noopCounter: Counter = { value: 0 };
		bench('ansispeck/noop', () => {
			sink = noop.blue(noop.red(nextInput(noopCounter)).repeat(count));
			do_not_optimize(sink);
		});
		const picocolorsCounter: Counter = { value: 0 };
		bench('picocolors', () => {
			sink = picocolors.blue(picocolors.red(nextInput(picocolorsCounter)).repeat(count));
			do_not_optimize(sink);
		});
		const coloretteCounter: Counter = { value: 0 };
		bench('colorette', () => {
			sink = colorette.blue(colorette.red(nextInput(coloretteCounter)).repeat(count));
			do_not_optimize(sink);
		});
		const kleurCounter: Counter = { value: 0 };
		bench('kleur', () => {
			sink = kleur.blue(kleur.red(nextInput(kleurCounter)).repeat(count));
			do_not_optimize(sink);
		});
		const kleurColorsCounter: Counter = { value: 0 };
		bench('kleur/colors', () => {
			sink = kleurColors.blue(kleurColors.red(nextInput(kleurColorsCounter)).repeat(count));
			do_not_optimize(sink);
		});
		const chalkCounter: Counter = { value: 0 };
		bench('chalk', () => {
			sink = chalk.blue(chalk.red(nextInput(chalkCounter)).repeat(count));
			do_not_optimize(sink);
		});
		const ansiCounter: Counter = { value: 0 };
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
