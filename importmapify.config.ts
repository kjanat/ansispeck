#!/usr/bin/env bun
import { defineConfig, writeImportMap } from 'importmapify';
import lockfile from './bun.lock' with { type: 'jsonc' };

function lockSpec(name: string): string {
	const entry: Bun.BunLockFilePackageArray | undefined = lockfile.packages[name];
	if (entry === undefined) throw new Error(`bun.lock is missing package "${name}"`);
	return entry[0];
}
if (import.meta.main) await Bun.$`bun bd`;

const importMapCfg: import('importmapify').WriteImportMapOptions = defineConfig({
	root: import.meta.dir,
	extensions: ['ts', 'js'],
	additionalImports: {
		'@types/bun': `npm:${lockSpec('@types/bun')}`,
		'bun:test': `${`npm:${lockSpec('bun-types')}`}/test.d.ts`,
		bun: `npm:${lockSpec('bun-types')}`,
	},
});

const output = writeImportMap(importMapCfg);
Bun.stderr.write(`Wrote ${output}`);

export { importMapCfg };
