// deno-lint-ignore-file no-sloppy-imports
import { bench, group, run } from 'mitata';

const DEFAULT_COUNT = 1;

export function register({ count = DEFAULT_COUNT }: { count?: number } = {}): void {
	if (count !== 1) {
		throw new Error('loading benchmark requires count=1 to measure cold load cost');
	}
	group(() => {
		bench('ansispeck', async () => {
			for (let i = 0; i < count; i++) await import('#ansispeck-dist/index');
		});
		bench('ansispeck/auto', async () => {
			for (let i = 0; i < count; i++) await import('#ansispeck-dist/auto');
		});
		bench('ansispeck/raw', async () => {
			for (let i = 0; i < count; i++) await import('#ansispeck-dist/raw');
		});
		bench('ansispeck/safe', async () => {
			for (let i = 0; i < count; i++) await import('#ansispeck-dist/safe');
		});
		bench('ansispeck/rope', async () => {
			for (let i = 0; i < count; i++) await import('#ansispeck-dist/rope');
		});
		bench('ansispeck/noop', async () => {
			for (let i = 0; i < count; i++) await import('#ansispeck-dist/noop');
		});
		bench('picocolors', async () => {
			for (let i = 0; i < count; i++) await import('picocolors');
		});
		bench('colorette', async () => {
			for (let i = 0; i < count; i++) await import('colorette');
		});
		bench('kleur', async () => {
			for (let i = 0; i < count; i++) await import('kleur');
		});
		bench('kleur/colors', async () => {
			for (let i = 0; i < count; i++) await import('kleur/colors');
		});
		bench('chalk', async () => {
			for (let i = 0; i < count; i++) await import('chalk');
		});
		bench('ansi-colors', async () => {
			for (let i = 0; i < count; i++) await import('ansi-colors');
		});
	});
}

if (import.meta.main) {
	register();
	await run();
}
