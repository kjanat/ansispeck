import { env as hostEnv } from 'node:process';
import { fileURLToPath } from 'node:url';
import { describe, expect, test } from 'bun:test';

const deno = Bun.which('deno');
const root = fileURLToPath(new URL('..', import.meta.url));
const probe = fileURLToPath(new URL('fixtures/deno-import-probe.ts', import.meta.url));

/** Run the import probe under Deno with the given permission flags. */
const runProbe = (permissions: readonly string[], env: Record<string, string> = {}) => {
	const result = Bun.spawnSync(
		[
			deno ?? 'deno',
			'run',
			'--no-prompt',
			'--no-lock',
			'--no-config',
			'--import-map',
			'import_map.json',
			...permissions,
			probe,
		],
		{ cwd: root, env: { PATH: hostEnv['PATH'] ?? '', NO_COLOR: '1', ...env } },
	);
	return {
		exitCode: result.exitCode,
		stdout: result.stdout.toString(),
		stderr: result.stderr.toString(),
	};
};

describe.skipIf(deno === null)('Deno import permissions', () => {
	test('imports without any env grant', () => {
		const result = runProbe([]);
		expect(result.stderr).not.toContain('NotCapable');
		expect(result.exitCode).toBe(0);
		expect(JSON.parse(result.stdout)).toEqual({
			color: false,
			hyperlinks: false,
			safe: false,
			rope: 'function',
		});
	});

	test('honors only the granted variables under a scoped grant', () => {
		const result = runProbe(['--allow-env=FORCE_COLOR'], { FORCE_COLOR: '1' });
		expect(result.exitCode).toBe(0);
		expect(JSON.parse(result.stdout)).toMatchObject({ color: true, hyperlinks: false });
	});

	test('reads every variable under a full grant', () => {
		const result = runProbe(['--allow-env'], { FORCE_COLOR: '1', FORCE_HYPERLINKS: '1' });
		expect(result.exitCode).toBe(0);
		expect(JSON.parse(result.stdout)).toMatchObject({ color: true, hyperlinks: true });
	});
});
