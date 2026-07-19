#!/usr/bin/env bun
// deno-lint-ignore-file no-sloppy-imports
/// <reference types="bun" />

import { execSync, spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { sep } from 'node:path';
import { URL } from 'node:url';
import type { Out } from 'dreamcli';
import { cli, command, flag } from 'dreamcli';
import { run } from 'mitata';
import { register as complex } from '#bench/complex';
import { register as deferred } from '#bench/deferred';
import { BENCH_LIBRARIES } from '#bench/libraries';
import { register as loading } from '#bench/loading';
import { register as recursion } from '#bench/recursion';
import { register as simple } from '#bench/simple';
import pkg from '#pkg' with { type: 'json' };

declare module 'mitata' {
	interface ctx {
		version: string | null;
	}

	interface trial {
		group?: number;
	}
}

const SUITES = ['simple', 'complex', 'recursion', 'deferred-build', 'loading'] as const;
const SUITE_LABELS: Readonly<Record<string, string>> = {
	simple: 'simple',
	complex: 'complex',
	recursion: 'recursion',
	'deferred-build': 'deferred-build',
	loading: 'cold load',
};
const LIB_ORDER = BENCH_LIBRARIES.map(({ alias }) => alias);

const FORMATS = ['overview', 'json', 'mitata', 'markdown', 'md'] as const;
type Format = (typeof FORMATS)[number];
type RunFormat = Format | 'quiet';

interface LibStats {
	avg: number;
	samples: number[];
}

/** Welch's t-test: CI95 for the difference of means between two sample sets. */
function welchCI95(a: number[], b: number[]): { ratio: number; significant: boolean } {
	if (a.length < 2 || b.length < 2) {
		throw new Error(`welchCI95 needs >=2 samples per set (a=${a.length}, b=${b.length})`);
	}
	const meanA = a.reduce((s, v) => s + v, 0) / a.length;
	const meanB = b.reduce((s, v) => s + v, 0) / b.length;
	if (!Number.isFinite(meanA) || !Number.isFinite(meanB)) {
		throw new Error('welchCI95 got non-finite sample mean');
	}
	if (meanA === 0) {
		throw new Error('welchCI95 got zero baseline mean');
	}
	const varA = a.reduce((s, v) => s + (v - meanA) ** 2, 0) / (a.length - 1);
	const varB = b.reduce((s, v) => s + (v - meanB) ** 2, 0) / (b.length - 1);
	if (!Number.isFinite(varA) || !Number.isFinite(varB) || varA < 0 || varB < 0) {
		throw new Error('welchCI95 got invalid sample variance');
	}
	const seA = varA / a.length;
	const seB = varB / b.length;
	const seDiffSq = seA + seB;
	if (!Number.isFinite(seDiffSq) || seDiffSq < 0) {
		throw new Error('welchCI95 got invalid standard error');
	}
	const seDiff = Math.sqrt(seDiffSq);

	const diff = meanB - meanA; // positive = B slower
	let lo = diff;

	if (seDiff !== 0) {
		// Welch–Satterthwaite degrees of freedom
		const num = seDiffSq ** 2;
		const den = seA ** 2 / (a.length - 1) + seB ** 2 / (b.length - 1);
		if (!Number.isFinite(num) || !Number.isFinite(den)) {
			throw new Error('welchCI95 got invalid degrees-of-freedom terms');
		}

		// t critical value for 95% CI (two-tailed)
		let t95 = 1.96;
		if (den !== 0) {
			const df = num / den;
			if (!Number.isFinite(df) || df <= 0) {
				throw new Error('welchCI95 got invalid degrees of freedom');
			}
			t95 = df > 120 ? 1.96 : df > 60 ? 2.0 : df > 30 ? 2.042 : df > 15 ? 2.131 : 2.262;
		}

		lo = diff - t95 * seDiff;
	}

	const ratio = meanB / meanA;
	if (!Number.isFinite(ratio)) {
		throw new Error('welchCI95 got non-finite ratio');
	}
	const significant = lo > 0; // entire CI above 0 → A is significantly faster

	return { ratio, significant };
}

type BenchResult = Awaited<ReturnType<typeof run>>;
const SELF_LIB = 'ansispeck';
const BASELINE_LABEL = `${SELF_LIB}/ext#1`;

/** External = not ansispeck itself and not one of its `ansispeck/*` entrypoints. */
const isExternal = (lib: string): boolean => lib !== SELF_LIB && !lib.startsWith(`${SELF_LIB}/`);

/**
 * Rows whose behavior mismatches this run's color mode show their numbers but
 * don't compete for rank: noop does no work in a colored run; raw ignores a
 * no-color run. The root export's detection is the mode oracle.
 */
function rankExcluded(isColorSupported: boolean): ReadonlySet<string> {
	return new Set(
		isColorSupported ? [`${SELF_LIB}/noop`] : [`${SELF_LIB}/noop`, `${SELF_LIB}/raw`],
	);
}

interface Parsed {
	activeSuites: string[];
	context: BenchResult['context'];
	libs: string[];
	ranked: Map<string, Array<{ lib: string; stats: LibStats }>>;
	suites: Map<string, Map<string, LibStats>>;
}

function parse(result: BenchResult, excluded: ReadonlySet<string>): Parsed {
	const { context, benchmarks } = result;
	const suiteByGroup: Map<number, (typeof SUITES)[number]> = new Map();
	let nextSuite = 0;

	const suites: Map<string, Map<string, LibStats>> = new Map();
	for (const trial of benchmarks) {
		const group = trial.group;
		if (group === undefined) continue;
		let suite = suiteByGroup.get(group);
		if (suite === undefined) {
			suite = SUITES[nextSuite];
			if (suite === undefined) continue;
			suiteByGroup.set(group, suite);
			nextSuite++;
		}
		if (suite === undefined) continue;
		const stats = trial.runs[0]?.stats;
		if (stats === undefined) continue;
		let map = suites.get(suite);
		if (!map) {
			map = new Map();
			suites.set(suite, map);
		}
		map.set(trial.alias, { avg: stats.avg, samples: stats.samples });
	}

	const libs: string[] = [];
	const firstSuite = SUITES.find((suite) => suites.has(suite));
	if (firstSuite !== undefined) {
		const firstSuiteEntries = suites.get(firstSuite);
		if (firstSuiteEntries !== undefined) {
			for (const lib of LIB_ORDER) {
				if (firstSuiteEntries.has(lib)) libs.push(lib);
			}
			for (const lib of firstSuiteEntries.keys()) {
				if (!libs.includes(lib)) libs.push(lib);
			}
		}
	} else {
		for (const trial of benchmarks) {
			if (!libs.includes(trial.alias)) libs.push(trial.alias);
		}
	}

	const activeSuites = [...suites.keys()];

	const ranked: Map<string, Array<{ lib: string; stats: LibStats }>> = new Map();
	for (const [suite, entries] of suites) {
		const sorted = [...entries.entries()]
			.map(([lib, stats]) => ({ lib, stats }))
			.filter(({ lib }) => !excluded.has(lib))
			.sort((a, b) => a.stats.avg - b.stats.avg);
		ranked.set(suite, sorted);
	}

	return { context, suites, libs, activeSuites, ranked };
}

function fmtTime(ns: number): string {
	if (ns < 1_000) return `${ns.toFixed(2)} ns`;
	if (ns < 1_000_000) return `${(ns / 1_000).toFixed(2)} µs`;
	return `${(ns / 1_000_000).toFixed(2)} ms`;
}

function suiteLabel(suite: string): string {
	return SUITE_LABELS[suite] ?? suite;
}

function computeCI95(parsed: Parsed): Map<string, { label: string; significant: boolean }> {
	const ci95: Map<string, { label: string; significant: boolean }> = new Map();
	for (const [suite, ranking] of parsed.ranked) {
		const self = ranking.find((r) => r.lib === SELF_LIB);
		if (!self) continue;
		const fastestExternal = ranking.find((r) => isExternal(r.lib));
		if (!fastestExternal) continue;
		if (self.stats.avg <= fastestExternal.stats.avg) {
			ci95.set(suite, { label: '—', significant: true });
			continue;
		}
		const { ratio, significant } = welchCI95(fastestExternal.stats.samples, self.stats.samples);
		ci95.set(suite, { label: `${ratio.toFixed(2)}x`, significant });
	}
	return ci95;
}

function printOverview(result: BenchResult, excluded: ReadonlySet<string>, out: Out): void {
	const parsed = parse(result, excluded);
	const { suites, libs, activeSuites, ranked, context } = parsed;
	const ci95 = computeCI95(parsed);

	const nameW = Math.max(4, BASELINE_LABEL.length, ...libs.map((l) => l.length));
	const colW = Math.max(...activeSuites.map((s) => suiteLabel(s).length), 10);
	const tagW = 3;
	const fullW = colW + 1 + tagW;

	const {
		runtime,
		version,
		cpu: { name: cpuName },
	} = context;
	out.log(`\n  ${runtime ?? 'unknown'} ${version ?? ''}, ${cpuName ?? 'unknown'}\n`);

	// header
	out.log(''.padStart(nameW) + '  ' + activeSuites.map((s) => suiteLabel(s).padStart(fullW)).join('  '));
	out.log(''.padStart(nameW, '─') + '  ' + activeSuites.map(() => ''.padStart(fullW, '─')).join('  '));

	// rows
	for (const lib of libs) {
		const cells: string[] = [];
		for (const suite of activeSuites) {
			const entry = suites.get(suite)?.get(lib);
			if (entry === undefined) {
				cells.push('—'.padStart(fullW));
				continue;
			}
			const rank = ranked.get(suite)?.findIndex((r) => r.lib === lib) ?? -1;
			const val = fmtTime(entry.avg);
			const tag = rank === -1 ? '†' : rank === 0 ? ' *' : `#${rank + 1}`;
			cells.push(`${val.padStart(colW)} ${out.color.dim(tag.padStart(tagW))}`);
		}
		out.log(lib.padEnd(nameW) + '  ' + cells.join('  '));
	}

	// CI95 footer row
	const ciCells = activeSuites.map((s) => {
		const entry = ci95.get(s);
		if (!entry) return ''.padStart(fullW);
		if (entry.label === '—' || entry.significant) return entry.label.padStart(fullW);
		// pad before dimming — the ANSI bytes must not count toward the column width
		return out.color.dim(`${entry.label} ~`.padStart(fullW));
	});
	out.log(''.padStart(nameW, '─') + '  ' + activeSuites.map(() => ''.padStart(fullW, '─')).join('  '));
	out.log(BASELINE_LABEL.padEnd(nameW) + '  ' + ciCells.join('  '));

	out.log('');
	const legend = '  * = fastest, — = ansispeck beats fastest external lib, ~ = not significant';
	const unranked = libs.some((lib) => excluded.has(lib));
	out.log(unranked ? `${legend}, † = unranked (mode-mismatched)` : legend);
}

const EXPORT_NOTES: Record<string, string> = {
	ansispeck: 'auto mode — picks raw or noop once at import; FORCE_COLOR/`--color` wins',
	'ansispeck/auto': 'same behavior as the root export, via explicit subpath',
	'ansispeck/raw': 'always emits ANSI codes',
	'ansispeck/safe': 'template-tag API preserving style across interpolations',
	'ansispeck/rope': 'chunk builder — O(1) compose + O(n) render',
	'ansispeck/noop': 'control path — returns plain strings',
};

/** npm package name behind a bench alias (`kleur/colors` → `kleur`). */
function packageNameOf(alias: string): string {
	const configured = BENCH_LIBRARIES.find((library) => library.alias === alias);
	if (configured !== undefined) return configured.packageName;
	const segments = alias.split('/');
	if (alias.startsWith('@')) return segments.slice(0, 2).join('/');
	return segments[0] ?? alias;
}

function readVersionField(jsonText: string): string {
	const parsed: unknown = JSON.parse(jsonText);
	if (typeof parsed === 'object' && parsed !== null && 'version' in parsed && typeof parsed.version === 'string') {
		return parsed.version;
	}
	throw new Error('package.json without a string "version" field');
}

const versionCache: Map<string, string> = new Map();

/** Installed version: resolve the package, read its node_modules package.json (repo root for ansispeck). */
function packageVersion(name: string): string {
	const cached = versionCache.get(name);
	if (cached !== undefined) return cached;
	const resolved = import.meta.resolve(name);
	const marker = `/node_modules/${name}/`;
	const at = resolved.lastIndexOf(marker);
	const version = at === -1
		? pkg.version
		: readVersionField(readFileSync(new URL(`${resolved.slice(0, at + marker.length)}package.json`), 'utf8'));
	versionCache.set(name, version);
	return version;
}

function printMarkdown(result: BenchResult, excluded: ReadonlySet<string>, compact: boolean, out: Out): void {
	const parsed = parse(result, excluded);
	const { suites, libs, activeSuites, ranked, context } = parsed;
	const ci95 = computeCI95(parsed);

	const {
		runtime,
		version,
		cpu: { name: cpuName },
	} = context;
	out.log(`## ${runtime ?? 'unknown'} ${version ?? ''}`);
	out.log(`\n> ${cpuName ?? 'unknown'}\n`);

	// ansispeck export notes
	const noted = libs.filter((lib) => EXPORT_NOTES[lib] !== undefined);
	if (!compact && noted.length > 0) {
		out.log('> ansispeck exports in this table:');
		for (const lib of noted) {
			const note = EXPORT_NOTES[lib];
			if (note === undefined) continue;
			out.log(`> - \`${lib}\`: ${note}`);
		}
		out.log('');
		out.log('> Cold load starts an isolated runtime process using packages installed from local tarballs.');
		out.log('');
	}

	if (!compact && libs.some((lib) => excluded.has(lib))) {
		out.log('> † unranked — behavior does not match this color mode');
		out.log('');
	}

	// header
	const hdr = [
		'Library',
		...activeSuites.map((s) => {
			const label = suiteLabel(s);
			return label.charAt(0).toUpperCase() + label.slice(1);
		}),
	];
	out.log(`| ${hdr.join(' | ')} |`);
	out.log(`| ${hdr.map((_, i) => (i === 0 ? '---' : '---:')).join(' | ')} |`);

	for (const lib of libs) {
		const pkgName = packageNameOf(lib);
		const v = packageVersion(pkgName);

		const cells: string[] = [];
		cells.push(`[${lib}](https://npm.im/package/${pkgName}/v/${v} "${pkgName} v${v}")`);

		for (const suite of activeSuites) {
			const entry = suites.get(suite)?.get(lib);
			if (entry === undefined) {
				cells.push('—');
				continue;
			}
			const rank = ranked.get(suite)?.findIndex((r) => r.lib === lib) ?? -1;
			const val = fmtTime(entry.avg);
			if (excluded.has(lib)) {
				cells.push(`${val} †`);
			} else if (rank === 0) {
				cells.push(`<ins>**${val}**</ins> 🥇`);
			} else if (rank === 1) {
				cells.push(`***${val}*** 🥈`);
			} else if (rank === 2) {
				cells.push(`*${val}* 🥉`);
			} else {
				cells.push(`${val} #${rank + 1}`);
			}
		}
		out.log(`| ${cells.join(' | ')} |`);
	}

	// CI95 footer
	const ciCells = activeSuites.map((s) => {
		const entry = ci95.get(s);
		if (!entry) return '';
		if (entry.label === '—') return '—';
		return entry.significant ? entry.label : `${entry.label} ~`;
	});
	out.log(`| **${BASELINE_LABEL}** | ${ciCells.join(' | ')} |`);
}

function parseFilter(raw: unknown): RegExp {
	if (typeof raw !== 'string') throw new Error('Expected a regular expression string');
	return new RegExp(raw);
}

function mitataFormat(format: RunFormat): 'json' | 'mitata' | 'quiet' {
	switch (format) {
		case 'json':
			return 'json';
		case 'mitata':
			return 'mitata';
		default:
			return 'quiet';
	}
}

async function runBenchmarks(format: RunFormat, filter: RegExp | undefined, compact: boolean, out: Out): Promise<void> {
	execSync('run -q build', { stdio: 'ignore' });
	execSync('bun --bun scripts/prepare-loading-fixture.ts', { stdio: 'ignore' });
	const { default: ansispeck } = await import('#ansispeck-dist');
	const excluded = rankExcluded(ansispeck.isColorSupported);

	simple({ count: 1 });
	complex({ count: 1 });
	recursion({ count: 10_000 });
	deferred({ layers: 32, repeat: 32 });
	loading({ count: 1 });

	const result = await run({ format: mitataFormat(format), filter });
	if (format === 'overview') printOverview(result, excluded, out);
	if (format === 'markdown' || format === 'md') printMarkdown(result, excluded, compact, out);
}

const benchmark = command('bench')
	.description('Benchmark ansispeck against terminal color libraries')
	.flag(
		'format',
		flag.enum(FORMATS).default('overview').alias('f').describe('Output format'),
	)
	.flag(
		'filter',
		flag.custom(parseFilter).alias('F').describe('Only run benchmarks matching this regular expression'),
	)
	.flag('compact', flag.boolean().describe('Omit reusable notes from Markdown output'))
	.flag('quiet', flag.boolean().alias('q').describe('Suppress benchmark output'))
	.action(async ({ flags, out }) => {
		const format: RunFormat = flags.quiet ? 'quiet' : out.jsonMode ? 'json' : flags.format;
		await runBenchmarks(format, flags.filter, flags.compact, out);
	});

const dirty = spawnSync('git', ['diff', '--exit-code', '--quiet', 'HEAD'], { stdio: 'ignore' }).status != 0;
let v = String(spawnSync('git', ['describe', '--tags', '--abbrev=0']).stdout).trim();
v = `${v.replace(/^v/, '')}${dirty ? '-dirty' : ''}`;

if (import.meta.main) {
	void cli(import.meta.filename.split(sep).at(-1)!).version(v)
		.manifest({ files: ['package.json', 'jsr.json'] }).links()
		.description('Run the ansispeck benchmark matrix')
		.default(benchmark)
		.run();
}
