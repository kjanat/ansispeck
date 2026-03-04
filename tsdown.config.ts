import { defineConfig, type UserConfigFn } from 'tsdown';

const config: UserConfigFn = defineConfig(
	(_, { ci }) => ({
		ci,
		entry: {
			index: 'src/index.ts',
			auto: 'src/auto.ts',
			raw: 'src/raw.ts',
			noop: 'src/noop.ts',
			safe: 'src/safe.ts',
			rope: 'src/rope.ts',
		},
		dts: {
			oxc: true,
			enabled: true,
			sourcemap: false,
			resolver: 'oxc',
		},
		exports: true,
		clean: true,
		target: 'esnext',
		platform: 'neutral',
		onSuccess: 'bun fmt package.json',
		minify: true,
		publint: true,
		attw: {
			ignoreRules: ['cjs-resolves-to-esm', 'no-resolution'],
		},
	}),
);

export default config;
