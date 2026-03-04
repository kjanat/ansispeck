import type { Palette } from '#dist/ansispeck/raw';
import { run } from 'mitata';
import { execSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { basename, relative } from 'node:path';
import { parseArgs } from 'node:util';

execSync('bun bd:ci', { stdio: 'ignore', cwd: import.meta.dirname });

const { dim }: { dim: Palette['dim'] } = await import('#dist/ansispeck/raw');

declare module 'mitata' {
	interface ctx {
		version: string | null;
	}

	interface trial {
		group?: number;
	}
}

import { register as complex } from './benchmarks/complex.ts';
import { register as deferred } from './benchmarks/deferred.ts';
import { register as loading } from './benchmarks/loading.ts';
import { register as recursion } from './benchmarks/recursion.ts';
import { register as simple } from './benchmarks/simple.ts';

const SUITES = ['simple', 'complex', 'recursion', 'deferred-build', 'loading'] as const;
const LIB_ORDER = [
	'ansispeck',
	'ansispeck/auto',
	'ansispeck/raw',
	'ansispeck/safe',
	'ansispeck/rope',
	'ansispeck/noop',
	'picocolors',
	'colorette',
	'kleur',
	'kleur/colors',
	'chalk',
	'ansi-colors',
] as const;

const ANSISPECK_EXPORT_NOTES: Record<string, string> = {
	ansispeck: 'root auto mode; picks raw/noop once at import (`FORCE_COLOR`/`--color` wins)',
	'ansispeck/auto': 'same auto behavior as root, direct subpath import',
	'ansispeck/raw': 'always emit ANSI (fastest path, no close-code repair)',
	'ansispeck/safe': 'template-tag API that preserves style over interpolations',
	'ansispeck/rope': 'chunk builder: O(1) compose + O(n) render',
	'ansispeck/noop': 'control path: no ANSI, returns plain strings',
};

const { values } = parseArgs({
	options: {
		format: { type: 'string', short: 'f', default: 'overview' },
		filter: { type: 'string', short: 'F' },
		help: { type: 'boolean', short: 'h', default: false },
	},
	strict: false,
});

if (values.help) {
	console.log(`Usage: ${relative(process.cwd(), import.meta.filename) || basename(import.meta.filename)} [options]

Options:
  -f, --format <fmt>   Output format (default: overview)
                       overview      terminal table with rankings + CI95
                       markdown|md   GitHub-flavored markdown table
                       json          raw JSON
                       quiet         suppress mitata output (used internally)
                       mitata        default mitata output
  -F, --filter <regex> Only run benchmarks matching <regex>
  -h, --help           Show this help`);
	process.exit(0);
}

simple({ count: 1 });
complex({ count: 1 });
recursion({ count: 10_000 });
deferred({ layers: 32, repeat: 32 });
loading({ count: 1 });

const FORMATS = ['overview', 'json', 'quiet', 'mitata', 'markdown', 'md'] as const;
type Format = (typeof FORMATS)[number];

const fmt = String(values.format);
if (!FORMATS.includes(fmt as Format)) {
	console.error(`Unknown format: ${fmt}\nValid: ${FORMATS.join(', ')}`);
	process.exit(1);
}

let filter: RegExp | undefined;
if (typeof values.filter === 'string') {
	try {
		filter = new RegExp(values.filter);
	} catch {
		console.error(`Invalid regex: ${values.filter}`);
		process.exit(1);
	}
}
const isCustom = fmt === 'overview' || fmt === 'markdown' || fmt === 'md';
const format = isCustom ? 'quiet' : (fmt as Exclude<Format, 'overview' | 'markdown' | 'md'>);

const result = await run({ format, filter });

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
const INTERNAL_PREFIX = 'ansispeck/';

const isExternalLib = (lib: string): boolean => {
	return lib !== SELF_LIB && !lib.startsWith(INTERNAL_PREFIX);
};

interface Parsed {
	context: BenchResult['context'];
	suites: Map<string, Map<string, LibStats>>;
	libs: string[];
	activeSuites: string[];
	ranked: Map<string, Array<{ lib: string; stats: LibStats }>>;
}

function parse(result: BenchResult): Parsed {
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
	const firstSuite = SUITES.find(suite => suites.has(suite));
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

function computeCI95(parsed: Parsed): Map<string, { label: string; significant: boolean }> {
	const ci95: Map<string, { label: string; significant: boolean }> = new Map();
	for (const [suite, ranking] of parsed.ranked) {
		const self = ranking.find(entry => entry.lib === SELF_LIB);
		if (!self) continue;

		const firstExternal = ranking.find(entry => isExternalLib(entry.lib));
		if (!firstExternal) continue;

		if (self.stats.avg <= firstExternal.stats.avg) {
			ci95.set(suite, { label: '—', significant: true });
			continue;
		}

		const { ratio, significant } = welchCI95(firstExternal.stats.samples, self.stats.samples);
		ci95.set(suite, { label: `${ratio.toFixed(2)}x`, significant });
	}
	return ci95;
}

function printOverview(result: BenchResult): void {
	const parsed = parse(result);
	const { suites, libs, activeSuites, ranked, context } = parsed;
	const ci95 = computeCI95(parsed);

	const nameW = Math.max(4, BASELINE_LABEL.length, ...libs.map(l => l.length));
	const colW = Math.max(...activeSuites.map(s => s.length), 10);
	const tagW = 3;
	const fullW = colW + 1 + tagW;

	const { runtime, version, cpu: { name: cpuName } } = context;
	console.log(`\n  ${runtime ?? 'unknown'} ${version ?? ''}, ${cpuName ?? 'unknown'}\n`);

	// header
	console.log(`${''.padStart(nameW)}  ${activeSuites.map(s => s.padStart(fullW)).join('  ')}`);
	console.log(`${''.padStart(nameW, '─')}  ${activeSuites.map(() => ''.padStart(fullW, '─')).join('  ')}`);

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
			cells.push(`${val.padStart(colW)} ${dim(tag.padStart(tagW))}`);
		}
		console.log(`${lib.padEnd(nameW)}  ${cells.join('  ')}`);
	}

	// CI95 footer row
	const ciCells = activeSuites.map(s => {
		const entry = ci95.get(s);
		if (!entry) return ''.padStart(fullW);
		const text = entry.label === '—' ? '—' : entry.significant ? entry.label : dim(`${entry.label} ~`);
		return text.padStart(fullW);
	});
	console.log(`${''.padStart(nameW, '─')}  ${activeSuites.map(() => ''.padStart(fullW, '─')).join('  ')}`);
	console.log(`${BASELINE_LABEL.padEnd(nameW)}  ${ciCells.join('  ')}`);

	console.log('');
	console.log('  * = fastest, — = ansispeck beats fastest external lib, ~ = not significant');
}

/** npm package name from specifier (handles scoped + subpaths) */
const pkgName = (s: string): string => s.startsWith('@') ? s.split('/').slice(0, 2).join('/') : s.split('/')[0] ?? s;

/** Read installed version from the resolved package's package.json */
const readPkgVersion = async (specifier: string): Promise<string> => {
	const name = pkgName(specifier);
	const entry = import.meta.resolve(specifier);
	const marker = `node_modules/${name}/`;
	const i = entry.lastIndexOf(marker);
	const base = i !== -1 ? entry.slice(0, i + marker.length) : new URL('.', import.meta.url).href;
	const { version }: { version: string } = JSON.parse(await readFile(new URL('package.json', base), 'utf-8'));
	return version;
};

const PACKAGE_ORDER = [...new Set(LIB_ORDER.map(pkgName))];

const buildNpmFootnotes = async (): Promise<Record<string, { version: string; url: string }>> =>
	Object.fromEntries(
		await Promise.all(PACKAGE_ORDER.map(async name => {
			const version = await readPkgVersion(name);
			return [name, { version, url: `https://www.npmjs.com/package/${name}/v/${version}` }];
		})),
	);

async function printMarkdown(result: BenchResult): Promise<void> {
	const parsed = parse(result);
	const { suites, libs, activeSuites, ranked, context } = parsed;
	const ci95 = computeCI95(parsed);
	const npmInfo = await buildNpmFootnotes();

	const { runtime, version, cpu: { name: cpuName } } = context;
	console.log(`## ${runtime ?? 'unknown'} ${version ?? ''}`);
	console.log(`\n> ${cpuName ?? 'unknown'}\n`);
	const ansispeckExports = libs.filter(lib => lib in ANSISPECK_EXPORT_NOTES);
	if (ansispeckExports.length > 0) {
		console.log('> ansispeck exports in this table:');
		for (const lib of LIB_ORDER) {
			if (!ansispeckExports.includes(lib)) continue;
			const note = ANSISPECK_EXPORT_NOTES[lib];
			if (note === undefined) continue;
			console.log(`> - \`${lib}\`: ${note}`);
		}
		console.log('');
	}

	// header
	const hdr = ['Library', ...activeSuites.map(s => s.charAt(0).toUpperCase() + s.slice(1))];
	console.log(`| ${hdr.join(' | ')} |`);
	console.log(`| ${hdr.map((_, i) => i === 0 ? '---' : '---:').join(' | ')} |`);

	// collect footnote definitions
	const footnotes: Array<[string, string, { version: string; url: string }]> = [];
	const seenRefs = new Set<string>();

	for (const lib of libs) {
		const pkg = pkgName(lib);
		const refKey = pkg.replace(/\//g, '-');
		const info = npmInfo[pkg];
		if (info && !seenRefs.has(refKey)) {
			footnotes.push([refKey, pkg, info]);
			seenRefs.add(refKey);
		}

		const cells: string[] = [];
		cells.push(`${lib}[^${refKey}]`);

		for (const suite of activeSuites) {
			const entry = suites.get(suite)?.get(lib);
			if (entry === undefined) {
				cells.push('—');
				continue;
			}
			const rank = ranked.get(suite)?.findIndex(r => r.lib === lib) ?? -1;
			const val = fmtTime(entry.avg);
			if (rank === 0) {
				cells.push(`**${val}** 🥇`);
			} else {
				cells.push(`${val} #${rank + 1}`);
			}
		}
		console.log(`| ${cells.join(' | ')} |`);
	}

	// CI95 footer
	const ciCells = activeSuites.map(s => {
		const entry = ci95.get(s);
		if (!entry) return '';
		if (entry.label === '—') return '**#1**';
		return entry.significant ? entry.label : `${entry.label} ~`;
	});
	console.log(`| **${BASELINE_LABEL}** | ${ciCells.join(' | ')} |`);

	// footnote definitions
	console.log('');
	for (const [key, pkg, { version: v, url }] of footnotes) {
		console.log(`[^${key}]: ${pkg} [v${v}](${url} "NPM")`);
	}
}

// dispatch — must be after all declarations to avoid TDZ
if (fmt === 'overview') printOverview(result);
if (fmt === 'markdown' || fmt === 'md') await printMarkdown(result);
