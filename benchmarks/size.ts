import { table, warn } from 'node:console';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { gzipSync } from 'node:zlib';

const root = dirname(import.meta.dirname);
function measure(path: string): { raw: number; gzip: number } {
	const code = readFileSync(resolve(root, path));
	return { raw: code.length, gzip: gzipSync(code).length };
}

function isFirstParty(path: string): boolean {
	return !path.startsWith('node_modules/');
}

function toKB(bytes: number): string {
	return `${(Math.round((bytes / 1024) * 100) / 100).toFixed(2)} KB`;
}

const libs: Array<[string, string]> = [
	['ansispeck', 'dist/index.js'],
	['picocolors', 'node_modules/picocolors/picocolors.js'],
	['colorette', 'node_modules/colorette/index.js'],
	['kleur', 'node_modules/kleur/index.mjs'],
	['kleur/colors', 'node_modules/kleur/colors.mjs'],
	['chalk', 'node_modules/chalk/source/index.js'],
	['ansi-colors', 'node_modules/ansi-colors/index.js'],
];

const rows: Record<string, { raw: string; gzip: string }> = {};
for (const [name, path] of libs) {
	try {
		const { raw, gzip } = measure(path);
		rows[name] = { raw: toKB(raw), gzip: toKB(gzip) };
	} catch (error) {
		const detail = error instanceof Error ? error.message : String(error);
		warn(`[size] skipped ${name} (${path}): ${detail}`);
		if (isFirstParty(path)) {
			throw error;
		}
		rows[name] = { raw: 'N/A', gzip: 'N/A' };
	}
}

table(rows);
