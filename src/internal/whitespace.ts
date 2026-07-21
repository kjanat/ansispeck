/** Whitespace convenience helpers shared by every public entrypoint. */

function repeat(character: string, count: number): string {
	if (!Number.isSafeInteger(count) || count < 0) {
		throw new RangeError('count must be a non-negative safe integer');
	}
	return character.repeat(count);
}

/** Produce one space, or `count` spaces when provided. */
export const space = (count: number = 1): string => repeat(' ', count);

/** Produce one tab, or `count` tabs when provided. */
export const tab = (count: number = 1): string => repeat('\t', count);
