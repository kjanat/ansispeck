import { readFileSync, writeFileSync } from 'node:fs';

const PACKAGE_JSON_PATH = 'package.json';
const DTS_PATH = 'dist/index.d.ts';

function isObjectRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

const parsedPackageJson: unknown = JSON.parse(readFileSync(PACKAGE_JSON_PATH, 'utf8'));
if (!isObjectRecord(parsedPackageJson)) {
	throw new Error('package.json must be a JSON object');
}

delete parsedPackageJson.scripts;
delete parsedPackageJson.devDependencies;
delete parsedPackageJson.packageManager;
delete parsedPackageJson.volta;
delete parsedPackageJson.imports;

const author = parsedPackageJson.author;
if (typeof author === 'string') {
	parsedPackageJson.author = author.replace(/\s*\(https?:\/\/[^)]+\)\s*$/u, '').trim();
} else if (isObjectRecord(author)) {
	delete author.url;
}

writeFileSync(PACKAGE_JSON_PATH, `${JSON.stringify(parsedPackageJson)}\n`);

const strippedDts = readFileSync(DTS_PATH, 'utf8')
	.replace(/\/\*\*[\s\S]*?\*\//g, '')
	.replace(/^\/\/#[^\n]*\n?/gm, '')
	.replace(/\n{3,}/g, '\n\n')
	.trim();

writeFileSync(DTS_PATH, `${strippedDts}\n`);
