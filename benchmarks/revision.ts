import { spawnSync } from 'node:child_process';

interface GitResult {
	readonly output: string | undefined;
	readonly status: number | null;
}

export interface RevisionOptions {
	readonly cwd?: string;
	readonly name: string;
	readonly packageVersion: string;
	readonly repositoryUrl: string;
}

export interface Revision {
	readonly commit: string | undefined;
	readonly description: string;
	readonly isRelease: boolean;
	readonly url: string;
}

function git(cwd: string | undefined, args: string[]): GitResult {
	const result = spawnSync('git', args, { cwd, encoding: 'utf8' });
	const output = result.stdout?.trim();
	return { status: result.status, output: output || undefined };
}

const getNpmUrl = (name: string, version: string | undefined): string =>
	new URL(`/package/${name}${version ? `/v/${version}` : ''}`, 'https://www.npmjs.com').href;
const getCommitUrl = (repositoryUrl: string, commit: string | undefined): string =>
	commit === undefined ? repositoryUrl : `${repositoryUrl}/commit/${commit}`;

export function describeRevision(options: RevisionOptions): Revision {
	const { cwd, name, packageVersion, repositoryUrl } = options;
	const commit = git(cwd, ['rev-parse', 'HEAD']).output;
	const described = git(cwd, ['describe', '--tags', '--always', '--abbrev=7']).output
		?? commit?.slice(0, 7)
		?? packageVersion;
	const status = git(cwd, ['status', '--porcelain=v1', '--untracked-files=normal']);
	const dirty = status.status !== 0 || status.output !== undefined;
	const exactTag = dirty
		? undefined
		: git(cwd, ['describe', '--tags', '--exact-match', '--match', 'v*.*.*', 'HEAD']).output;
	const isRelease = exactTag !== undefined;
	const description = isRelease ? exactTag : `${described}${dirty ? '-dirty' : ''}`;
	const releaseVersion = exactTag?.replace(/^v/, '');
	const npmUrl = getNpmUrl(name, releaseVersion ?? packageVersion);
	const commitUrl = getCommitUrl(repositoryUrl, commit);

	return {
		commit,
		description,
		isRelease,
		url: isRelease ? npmUrl : commitUrl,
	};
}
