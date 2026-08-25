import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import { packageRepositoryUrl } from 'dreamcli';
import { describeRevision } from '#bench/revision';
import { repository } from '#pkg';

// biome-ignore lint/style/noNonNullAssertion: shut up
const REPOSITORY_URL = packageRepositoryUrl({ repository })!;
const git = (directory: string, args: string[]): void => {
	execFileSync('git', ['-C', directory, ...args], { stdio: 'ignore' });
};

function revision(directory: string): ReturnType<typeof describeRevision> {
	return describeRevision({
		cwd: directory,
		name: 'ansispeck',
		packageVersion: '0.0.0',
		repositoryUrl: REPOSITORY_URL,
	});
}

describe('describeRevision', () => {
	let directory = '';

	beforeEach(() => {
		directory = mkdtempSync(join(tmpdir(), 'ansispeck-revision-'));
		git(directory, ['init', '--quiet']);
		git(directory, ['config', 'user.email', 'test@example.com']);
		git(directory, ['config', 'user.name', 'Test']);
		git(directory, ['config', 'commit.gpgSign', 'false']);
		git(directory, ['config', 'tag.gpgSign', 'false']);
		writeFileSync(join(directory, 'fixture.txt'), 'tagged\n');
		git(directory, ['add', 'fixture.txt']);
		git(directory, ['commit', '--quiet', '-m', 'tagged']);
		git(directory, ['tag', '--no-sign', 'v1.2.3']);
	});

	afterEach(() => {
		rmSync(directory, { recursive: true });
	});

	test('links a clean exact release tag to npm', () => {
		expect(revision(directory)).toMatchObject({
			description: 'v1.2.3',
			isRelease: true,
			url: 'https://npm.im/package/ansispeck/v/1.2.3',
		});
	});

	test('describes and links a commit after the release tag', () => {
		writeFileSync(join(directory, 'fixture.txt'), 'ahead\n');
		git(directory, ['add', 'fixture.txt']);
		git(directory, ['commit', '--quiet', '-m', 'ahead']);

		const result = revision(directory);
		expect(result.description).toMatch(/^v1\.2\.3-1-g[0-9a-f]{7}$/);
		expect(result.isRelease).toBe(false);
		expect(result.url).toBe(`${REPOSITORY_URL}/commit/${result.commit}`);
	});

	test('does not treat a dirty tagged checkout as the published package', () => {
		writeFileSync(join(directory, 'fixture.txt'), 'dirty\n');

		const result = revision(directory);
		expect(result.description).toBe('v1.2.3-dirty');
		expect(result.isRelease).toBe(false);
		expect(result.url).toBe(`${REPOSITORY_URL}/commit/${result.commit}`);
	});
});
