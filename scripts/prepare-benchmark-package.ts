#!/usr/bin/env bun
import { dirname, join, resolve } from 'node:path';

if (process.env['BENCH_MULTI'] === '1') process.exit(0);

const ROOT = dirname(import.meta.dir);
const BENCHMARKS = join(ROOT, 'benchmarks');

await Bun.$`run -q build`.cwd(ROOT).quiet();

const output = await Bun.$`bun --bun scripts/pack.ts benchmarks`.cwd(ROOT).text();
const tarball = resolve(output.trim());
if (dirname(tarball) !== BENCHMARKS) {
	throw new Error(`Expected benchmark tarball in ${BENCHMARKS}`);
}

await Bun.$`bun add --no-save --ignore-scripts ${tarball}`.cwd(BENCHMARKS).quiet();
