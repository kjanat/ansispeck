/**
 * Color-support detection with explicit precedence.
 *
 * @module ansispeck/internal/detect
 */

const processRef = globalThis.process;

/** Runtime inputs used to determine terminal feature support. */
export interface DetectionContext {
	/** Process arguments used for explicit feature flags. */
	readonly argv: readonly string[];
	/** Environment variables used for explicit flags and terminal hints. */
	readonly env: Readonly<Record<string, string | undefined>>;
	/** Whether standard output is attached to a terminal. */
	readonly isTTY: boolean;
	/** Runtime platform identifier, when available. */
	readonly platform: string | undefined;
}

const runtimeContext: DetectionContext = {
	argv: processRef?.argv ?? [],
	env: processRef?.env ?? {},
	get isTTY(): boolean {
		return processRef?.stdout?.isTTY === true;
	},
	platform: processRef?.platform,
};

/** Evaluate color support for explicit runtime inputs. */
export const detectColorSupportFor = ({ argv, env, isTTY, platform }: DetectionContext): boolean => {
	if (env['FORCE_COLOR'] || argv.includes('--color')) return true;
	if (env['NO_COLOR'] || argv.includes('--no-color')) return false;
	if (platform === 'win32') return true;
	if (env['CI']) return true;
	if (isTTY && env['TERM'] !== 'dumb') return true;
	return false;
};

/**
 * Detect whether ANSI colors should be enabled.
 *
 * Precedence: explicit force (`FORCE_COLOR`/`--color`) beats explicit
 * disable (`NO_COLOR`/`--no-color`), which beats platform heuristics.
 *
 * @see https://force-color.org/
 * @see https://no-color.org/
 */
export const detectColorSupport = (): boolean => detectColorSupportFor(runtimeContext);

/** Evaluate OSC 8 hyperlink support for explicit runtime inputs. */
export const detectHyperlinkSupportFor = ({ argv, env, isTTY }: DetectionContext): boolean => {
	if (env['NO_HYPERLINKS'] || argv.includes('--no-hyperlinks')) return false;
	if (env['FORCE_HYPERLINKS'] || argv.includes('--hyperlinks')) return true;
	if (isTTY && env['TERM'] !== 'dumb') return true;
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
export const detectHyperlinkSupport = (): boolean => detectHyperlinkSupportFor(runtimeContext);
