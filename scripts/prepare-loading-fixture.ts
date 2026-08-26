#!/usr/bin/env bun
import { dirname, join, sep } from 'node:path';
import { BENCH_LIBRARIES } from '@/bench/libraries';

const ROOT = dirname(import.meta.dir);
const FIXTURE = join(ROOT, '.cache', 'bench-loading');
const TARBALLS = join(FIXTURE, 'tarballs');
const BENCHMARK_PACKAGE = join(ROOT, 'benchmarks', 'node_modules', 'ansispeck');

function packageRoot(name: string): string {
	if (name === 'ansispeck') return BENCHMARK_PACKAGE;

	const entry = Bun.fileURLToPath(import.meta.resolve(name));
	const marker = `${sep}node_modules${sep}${name.split('/').join(sep)}${sep}`;
	const at = entry.lastIndexOf(marker);
	if (at === -1) throw new Error(`Cannot locate package root for ${name}`);
	return entry.slice(0, at + marker.length - 1);
}

function packedFilename(output: string, name: string): string {
	const parsed: unknown = JSON.parse(output);
	const result: unknown = Array.isArray(parsed)
		? parsed.length === 1 ? parsed[0] : undefined
		: typeof parsed === 'object' && parsed !== null && name in parsed
		? Reflect.get(parsed, name)
		: undefined;
	if (typeof result !== 'object' || result === null || !('filename' in result) || typeof result.filename !== 'string') {
		throw new Error(`npm pack did not report a filename for ${name}`);
	}
	return result.filename;
}

await Bun.$`rm -rf ${FIXTURE}`;
await Bun.$`mkdir -p ${TARBALLS}`;

const dependencies: Record<string, string> = {};
const packageNames = new Set(BENCH_LIBRARIES.map(({ packageName }) => packageName));
for (const name of packageNames) {
	const output = await Bun.$`npm pack ${packageRoot(name)} --ignore-scripts --json --pack-destination ${TARBALLS}`
		.text();
	const filename = packedFilename(output, name);
	dependencies[name] = `file:./tarballs/${filename}`;
}

await Bun.write(
	join(FIXTURE, 'package.json'),
	`${JSON.stringify({ private: true, type: 'module', dependencies }, null, '\t')}\n`,
);
await Bun.write(
	join(FIXTURE, 'load.mjs'),
	`\
const specifier = globalThis.Deno?.args[0] ?? process.argv[2];
if (specifier === undefined) throw new Error('missing package specifier');
await import(specifier);`,
);

await Bun.$`npm install --ignore-scripts --no-audit --no-fund --package-lock=false`.cwd(FIXTURE).quiet();
