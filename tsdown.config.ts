import { execFileSync } from 'node:child_process';
import console from 'node:console';
import { existsSync } from 'node:fs';
import fs from 'node:fs/promises';
import { URL } from 'node:url';
import { writeImportMap } from 'importmapify';
import { sortPackageJson } from 'sort-package-json';
import type { UserConfig } from 'tsdown';
import { defineConfig } from 'tsdown';
import pkg from '#pkg' with { type: 'json' };
import { importMapCfg } from './importmapify.config.ts';

const config: UserConfig = defineConfig({
	entry: {
		index: 'src/index.ts',
		'*': ['src/*.ts', '!src/index.ts', '!src/types.ts'],
	},
	dts: true,
	exports: {
		customExports(exports) {
			for (const [key, value] of Object.entries(exports)) {
				if (typeof value !== 'string') continue;
				const types = value.replace(/\.(?<prefix>c|m)?js$/, '.d.$<prefix>ts');
				if (types === value || !existsSync(new URL(types, import.meta.url))) continue;
				exports[key] = { types, default: value };
			}
			return exports;
		},
		exclude: [/internal/],
	},
	hooks: {
		'build:done': async () => {
			try {
				const filePath = new URL('./package.json', import.meta.url);
				const contents = await fs.readFile(filePath, { encoding: 'utf8' });
				await fs.writeFile('package.json', sortPackageJson(contents), { encoding: 'utf8' });
				execFileSync('npm', ['pkg', 'fix'], { stdio: 'inherit' });
				execFileSync('dprint', ['fmt', 'package.json'], { stdio: 'inherit' });
				if (typeof pkg['repository'] === 'string') {
					execFileSync('bun', ['pm', 'pkg', 'set', `repository=${pkg.repository}`]);
				}
				const map = writeImportMap(importMapCfg);
				process.stderr.write(map + '\n');
			} catch (err) {
				console.error('Failed to sort package.json:', err);
			}
		},
	},
	clean: true,
	target: 'esnext',
	platform: 'neutral',
	minify: true,
	hash: false,
	outputOptions: {
		codeSplitting: {
			groups: [{ name: 'internal', test: /[\\/]src[\\/]internal[\\/](?:ansi|colors|default|detect)\.ts$/ }],
		},
	},
	publint: 'ci-only',
	attw: { profile: 'esm-only', enabled: 'ci-only' },
});

export default config;
