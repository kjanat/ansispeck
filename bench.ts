import { execSync } from 'node:child_process';
import { parseArgs } from 'node:util';
import { run } from 'mitata';

execSync('bun bd', { stdio: 'ignore' });

import femtocolors from './dist/index.mjs';

declare module 'mitata' {
	interface ctx {
		version: string | null;
	}
}

import { register as complex } from './benchmarks/complex.ts';
import { register as loading } from './benchmarks/loading.ts';
import { register as recursion } from './benchmarks/recursion.ts';
import { register as simple } from './benchmarks/simple.ts';

const SUITES = ['simple', 'complex', 'recursion', 'loading'] as const;
const LIBS_PER_SUITE = 7;

const { values } = parseArgs({
	options: {
		format: { type: 'string', short: 'f', default: 'overview' },
		filter: { type: 'string' },
	},
	strict: false,
});

simple({ count: 1 });
complex({ count: 1 });
recursion({ count: 10_000 });
loading({ count: 1 });

const FORMATS = ['overview', 'json', 'quiet', 'mitata', 'markdown'] as const;
type Format = (typeof FORMATS)[number];

const fmt = String(values.format);
if (!FORMATS.includes(fmt as Format)) {
	console.error(`Unknown format: ${fmt}\nValid: ${FORMATS.join(', ')}`);
	process.exit(1);
}

const filter = typeof values.filter === 'string' ? new RegExp(values.filter) : undefined;
const isOverview = fmt === 'overview';
const format = isOverview ? 'quiet' : (fmt as Exclude<Format, 'overview'>);

const result = await run({ format, filter });

if (isOverview) {
	printOverview(result);
}

interface LibStats {
	avg: number;
	samples: number[];
}

/** Welch's t-test: CI95 for the difference of means between two sample sets. */
function welchCI95(a: number[], b: number[]): { ratio: number; significant: boolean } {
	const meanA = a.reduce((s, v) => s + v, 0) / a.length;
	const meanB = b.reduce((s, v) => s + v, 0) / b.length;
	const varA = a.reduce((s, v) => s + (v - meanA) ** 2, 0) / (a.length - 1);
	const varB = b.reduce((s, v) => s + (v - meanB) ** 2, 0) / (b.length - 1);
	const seA = varA / a.length;
	const seB = varB / b.length;
	const seDiff = Math.sqrt(seA + seB);

	// Welch–Satterthwaite degrees of freedom
	const num = (seA + seB) ** 2;
	const den = seA ** 2 / (a.length - 1) + seB ** 2 / (b.length - 1);
	const df = num / den;

	// t critical value for 95% CI (two-tailed)
	const t95 = df > 120 ? 1.96 : df > 60 ? 2.0 : df > 30 ? 2.042 : df > 15 ? 2.131 : 2.262;

	const diff = meanB - meanA; // positive = B slower
	const lo = diff - t95 * seDiff;
	const ratio = meanB / meanA;
	const significant = lo > 0; // entire CI above 0 → A is significantly faster

	return { ratio, significant };
}

function printOverview(result: Awaited<ReturnType<typeof run>>): void {
	const { context, benchmarks } = result;

	// group benchmarks into suites by index
	const suites: Map<string, Map<string, LibStats>> = new Map();
	for (let i = 0; i < benchmarks.length; i++) {
		const suiteIdx = Math.floor(i / LIBS_PER_SUITE);
		const suite = SUITES[suiteIdx];
		if (suite === undefined) continue;
		const trial = benchmarks[i];
		if (trial === undefined) continue;
		const stats = trial.runs[0]?.stats;
		if (stats === undefined) continue;
		let map = suites.get(suite);
		if (!map) {
			map = new Map();
			suites.set(suite, map);
		}
		map.set(trial.alias, { avg: stats.avg, samples: stats.samples });
	}

	// collect lib names preserving order
	const libs: string[] = [];
	for (const trial of benchmarks.slice(0, LIBS_PER_SUITE)) {
		if (!libs.includes(trial.alias)) libs.push(trial.alias);
	}

	const activeSuites = [...suites.keys()];

	// rank libs per suite
	const ranked: Map<string, Array<{ lib: string; stats: LibStats }>> = new Map();
	for (const [suite, entries] of suites) {
		const sorted = [...entries.entries()]
			.map(([lib, stats]) => ({ lib, stats }))
			.sort((a, b) => a.stats.avg - b.stats.avg);
		ranked.set(suite, sorted);
	}

	// CI95: femtocolors vs #1 (skip if femtocolors is #1)
	const FEMTO = 'femtocolors';
	const ci95: Map<string, string> = new Map();
	for (const [suite, ranking] of ranked) {
		const first = ranking[0];
		if (!first) {
			ci95.set(suite, '');
			continue;
		}
		if (first.lib === FEMTO) {
			ci95.set(suite, '—');
			continue;
		}
		const femto = ranking.find(r => r.lib === FEMTO);
		if (!femto) {
			ci95.set(suite, '');
			continue;
		}
		const { ratio, significant } = welchCI95(first.stats.samples, femto.stats.samples);
		const label = `${ratio.toFixed(2)}x`;
		ci95.set(suite, significant ? label : femtocolors.dim(`${label} ~`));
	}

	function fmtTime(ns: number): string {
		if (ns < 1_000) return `${ns.toFixed(2)} ns`;
		if (ns < 1_000_000) return `${(ns / 1_000).toFixed(2)} µs`;
		return `${(ns / 1_000_000).toFixed(2)} ms`;
	}

	const nameW = Math.max(4, ...libs.map(l => l.length));
	const colW = Math.max(...activeSuites.map(s => s.length), 10);
	const tagW = 3; // " *" or "#N" — padded to fixed width
	const fullW = colW + 1 + tagW; // value + space + tag

	const { runtime, version, cpu: { name: cpuName } } = context;
	console.log(`\n  ${runtime ?? 'unknown'} ${version ?? ''}, ${cpuName ?? 'unknown'}\n`);

	// header
	console.log(''.padStart(nameW) + '  ' + activeSuites.map(s => s.padStart(fullW)).join('  '));
	console.log(''.padStart(nameW, '─') + '  ' + activeSuites.map(() => ''.padStart(fullW, '─')).join('  '));

	// rows
	for (const lib of libs) {
		const cells: string[] = [];
		for (const suite of activeSuites) {
			const entry = suites.get(suite)?.get(lib);
			if (entry === undefined) {
				cells.push('—'.padStart(fullW));
				continue;
			}
			const rank = ranked.get(suite)?.findIndex(r => r.lib === lib) ?? -1;
			const val = fmtTime(entry.avg);
			const tag = rank === 0 ? ' *' : `#${rank + 1}`;
			cells.push(`${val.padStart(colW)} ${femtocolors.dim(tag.padStart(tagW))}`);
		}
		console.log(lib.padEnd(nameW) + '  ' + cells.join('  '));
	}

	// CI95 footer row
	const ciCells = activeSuites.map(s => (ci95.get(s) ?? '').padStart(fullW));
	console.log(''.padStart(nameW, '─') + '  ' + activeSuites.map(() => ''.padStart(fullW, '─')).join('  '));
	console.log('femto/#1'.padEnd(nameW) + '  ' + ciCells.join('  '));

	console.log('');
	console.log('  * = fastest, — = femtocolors is #1, ~ = not significant');
}
