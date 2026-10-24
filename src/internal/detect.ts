/**
 * Color-support detection with explicit precedence.
 *
 * @module ansispeck/internal/detect
 */

const processRef = globalThis.process;

/**
 * Whether one variable may be read without failing or prompting.
 *
 * Deno raises `NotCapable` for a variable outside the granted set, and may
 * prompt for one in an interactive session, so detection asks
 * `Deno.permissions.querySync()` first and reads only granted variables.
 * Other runtimes can always read.
 */
const envReadable = (name: string): boolean => {
	const deno: unknown = Reflect.get(globalThis, 'Deno');
	if (typeof deno !== 'object' || deno === null) return true;
	const permissions: unknown = Reflect.get(deno, 'permissions');
	if (typeof permissions !== 'object' || permissions === null) return true;
	const querySync: unknown = Reflect.get(permissions, 'querySync');
	if (typeof querySync !== 'function') return true;
	const status: unknown = Reflect.apply(querySync, permissions, [{ name: 'env', variable: name }]);
	return typeof status === 'object' && status !== null && Reflect.get(status, 'state') === 'granted';
};

/**
 * A read-only view of `env` whose variables read as unset when `readable`
 * refuses them or the read throws. Detection is optional, so an unavailable
 * variable never fails an import.
 */
export const guardEnv = (
	env: Readonly<Record<string, string | undefined>>,
	readable: (name: string) => boolean,
): Readonly<Record<string, string | undefined>> =>
	new Proxy<Record<string, string | undefined>>(
		{},
		{
			get: (_target, key) => {
				if (typeof key !== 'string' || !readable(key)) return undefined;
				try {
					return env[key];
				} catch {
					return undefined;
				}
			},
		},
	);

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
	env: guardEnv(processRef?.env ?? {}, envReadable),
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
	if (argv.includes('--no-hyperlinks')) return false;
	if (argv.includes('--hyperlinks')) return true;
	if (env['NO_HYPERLINKS']) return false;
	if (env['FORCE_HYPERLINKS']) return true;
	if (isTTY && env['TERM'] !== 'dumb') return true;
	return false;
};

/**
 * Detect whether OSC 8 hyperlinks should be emitted.
 *
 * Independent of color support (SGR color and OSC 8 links are separate
 * terminal capabilities). Precedence: explicit `--no-hyperlinks` /
 * `--hyperlinks` flags, then `NO_HYPERLINKS`, then `FORCE_HYPERLINKS`, then
 * TTY detection. A non-interactive stream (CI logs, pipes) gets no links,
 * since captured OSC 8 sequences are noise, not links.
 *
 * @see https://no-hyperlinks.org/
 */
export const detectHyperlinkSupport = (): boolean => detectHyperlinkSupportFor(runtimeContext);
