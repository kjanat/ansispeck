import { defineConfig } from 'tsdown';

export default defineConfig({
	entry: 'src/index.ts',
	dts: true,
	exports: true,
	clean: true,
	target: 'esnext',
	onSuccess: 'bun fmt package.json',
	unbundle: true,
	minify: true,
	publint: true,
	attw: {
		ignoreRules: ['cjs-resolves-to-esm', 'no-resolution'],
	},
});
