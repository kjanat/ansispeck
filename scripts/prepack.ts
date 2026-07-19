#!/usr/bin/env bun
import { file, fileURLToPath, write } from 'bun';

const PACKAGE_JSON_PATH = fileURLToPath(import.meta.resolve('#pkg'));
const DTS_PATH = fileURLToPath(new URL('dist/index.d.ts', import.meta.resolve('#pkg')));

function isObjectRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

const parsedPackageJson: unknown = await file(PACKAGE_JSON_PATH).json();
if (!isObjectRecord(parsedPackageJson)) {
	throw new Error('package.json must be a JSON object');
}

delete parsedPackageJson['scripts'];
delete parsedPackageJson['devDependencies'];
delete parsedPackageJson['packageManager'];
delete parsedPackageJson['volta'];

const author = parsedPackageJson['author'];
if (typeof author === 'string') {
	parsedPackageJson['author'] = author.replace(/\s*\(https?:\/\/[^)]+\)\s*$/u, '').trim();
} else if (isObjectRecord(author)) {
	delete author['url'];
}

await write(PACKAGE_JSON_PATH, `${JSON.stringify(parsedPackageJson)}\n`);

const strippedDts = (await file(DTS_PATH).text())
	.replace(/\/\*\*[\s\S]*?\*\//g, '')
	.replace(/^\/\/#[^\n]*\n?/gm, '')
	.replace(/\n{3,}/g, '\n\n')
	.trim();

await write(DTS_PATH, `${strippedDts}\n`);
