#!/usr/bin/env bun
import { dirname, join, resolve } from 'node:path';
import { env, exit } from 'node:process';

if (env['BENCH_MULTI'] === '1') exit(0);

const ROOT = dirname(import.meta.dir);
const BENCHMARKS = join(ROOT, 'benchmarks');

await Bun.$`run -q build`.cwd(ROOT).quiet();

const output = await Bun.$`bun --bun scripts/pack.ts benchmarks`.cwd(ROOT).text();
const tarball = resolve(output.trim());
if (dirname(tarball) !== BENCHMARKS) throw new Error(`Expected benchmark tarball in ${BENCHMARKS}`);

await Bun.$`bun add --no-save --ignore-scripts ${tarball}`.cwd(BENCHMARKS).quiet();
await Bun.$`bun --bun scripts/prepare-loading-fixture.ts`.cwd(ROOT).quiet();
