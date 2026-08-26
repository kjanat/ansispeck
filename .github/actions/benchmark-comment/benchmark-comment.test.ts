import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { env } from 'node:process';
import { afterEach, describe, expect, test } from 'bun:test';
import { BENCHMARK_COMMENT_MARKER, benchmarkCommentBody, updateBenchmarkComment } from '#action';

const HEAD_SHA = '0123456789abcdef0123456789abcdef01234567';
const RUN_URL = 'https://github.com/kjanat/ansispeck/actions/runs/123';
const previousReportPath = env.BENCHMARK_REPORT_PATH;
let directory = '';

afterEach(async () => {
	if (previousReportPath === undefined) delete env.BENCHMARK_REPORT_PATH;
	else env.BENCHMARK_REPORT_PATH = previousReportPath;
	if (directory) await rm(directory, { recursive: true });
	directory = '';
});

type CommentFixture = { body?: string | null; id: number };
type CreateCommentParameters = {
	body: string;
	issue_number: number;
	owner: string;
	repo: string;
};
type UpdateCommentParameters = {
	body: string;
	comment_id: number;
	owner: string;
	repo: string;
};

function harness(existingComments: CommentFixture[] = [], pullRequestHead = HEAD_SHA) {
	const calls: {
		create: CreateCommentParameters[];
		update: UpdateCommentParameters[];
	} = { create: [], update: [] };
	const core = { info() {} };
	const context = {
		payload: {
			workflow_run: {
				head_sha: HEAD_SHA,
				html_url: RUN_URL,
				pull_requests: [{ number: 17 }],
			},
		},
		repo: { owner: 'kjanat', repo: 'ansispeck' },
		serverUrl: 'https://github.com',
	};
	const github = {
		paginate: async () => existingComments,
		rest: {
			issues: {
				createComment: async (parameters: CreateCommentParameters) => {
					calls.create.push(parameters);
					return { data: { id: 2 } };
				},
				listComments() {},
				updateComment: async (parameters: UpdateCommentParameters) => {
					calls.update.push(parameters);
				},
			},
			pulls: {
				get: async () => ({ data: { head: { sha: pullRequestHead } } }),
			},
		},
	};
	return { calls, core, context, github };
}

async function writeReport() {
	directory = await mkdtemp(join(tmpdir(), 'ansispeck-comment-'));
	const path = join(directory, 'benchmark-report.md');
	await writeFile(path, '## Size\n\n| Package | Runtime |\n| --- | --- |\n');
	env.BENCHMARK_REPORT_PATH = path;
}

describe('benchmark PR comment', () => {
	test('renders the marker and provenance', () => {
		const body = benchmarkCommentBody({
			marker: BENCHMARK_COMMENT_MARKER,
			report: '## Size\n',
			revisionUrl: `https://github.com/kjanat/ansispeck/commit/${HEAD_SHA}`,
			runUrl: RUN_URL,
			shortSha: HEAD_SHA.substring(0, 7),
		});

		expect(body).toContain(BENCHMARK_COMMENT_MARKER);
		expect(body).toContain('PR head: [`0123456`]');
		expect(body).toContain(`[workflow run](${RUN_URL})`);
		expect(body).toContain('## Size');
	});

	test('creates the first tracking comment', async () => {
		await writeReport();
		const fixture = harness();
		await updateBenchmarkComment(fixture);

		expect(fixture.calls.create).toHaveLength(1);
		expect(fixture.calls.update).toHaveLength(0);
		expect(fixture.calls.create[0]?.body).toContain(BENCHMARK_COMMENT_MARKER);
	});

	test('updates the existing marked comment', async () => {
		await writeReport();
		const fixture = harness([{ id: 41, body: `${BENCHMARK_COMMENT_MARKER}\nold` }]);
		await updateBenchmarkComment(fixture);

		expect(fixture.calls.create).toHaveLength(0);
		expect(fixture.calls.update).toHaveLength(1);
		expect(fixture.calls.update[0]?.comment_id).toBe(41);
	});

	test('does not overwrite the current comment with a stale run', async () => {
		await writeReport();
		const fixture = harness([], 'fedcba9876543210fedcba9876543210fedcba98');
		await updateBenchmarkComment(fixture);

		expect(fixture.calls.create).toHaveLength(0);
		expect(fixture.calls.update).toHaveLength(0);
	});
});
