/**
 * Template-tag formatter factory (only `ansispeck/safe` pulls this in).
 *
 * @module ansispeck/internal/template
 */

import type { TemplateFormatter } from '../types.ts';
import { text } from './ansi.ts';

/** Template-tag factory: re-opens the style after each interpolated value. */
export function makeTemplateFormatter(open: string, close: string): TemplateFormatter {
	return (strings, ...values) => {
		let output = `${open}${strings[0] ?? ''}`;
		for (let i = 0; i < values.length; i++) {
			const nextLiteral = strings[i + 1] ?? '';
			output += text(values[i]);
			if (i + 1 < values.length || nextLiteral.length > 0) output += open;
			output += nextLiteral;
		}
		return `${output}${close}`;
	};
}
