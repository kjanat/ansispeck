import exec from 'node:child_process';
import fs from 'node:fs/promises';
import { sortPackageJson } from 'sort-package-json';
import { defineConfig } from 'tsdown';

export default defineConfig({
	entry: {
		index: './src/index.ts',
		'*': ['./src/*.ts', '!./src/index.ts', '!./src/types.ts'],
	},
	dts: true,
	exports: {
		async customExports(exports) {
			for (const [key, value] of Object.entries(exports)) {
				if (typeof value !== 'string') continue;
				const types = value.replace(/\.([cm]?)js$/, '.d.$1ts');
				if (types === value || !(fs.access(types))) continue;
				exports[key] = { types, default: value };
			}
			return exports;
		},
	},
	hooks: {
		'build:done': async () => {
			try {
				const filePath = new URL('./package.json', import.meta.url);
				const contents = await fs.readFile(filePath, { encoding: 'utf8' });
				await fs.writeFile('package.json', sortPackageJson(contents), { encoding: 'utf8' });
				exec.execFile('npm', ['pkg', 'fix']);
				exec.execFile('dprint', ['fmt', 'package.json']);
			} catch (err) {
				console.error('Failed to sort package.json:', err);
			}
		},
	},
	clean: true,
	target: 'esnext',
	platform: 'neutral',
	minify: true,
	outputOptions: {
		codeSplitting: { groups: [{ name: 'internal', test: /[\\/]src[\\/]internal[\\/](?:ansi|colors|detect)\.ts$/ }] },
	},
	publint: 'ci-only',
	attw: { profile: 'esm-only', enabled: 'ci-only' },
});
