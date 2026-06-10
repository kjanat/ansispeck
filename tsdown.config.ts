import { existsSync } from 'node:fs';
import { defineConfig } from 'tsdown';

export default defineConfig({
	entry: {
		index: './src/index.ts',
		'*': ['./src/*.ts', '!./src/index.ts', '!./src/types.ts'],
	},
	dts: true,
	exports: {
		customExports(exports) {
			for (const [key, value] of Object.entries(exports)) {
				if (typeof value !== 'string') continue;
				const types = value.replace(/\.([cm]?)js$/, '.d.$1ts');
				if (types === value || !existsSync(types)) continue;
				exports[key] = { types, default: value };
			}
			return exports;
		},
	},
	clean: true,
	target: 'esnext',
	platform: 'neutral',
	onSuccess: 'run fmt package.json',
	minify: true,
	outputOptions: {
		codeSplitting: { groups: [{ name: 'internal', test: /[\\/]src[\\/]internal[\\/](?:ansi|colors|detect)\./ }] },
	},
	publint: true,
	attw: { ignoreRules: ['cjs-resolves-to-esm', 'no-resolution'] },
});
