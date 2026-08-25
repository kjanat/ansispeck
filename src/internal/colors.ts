/**
 * Plain-formatter color set factory shared by `auto`, `raw`, and `noop`.
 *
 * @module ansispeck/internal/colors
 */

import type { Wrap } from '#internal/ansi.ts';
import {
	BG_CLOSE,
	FG_CLOSE,
	bg256Open,
	bgHexOpen,
	bgRgbOpen,
	fg256Open,
	fmt,
	hexOpen,
	linkOpen,
	mapPalette,
	mkLink,
	rgbOpen,
	text,
} from '#internal/ansi.ts';
import { detectColorSupport } from '#internal/detect.ts';
import { space, tab } from '#internal/whitespace.ts';
import type { Colors, Formatter } from '#types';

const noop: Formatter = text;

/**
 * Create a color set with explicit enable toggles.
 *
 * Hyperlink emission is independent of color and defaults to the color
 * toggle, so `createColors(true)`/`createColors(false)` stay all-on/all-off.
 * Pass `hyperlinksEnabled` separately to decouple them — the auto entrypoints
 * do this with {@link [internal/detect.ts].detectHyperlinkSupport | detectHyperlinkSupport}.
 *
 * @see https://no-hyperlinks.org/
 */
export function createColors(
	enabled: boolean = detectColorSupport(),
	hyperlinksEnabled: boolean = enabled,
): Colors {
	const f: Wrap<Formatter> = enabled ? fmt : (): Formatter => noop;
	return {
		...mapPalette(f),
		isColorSupported: enabled,
		isHyperlinkSupported: hyperlinksEnabled,

		link: mkLink(hyperlinksEnabled ? linkOpen : (_url, body) => body),
		space,
		tab,

		fg256: (n) => f(fg256Open(n), FG_CLOSE),
		bg256: (n) => f(bg256Open(n), BG_CLOSE),
		rgb: (r, g, b) => f(rgbOpen(r, g, b), FG_CLOSE),
		bgRgb: (r, g, b) => f(bgRgbOpen(r, g, b), BG_CLOSE),
		hex: (color) => f(hexOpen(color), FG_CLOSE),
		bgHex: (color) => f(bgHexOpen(color), BG_CLOSE),
	};
}
