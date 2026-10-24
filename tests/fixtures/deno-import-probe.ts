/**
 * Imports every auto-detecting entrypoint under whatever permissions the
 * Deno subprocess was granted, then reports the detected support.
 */
import index from '#ansispeck';
import rope from '#ansispeck/rope';
import safe from '#ansispeck/safe';

console.log(
	JSON.stringify({
		color: index.isColorSupported,
		hyperlinks: index.isHyperlinkSupported,
		safe: safe.isColorSupported,
		rope: typeof rope.render,
	}),
);
