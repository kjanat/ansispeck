// @ts-check

import { readFile } from 'node:fs/promises';
import { env } from 'node:process';

export const BENCHMARK_COMMENT_MARKER = '<!-- ansispeck-benchmark-report -->';
const MAX_COMMENT_BYTES = 65_000;

/** @param {unknown} value @returns {value is Record<string, unknown>} */
function isRecord(value) {
	return typeof value === 'object' && value !== null;
}

/** @param {unknown} value @param {string} label @returns {Record<string, unknown>} */
function requireRecord(value, label) {
	if (isRecord(value)) return value;
	throw new Error(`Expected ${label} to be an object`);
}

/** @param {unknown} value @param {string} label @returns {string} */
function requireString(value, label) {
	if (typeof value === 'string') return value;
	throw new Error(`Expected ${label} to be a string`);
}

/** @param {unknown} value @param {string} label @returns {number} */
function requireNumber(value, label) {
	if (typeof value === 'number') return value;
	throw new Error(`Expected ${label} to be a number`);
}

/** @param {unknown} payload @returns {{ headSha: string, number: number, runUrl: string }} */
function parseWorkflowRun(payload) {
	const event = requireRecord(payload, 'event payload');
	const workflowRun = requireRecord(event.workflow_run, 'workflow_run');
	const pullRequests = workflowRun.pull_requests;
	if (!Array.isArray(pullRequests) || pullRequests.length !== 1) {
		throw new Error('Expected workflow_run.pull_requests to contain one pull request');
	}
	const pullRequest = requireRecord(pullRequests[0], 'workflow_run.pull_requests[0]');

	return {
		headSha: requireString(workflowRun.head_sha, 'workflow_run.head_sha'),
		number: requireNumber(pullRequest.number, 'workflow_run.pull_requests[0].number'),
		runUrl: requireString(workflowRun.html_url, 'workflow_run.html_url'),
	};
}

/**
 * @param {{ marker: string, report: string, revisionUrl: string, runUrl: string, shortSha: string }} options
 * @returns {string}
 */
export function benchmarkCommentBody({ marker, report, revisionUrl, runUrl, shortSha }) {
	return `${marker}

## Benchmark results

> PR head: [\`${shortSha}\`](${revisionUrl}) · [workflow run](${runUrl})

${report.trim()}
`;
}

/**
 * @typedef {{ body?: string | null, id: number }} IssueComment
 * @typedef {{ body: string, issue_number: number, owner: string, repo: string }} CreateCommentParameters
 * @typedef {{ body: string, comment_id: number, owner: string, repo: string }} UpdateCommentParameters
 * @typedef {{ issue_number: number, owner: string, repo: string }} ListCommentsParameters
 * @typedef {{ owner: string, pull_number: number, repo: string }} GetPullParameters
 * @typedef {{
 *   core: { info(message: string): void },
 *   context: {
 *     payload: unknown,
 *     repo: { owner: string, repo: string },
 *     serverUrl: string,
 *   },
 *   github: {
 *     paginate(
 *       route: (...args: never[]) => unknown,
 *       parameters: ListCommentsParameters,
 *     ): Promise<IssueComment[]>,
 *     rest: {
 *       issues: {
 *         createComment(parameters: CreateCommentParameters): Promise<{ data: { id: number } }>,
 *         listComments(...args: never[]): unknown,
 *         updateComment(parameters: UpdateCommentParameters): Promise<unknown>,
 *       },
 *       pulls: {
 *         get(parameters: GetPullParameters): Promise<{ data: { head: { sha: string } } }>,
 *       },
 *     },
 *   },
 * }} BenchmarkCommentArguments
 */

/**
 * @param {BenchmarkCommentArguments} args
 * @returns {Promise<void>}
 */
export async function updateBenchmarkComment({ core, context, github }) {
	const { owner, repo } = context.repo;
	const workflowRun = parseWorkflowRun(context.payload);
	const reportPath = env.BENCHMARK_REPORT_PATH;
	if (!reportPath) throw new Error('BENCHMARK_REPORT_PATH is required');

	const { data: pullRequest } = await github.rest.pulls.get({
		owner,
		repo,
		pull_number: workflowRun.number,
	});
	if (pullRequest.head.sha !== workflowRun.headSha) {
		core.info(`Skipping stale benchmark for ${workflowRun.headSha}; PR head is ${pullRequest.head.sha}`);
		return;
	}

	const report = await readFile(reportPath, 'utf8');
	const shortSha = workflowRun.headSha.substring(0, 7);
	const body = benchmarkCommentBody({
		marker: BENCHMARK_COMMENT_MARKER,
		report,
		revisionUrl: `${context.serverUrl}/${owner}/${repo}/commit/${workflowRun.headSha}`,
		runUrl: workflowRun.runUrl,
		shortSha,
	});
	if (Buffer.byteLength(body) > MAX_COMMENT_BYTES) {
		throw new Error(`Benchmark comment exceeds ${MAX_COMMENT_BYTES} bytes`);
	}

	const comments = await github.paginate(
		github.rest.issues.listComments,
		{ owner, repo, issue_number: workflowRun.number },
	);
	const existingComment = comments.find((comment) => comment.body?.includes(BENCHMARK_COMMENT_MARKER));

	if (existingComment) {
		await github.rest.issues.updateComment({
			owner,
			repo,
			comment_id: existingComment.id,
			body,
		});
		core.info(`Updated comment ${existingComment.id}`);
		return;
	}

	const { data: newComment } = await github.rest.issues.createComment({
		owner,
		repo,
		issue_number: workflowRun.number,
		body,
	});
	core.info(`Created comment ${newComment.id}`);
}

/** @param {import('@actions/github-script').AsyncFunctionArguments} args */
export default async function comment(args) {
	await updateBenchmarkComment(args);
}
