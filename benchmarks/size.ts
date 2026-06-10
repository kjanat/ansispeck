import { table, warn } from 'node:console';
import { readFile } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';

const measure = async (url: string): Promise<{ raw: number; gzip: number }> => {
	const code = await readFile(new URL(url));
	return { raw: code.length, gzip: gzipSync(code).length };
};

const toKB = (bytes: number): string => `${(Math.round((bytes / 1024) * 100) / 100).toFixed(2)} KB`;

const names = ['#dist/ansispeck', 'picocolors', 'colorette', 'kleur', 'kleur/colors', 'chalk', 'ansi-colors'];

const results = await Promise.all(names.map(async name => {
	try {
		const { raw, gzip } = await measure(import.meta.resolve(name));
		name = name.includes('ansispeck') ? 'ansispeck' : name;
		return [name, { raw: toKB(raw), gzip: toKB(gzip) }] as const;
	} catch (error) {
		if (name.includes('ansispeck')) throw error;
		const detail = error instanceof Error ? error.message : String(error);
		warn(`[size] skipped ${name}: ${detail}`);
		return [name, { raw: 'N/A', gzip: 'N/A' }] as const;
	}
}));

table(Object.fromEntries(results));
