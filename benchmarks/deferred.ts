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

const DEFAULT_LAYERS = 32;
const DEFAULT_REPEAT = 32;
const seed = 'pipeline segment lorem ipsum dolor sit amet ';

interface Counter {
	value: number;
}

type StringFormatter = (input: string) => string;
type RopeChunk = ReturnType<typeof rope.text>;
type RopeFormatter = (input: RopeChunk) => RopeChunk;

const nextInput = (counter: Counter, repeat: number): string => {
	counter.value += 1;
	return `${seed}${counter.value}`.repeat(repeat);
};

const applyStages = (input: string, stages: readonly StringFormatter[], layers: number): string => {
	if (stages.length === 0) {
		throw new Error('applyStages requires at least one formatter');
	}

	let output = input;
	let index = 0;
	while (index < layers) {
		const stage = stages[index % stages.length];
		if (stage === undefined) {
			throw new Error('applyStages got an undefined formatter');
		}
		output = stage(output);
		index += 1;
	}

	return output;
};

const buildRopeStages = (input: string, stages: readonly RopeFormatter[], layers: number): RopeChunk => {
	if (stages.length === 0) {
		throw new Error('buildRopeStages requires at least one formatter');
	}

	let output = rope.text(input);
	let index = 0;
	while (index < layers) {
		const stage = stages[index % stages.length];
		if (stage === undefined) {
			throw new Error('buildRopeStages got an undefined formatter');
		}
		output = stage(output);
		index += 1;
	}

	return output;
};

const ansispeckStages: readonly StringFormatter[] = [
	input => ansispeck.red(input),
	input => ansispeck.bold(input),
	input => ansispeck.bgBlue(input),
	input => ansispeck.yellow(input),
	input => ansispeck.underline(input),
	input => ansispeck.green(input),
];

const autoStages: readonly StringFormatter[] = [
	input => auto.red(input),
	input => auto.bold(input),
	input => auto.bgBlue(input),
	input => auto.yellow(input),
	input => auto.underline(input),
	input => auto.green(input),
];

const rawStages: readonly StringFormatter[] = [
	input => raw.red(input),
	input => raw.bold(input),
	input => raw.bgBlue(input),
	input => raw.yellow(input),
	input => raw.underline(input),
	input => raw.green(input),
];

const noopStages: readonly StringFormatter[] = [
	input => noop.red(input),
	input => noop.bold(input),
	input => noop.bgBlue(input),
	input => noop.yellow(input),
	input => noop.underline(input),
	input => noop.green(input),
];

const safeStages: readonly StringFormatter[] = [
	input => safe.red`${input}`,
	input => safe.bold`${input}`,
	input => safe.bgBlue`${input}`,
	input => safe.yellow`${input}`,
	input => safe.underline`${input}`,
	input => safe.green`${input}`,
];

const ropeStages: readonly RopeFormatter[] = [
	input => rope.red(input),
	input => rope.bold(input),
	input => rope.bgBlue(input),
	input => rope.yellow(input),
	input => rope.underline(input),
	input => rope.green(input),
];

const picocolorsStages: readonly StringFormatter[] = [
	input => picocolors.red(input),
	input => picocolors.bold(input),
	input => picocolors.bgBlue(input),
	input => picocolors.yellow(input),
	input => picocolors.underline(input),
	input => picocolors.green(input),
];

const coloretteStages: readonly StringFormatter[] = [
	input => colorette.red(input),
	input => colorette.bold(input),
	input => colorette.bgBlue(input),
	input => colorette.yellow(input),
	input => colorette.underline(input),
	input => colorette.green(input),
];

const kleurStages: readonly StringFormatter[] = [
	input => kleur.red(input),
	input => kleur.bold(input),
	input => kleur.bgBlue(input),
	input => kleur.yellow(input),
	input => kleur.underline(input),
	input => kleur.green(input),
];

const kleurColorsStages: readonly StringFormatter[] = [
	input => kleurColors.red(input),
	input => kleurColors.bold(input),
	input => kleurColors.bgBlue(input),
	input => kleurColors.yellow(input),
	input => kleurColors.underline(input),
	input => kleurColors.green(input),
];

const chalkStages: readonly StringFormatter[] = [
	input => chalk.red(input),
	input => chalk.bold(input),
	input => chalk.bgBlue(input),
	input => chalk.yellow(input),
	input => chalk.underline(input),
	input => chalk.green(input),
];

const ansiStages: readonly StringFormatter[] = [
	input => ansi.red(input),
	input => ansi.bold(input),
	input => ansi.bgBlue(input),
	input => ansi.yellow(input),
	input => ansi.underline(input),
	input => ansi.green(input),
];

export function register(
	{ layers = DEFAULT_LAYERS, repeat = DEFAULT_REPEAT }: { layers?: number; repeat?: number } = {},
): void {
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

	let textSink = '';
	let chunkSink = rope.text('');

	summary(() => {
		bench('ansispeck', () => {
			textSink = applyStages(nextInput(ansispeckCounter, repeat), ansispeckStages, layers);
			do_not_optimize(textSink);
		});
		bench('ansispeck/auto', () => {
			textSink = applyStages(nextInput(autoCounter, repeat), autoStages, layers);
			do_not_optimize(textSink);
		});
		bench('ansispeck/raw', () => {
			textSink = applyStages(nextInput(rawCounter, repeat), rawStages, layers);
			do_not_optimize(textSink);
		});
		bench('ansispeck/noop', () => {
			textSink = applyStages(nextInput(noopCounter, repeat), noopStages, layers);
			do_not_optimize(textSink);
		});
		bench('ansispeck/safe', () => {
			textSink = applyStages(nextInput(safeCounter, repeat), safeStages, layers);
			do_not_optimize(textSink);
		});
		bench('ansispeck/rope', () => {
			chunkSink = buildRopeStages(nextInput(ropeCounter, repeat), ropeStages, layers);
			do_not_optimize(chunkSink);
		});
		bench('picocolors', () => {
			textSink = applyStages(nextInput(picocolorsCounter, repeat), picocolorsStages, layers);
			do_not_optimize(textSink);
		});
		bench('colorette', () => {
			textSink = applyStages(nextInput(coloretteCounter, repeat), coloretteStages, layers);
			do_not_optimize(textSink);
		});
		bench('kleur', () => {
			textSink = applyStages(nextInput(kleurCounter, repeat), kleurStages, layers);
			do_not_optimize(textSink);
		});
		bench('kleur/colors', () => {
			textSink = applyStages(nextInput(kleurColorsCounter, repeat), kleurColorsStages, layers);
			do_not_optimize(textSink);
		});
		bench('chalk', () => {
			textSink = applyStages(nextInput(chalkCounter, repeat), chalkStages, layers);
			do_not_optimize(textSink);
		});
		bench('ansi-colors', () => {
			textSink = applyStages(nextInput(ansiCounter, repeat), ansiStages, layers);
			do_not_optimize(textSink);
		});
	});
}

if (import.meta.main) {
	register();
	await run();
}
