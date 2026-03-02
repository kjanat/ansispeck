import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

function measure(path: string): { raw: number; gzip: number } {
	const code = readFileSync(resolve(root, path));
	return { raw: code.length, gzip: gzipSync(code).length };
}

function toKB(bytes: number): string {
	return `${(Math.round((bytes / 1024) * 100) / 100).toFixed(2)} KB`;
}

const libs: Array<[string, string]> = [
	['femtocolors', 'dist/index.js'],
	['picocolors', 'node_modules/picocolors/picocolors.js'],
	['colorette', 'node_modules/colorette/index.js'],
	['kleur', 'node_modules/kleur/index.mjs'],
	['kleur/colors', 'node_modules/kleur/colors.mjs'],
	['chalk', 'node_modules/chalk/source/index.js'],
	['ansi-colors', 'node_modules/ansi-colors/index.js'],
];

const rows: Record<string, { raw: string; gzip: string }> = {};
for (const [name, path] of libs) {
	const { raw, gzip } = measure(path);
	rows[name] = { raw: toKB(raw), gzip: toKB(gzip) };
}

console.table(rows);
