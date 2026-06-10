import { defineConfig } from 'tsdown';

export default defineConfig({
	entry: 'src/index.ts',
	dts: true,
	exports: {
		customExports(exports) {
			exports['.'] = {
				types: './dist/index.d.ts',
				default: './dist/index.js',
			};
			return exports;
		},
	},
	clean: true,
	target: 'esnext',
	platform: 'neutral',
	onSuccess: 'bun fmt package.json',
	unbundle: true,
	minify: true,
	publint: true,
	attw: {
		ignoreRules: ['cjs-resolves-to-esm', 'no-resolution'],
	},
});
