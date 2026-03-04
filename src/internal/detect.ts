const processRef = globalThis.process;
const argv: readonly string[] = processRef?.argv ?? [];
const env: Record<string, string | undefined> = processRef?.env ?? {};

/** Detect whether ANSI colors should be enabled for auto entrypoints. */
export const detectColorSupport = (): boolean => {
	if (env.NO_COLOR || argv.includes('--no-color')) return false;
	if (env.FORCE_COLOR || argv.includes('--color')) return true;
	if (processRef?.platform === 'win32') return true;
	if (env.CI) return true;
	if ((processRef?.stdout as { isTTY?: boolean } | undefined)?.isTTY && env.TERM !== 'dumb') return true;
	return false;
};
