// deno-lint-ignore-file no-sloppy-imports
import { spawnSync } from 'node:child_process';
import { basename, join } from 'node:path';
import { execPath } from 'node:process';
import { fileURLToPath, URL } from 'node:url';
import { bench, group, run } from 'mitata';
import { BENCH_LIBRARIES } from './libraries.ts';

const DEFAULT_COUNT = 1;
const FIXTURE = fileURLToPath(new URL('../.cache/bench-loading/', import.meta.url));
const LOADER = join(FIXTURE, 'load.mjs');
const IS_DENO = basename(execPath).startsWith('deno');

function load(specifier: string): void {
	const args = IS_DENO
		? ['run', '-A', '--node-modules-dir=manual', LOADER, specifier]
		: [LOADER, specifier];
	const result = spawnSync(execPath, args, { cwd: FIXTURE, stdio: 'ignore' });
	if (result.error !== undefined) throw result.error;
	if (result.status !== 0) {
		throw new Error(`Failed to load ${specifier} in an isolated ${basename(execPath)} process`);
	}
}

export function register({ count = DEFAULT_COUNT }: { count?: number } = {}): void {
	if (count !== 1) {
		throw new Error('loading benchmark requires count=1 to measure one cold process load');
	}
	group(() => {
		for (const { alias, specifier } of BENCH_LIBRARIES) {
			bench(alias, () => {
				for (let i = 0; i < count; i++) load(specifier);
			});
		}
	});
}

if (import.meta.main) {
	register();
	await run();
}
