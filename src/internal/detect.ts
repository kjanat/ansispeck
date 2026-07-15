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

/**
 * Detect whether OSC 8 hyperlinks should be emitted.
 *
 * Independent of color support (SGR color and OSC 8 links are separate
 * terminal capabilities). Precedence: explicit disable (`NO_HYPERLINKS`)
 * beats explicit force (`FORCE_HYPERLINKS`) — the reverse of the color
 * convention — which beats TTY detection. A non-interactive stream (CI logs,
 * pipes) gets no links, since captured OSC 8 sequences are noise, not links.
 *
 * @see https://no-hyperlinks.org/
 */
export const detectHyperlinkSupport = (): boolean => {
	if (env.NO_HYPERLINKS || argv.includes('--no-hyperlinks')) return false;
	if (env.FORCE_HYPERLINKS || argv.includes('--hyperlinks')) return true;
	if (processRef?.stdout?.isTTY && env.TERM !== 'dumb') return true;
	return false;
};
