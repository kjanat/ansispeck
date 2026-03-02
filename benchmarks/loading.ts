import { bench, group, run } from 'mitata';

const DEFAULT_COUNT = 1;

export function register({ count = DEFAULT_COUNT } = {}): void {
	group(() => {
		bench('femtocolors', async () => {
			for (let i = 0; i < count; i++) await import('../dist/index.js');
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
