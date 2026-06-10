import { bench, do_not_optimize, run, summary } from 'mitata';

import ansispeck from '#ansispeck-dist';
import auto from '#ansispeck-dist/auto';
import noop from '#ansispeck-dist/noop';
import raw from '#ansispeck-dist/raw';
import type { Chunk } from '#ansispeck-dist/rope';
import rope from '#ansispeck-dist/rope';
import safe from '#ansispeck-dist/safe';
import ansi from 'ansi-colors';
import chalk from 'chalk';
import * as colorette from 'colorette';
import kleur from 'kleur';
import * as kleurColors from 'kleur/colors';
import picocolors from 'picocolors';

const DEFAULT_LAYERS = 32;
const DEFAULT_REPEAT = 32;

interface Counter {
	value: number;
}

/** Fresh input every iteration so the staged pipeline can never be constant-folded. */
function nextInput(counter: Counter, repeat: number): string {
	counter.value++;
	return ('pipeline segment lorem ipsum dolor sit amet ' + counter.value).repeat(repeat);
}

type StringStage = (input: string) => string;
type ChunkStage = (input: Chunk) => Chunk;

/** Apply `layers` wrapping stages, cycling through the fixed stage list. */
function applyStages(input: string, stages: readonly StringStage[], layers: number): string {
	if (stages.length === 0) throw new Error('applyStages requires a non-empty stage array');
	let output = input;
	for (let i = 0; i < layers; i++) {
		const stage = stages[i % stages.length];
		if (stage === undefined) throw new Error('applyStages requires a non-empty stage array');
		output = stage(output);
	}
	return output;
}

/** Chunk-node twin of applyStages: wraps without rendering. */
function buildRopeStages(input: Chunk, stages: readonly ChunkStage[], layers: number): Chunk {
	if (stages.length === 0) throw new Error('buildRopeStages requires a non-empty stage array');
	let output = input;
	for (let i = 0; i < layers; i++) {
		const stage = stages[i % stages.length];
		if (stage === undefined) throw new Error('buildRopeStages requires a non-empty stage array');
		output = stage(output);
	}
	return output;
}

// fixed 6-stage cycle per library: red → bold → bgBlue → yellow → underline → green
const ansispeckStages: readonly StringStage[] = [
	ansispeck.red,
	ansispeck.bold,
	ansispeck.bgBlue,
	ansispeck.yellow,
	ansispeck.underline,
	ansispeck.green,
];
const autoStages: readonly StringStage[] = [auto.red, auto.bold, auto.bgBlue, auto.yellow, auto.underline, auto.green];
const rawStages: readonly StringStage[] = [raw.red, raw.bold, raw.bgBlue, raw.yellow, raw.underline, raw.green];
const safeStages: readonly StringStage[] = [
	(input) => safe.red`${input}`,
	(input) => safe.bold`${input}`,
	(input) => safe.bgBlue`${input}`,
	(input) => safe.yellow`${input}`,
	(input) => safe.underline`${input}`,
	(input) => safe.green`${input}`,
];
const ropeStages: readonly ChunkStage[] = [
	rope.red,
	rope.bold,
	rope.bgBlue,
	rope.yellow,
	rope.underline,
	rope.green,
];
const noopStages: readonly StringStage[] = [
	noop.red,
	noop.bold,
	noop.bgBlue,
	noop.yellow,
	noop.underline,
	noop.green,
];
const picocolorsStages: readonly StringStage[] = [
	picocolors.red,
	picocolors.bold,
	picocolors.bgBlue,
	picocolors.yellow,
	picocolors.underline,
	picocolors.green,
];
const coloretteStages: readonly StringStage[] = [
	colorette.red,
	colorette.bold,
	colorette.bgBlue,
	colorette.yellow,
	colorette.underline,
	colorette.green,
];
const kleurStages: readonly StringStage[] = [
	kleur.red,
	kleur.bold,
	kleur.bgBlue,
	kleur.yellow,
	kleur.underline,
	kleur.green,
];
const kleurColorsStages: readonly StringStage[] = [
	kleurColors.red,
	kleurColors.bold,
	kleurColors.bgBlue,
	kleurColors.yellow,
	kleurColors.underline,
	kleurColors.green,
];
const chalkStages: readonly StringStage[] = [
	chalk.red,
	chalk.bold,
	chalk.bgBlue,
	chalk.yellow,
	chalk.underline,
	chalk.green,
];
const ansiStages: readonly StringStage[] = [ansi.red, ansi.bold, ansi.bgBlue, ansi.yellow, ansi.underline, ansi.green];

export function register(
	{ layers = DEFAULT_LAYERS, repeat = DEFAULT_REPEAT }: { layers?: number; repeat?: number } = {},
): void {
	let sink = '';
	let chunkSink: Chunk = rope.text('');
	summary(() => {
		const ansispeckCounter: Counter = { value: 0 };
		bench('ansispeck', () => {
			sink = applyStages(nextInput(ansispeckCounter, repeat), ansispeckStages, layers);
			do_not_optimize(sink);
		});
		const autoCounter: Counter = { value: 0 };
		bench('ansispeck/auto', () => {
			sink = applyStages(nextInput(autoCounter, repeat), autoStages, layers);
			do_not_optimize(sink);
		});
		const rawCounter: Counter = { value: 0 };
		bench('ansispeck/raw', () => {
			sink = applyStages(nextInput(rawCounter, repeat), rawStages, layers);
			do_not_optimize(sink);
		});
		const safeCounter: Counter = { value: 0 };
		bench('ansispeck/safe', () => {
			sink = applyStages(nextInput(safeCounter, repeat), safeStages, layers);
			do_not_optimize(sink);
		});
		const ropeCounter: Counter = { value: 0 };
		bench('ansispeck/rope', () => {
			// deferred on purpose: measures O(1) chunk composition, NOT render
			chunkSink = buildRopeStages(rope.text(nextInput(ropeCounter, repeat)), ropeStages, layers);
			do_not_optimize(chunkSink);
		});
		const noopCounter: Counter = { value: 0 };
		bench('ansispeck/noop', () => {
			sink = applyStages(nextInput(noopCounter, repeat), noopStages, layers);
			do_not_optimize(sink);
		});
		const picocolorsCounter: Counter = { value: 0 };
		bench('picocolors', () => {
			sink = applyStages(nextInput(picocolorsCounter, repeat), picocolorsStages, layers);
			do_not_optimize(sink);
		});
		const coloretteCounter: Counter = { value: 0 };
		bench('colorette', () => {
			sink = applyStages(nextInput(coloretteCounter, repeat), coloretteStages, layers);
			do_not_optimize(sink);
		});
		const kleurCounter: Counter = { value: 0 };
		bench('kleur', () => {
			sink = applyStages(nextInput(kleurCounter, repeat), kleurStages, layers);
			do_not_optimize(sink);
		});
		const kleurColorsCounter: Counter = { value: 0 };
		bench('kleur/colors', () => {
			sink = applyStages(nextInput(kleurColorsCounter, repeat), kleurColorsStages, layers);
			do_not_optimize(sink);
		});
		const chalkCounter: Counter = { value: 0 };
		bench('chalk', () => {
			sink = applyStages(nextInput(chalkCounter, repeat), chalkStages, layers);
			do_not_optimize(sink);
		});
		const ansiCounter: Counter = { value: 0 };
		bench('ansi-colors', () => {
			sink = applyStages(nextInput(ansiCounter, repeat), ansiStages, layers);
			do_not_optimize(sink);
		});
	});
}

if (import.meta.main) {
	register();
	await run();
}
