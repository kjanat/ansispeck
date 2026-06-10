/**
 * @module ansispeck/internal/detect
 * Color-support detection with explicit precedence.
 */

const processRef = globalThis.process;
const argv: readonly string[] = processRef?.argv ?? [];
const env: Record<string, string | undefined> = processRef?.env ?? {};

/**
 * Detect whether ANSI colors should be enabled.
 *
 * Precedence: explicit force (`FORCE_COLOR`/`--color`) beats explicit
 * disable (`NO_COLOR`/`--no-color`), which beats platform heuristics.
 *
 * @see https://force-color.org/
 * @see https://no-color.org/
 */
export const detectColorSupport = (): boolean => {
	if (env.FORCE_COLOR || argv.includes('--color')) return true;
	if (env.NO_COLOR || argv.includes('--no-color')) return false;
	if (processRef?.platform === 'win32') return true;
	if (env.CI) return true;
	if (processRef?.stdout?.isTTY && env.TERM !== 'dumb') return true;
	return false;
};
