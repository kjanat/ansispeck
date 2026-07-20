#!/usr/bin/env bun
import { defineConfig } from 'importmapify';
import lockfile from './bun.lock' with { type: 'jsonc' };

function lockSpec(name: string): string {
	const entry: Bun.BunLockFilePackageArray | undefined = lockfile.packages[name];
	if (entry === undefined) throw new Error(`bun.lock is missing package "${name}"`);
	return entry[0];
}
const importMapCfg: import('importmapify').WriteImportMapOptions = defineConfig({
	root: import.meta.dir,
	extensions: ['ts', 'js'],
	additionalImports: {
		'@types/bun': `npm:${lockSpec('@types/bun')}`,
		'bun:test': `${`npm:${lockSpec('bun-types')}`}/test.d.ts`,
		bun: `npm:${lockSpec('bun-types')}`,
	},
});

// The build completion hook writes the map after dist is current.
if (import.meta.main) await Bun.$`bun bd`;

export { importMapCfg };
