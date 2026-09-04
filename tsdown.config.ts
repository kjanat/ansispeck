import { $, env, file, fileURLToPath, stderr, write } from 'bun';
import { writeImportMap } from 'importmapify';
import { sortPackageJson } from 'sort-package-json';
import { defineConfig } from 'tsdown';
import pkg from '#pkg' with { type: 'json' };
import { importMapCfg } from './importmapify.config.ts';

const config: import('tsdown').UserConfig = defineConfig({
	entry: {
		index: 'src/index.ts',
		'*': ['src/*.ts', '!src/index.ts', '!src/types.ts'],
	},
	dts: true,
	exports: {
		async customExports(exports) {
			for (const [key, value] of Object.entries(exports)) {
				if (typeof value !== 'string') continue;
				const types = value.replace(/\.(?<prefix>c|m)?js$/, '.d.$<prefix>ts');
				if (types === value || !(await file(types).exists())) continue;
				exports[key] = { types, default: value };
			}
			return exports;
		},
		exclude: [/internal/],
	},
	hooks: {
		'build:done': async () => {
			const filePath = fileURLToPath(import.meta.resolve('#pkg'));
			const contents = await file(filePath).text();
			const sorted = sortPackageJson(contents);
			if (sorted !== contents) {
				await write(filePath, sorted);
			}
			await $`npm pkg fix`;
			await $`dprint fmt package.json`;
			if (typeof pkg['repository'] === 'string') {
				await $`bun pm pkg set repository=${pkg.repository}`.env(env);
			}
			const map = writeImportMap(importMapCfg);
			stderr.write(`Wrote ${map}\n`);
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
