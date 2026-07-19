#!/usr/bin/env bun
/// <reference types="bun" />

import { cpSync } from 'node:fs';
import { basename, dirname, join, relative, resolve } from 'node:path';

const ROOT = dirname(import.meta.dir);
const STAGING = join(ROOT, '.cache', 'npm-package');

await Bun.$`run -q build:quiet`.quiet();

function isObjectRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function packageFile(entry: string): string {
	const path = entry.replace(/^\/+/u, '');
	const source = resolve(ROOT, path);
	const fromRoot = relative(ROOT, source);
	if (path.length === 0 || fromRoot.startsWith('..')) {
		throw new Error(`Invalid package file path: ${entry}`);
	}
	return path;
}

function packFilename(output: string): string {
	const parsed: unknown = JSON.parse(output);
	if (!Array.isArray(parsed) || parsed.length !== 1) {
		throw new Error('npm pack returned an unexpected result');
	}
	const result: unknown = parsed[0];
	if (!isObjectRecord(result) || typeof result['filename'] !== 'string') {
		throw new Error('npm pack did not report a filename');
	}
	return result['filename'];
}

const parsedPackageJson = await Bun.file(join(ROOT, 'package.json')).json();
if (!isObjectRecord(parsedPackageJson)) {
	throw new Error('package.json must be a JSON object');
}

const files = parsedPackageJson['files'];
if (!Array.isArray(files) || !files.every((entry) => typeof entry === 'string')) {
	throw new Error('package.json must contain a string "files" array');
}

await Bun.$`rm -rf ${STAGING}`;
await Bun.$`mkdir -p ${STAGING}`;

for (const entry of files) {
	const path = packageFile(entry);
	if (path === 'package.json') continue;
	const destination = join(STAGING, path);
	await Bun.$`mkdir -p ${dirname(destination)}`;
	cpSync(join(ROOT, path), destination, { recursive: true });
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

await Bun.write(join(STAGING, 'package.json'), `${JSON.stringify(parsedPackageJson)}\n`);

const dtsPath = join(STAGING, 'dist', 'index.d.ts');
const strippedDts = (await Bun.file(dtsPath).text())
	.replace(/\/\*\*[\s\S]*?\*\//g, '')
	.replace(/^\/\/#[^\n]*\n?/gm, '')
	.replace(/\n{3,}/g, '\n\n')
	.trim();

await Bun.write(dtsPath, `${strippedDts}\n`);

const output = await Bun.$`npm pack ${STAGING} --ignore-scripts --json --pack-destination ${ROOT}`.text();
const tarball = join(ROOT, basename(packFilename(output)));
process.stdout.write(`${tarball}\n`);
