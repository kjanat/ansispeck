import type { Formattable, Formatter, TemplateFormatter } from '../types.ts';

const ESC = '\x1b[';
const code = (n: number): string => `${ESC}${n}m`;

export const FG_CLOSE: string = code(39);
export const BG_CLOSE: string = code(49);
export const MODIFIER_CLOSE: string = code(22);

export const RESET_OPEN: string = code(0);
export const BOLD_OPEN: string = code(1);
export const DIM_OPEN: string = code(2);
export const ITALIC_OPEN: string = code(3);
export const UNDERLINE_OPEN: string = code(4);
export const INVERSE_OPEN: string = code(7);
export const HIDDEN_OPEN: string = code(8);
export const STRIKETHROUGH_OPEN: string = code(9);

export const ITALIC_CLOSE: string = code(23);
export const UNDERLINE_CLOSE: string = code(24);
export const INVERSE_CLOSE: string = code(27);
export const HIDDEN_CLOSE: string = code(28);
export const STRIKETHROUGH_CLOSE: string = code(29);

export const BLACK_OPEN: string = code(30);
export const RED_OPEN: string = code(31);
export const GREEN_OPEN: string = code(32);
export const YELLOW_OPEN: string = code(33);
export const BLUE_OPEN: string = code(34);
export const MAGENTA_OPEN: string = code(35);
export const CYAN_OPEN: string = code(36);
export const WHITE_OPEN: string = code(37);
export const GRAY_OPEN: string = code(90);

export const BG_BLACK_OPEN: string = code(40);
export const BG_RED_OPEN: string = code(41);
export const BG_GREEN_OPEN: string = code(42);
export const BG_YELLOW_OPEN: string = code(43);
export const BG_BLUE_OPEN: string = code(44);
export const BG_MAGENTA_OPEN: string = code(45);
export const BG_CYAN_OPEN: string = code(46);
export const BG_WHITE_OPEN: string = code(47);

export const RED_BRIGHT_OPEN: string = code(91);
export const GREEN_BRIGHT_OPEN: string = code(92);
export const YELLOW_BRIGHT_OPEN: string = code(93);
export const BLUE_BRIGHT_OPEN: string = code(94);
export const MAGENTA_BRIGHT_OPEN: string = code(95);
export const CYAN_BRIGHT_OPEN: string = code(96);
export const WHITE_BRIGHT_OPEN: string = code(97);

export const BG_BLACK_BRIGHT_OPEN: string = code(100);
export const BG_RED_BRIGHT_OPEN: string = code(101);
export const BG_GREEN_BRIGHT_OPEN: string = code(102);
export const BG_YELLOW_BRIGHT_OPEN: string = code(103);
export const BG_BLUE_BRIGHT_OPEN: string = code(104);
export const BG_MAGENTA_BRIGHT_OPEN: string = code(105);
export const BG_CYAN_BRIGHT_OPEN: string = code(106);
export const BG_WHITE_BRIGHT_OPEN: string = code(107);

const text = (input: Formattable): string => '' + input;

export const makeFormatter = (open: string, close: string, replace: string = open): Formatter => {
	return (input) => {
		let value = text(input);
		let index = value.indexOf(close, open.length);
		if (~index) {
			let output = '';
			let cursor = 0;
			do {
				output += `${value.substring(cursor, index)}${replace}`;
				cursor = index + close.length;
				index = value.indexOf(close, cursor);
			} while (~index);
			value = `${output}${value.substring(cursor)}`;
		}
		return `${open}${value}${close}`;
	};
};

export const makeTemplateFormatter = (open: string, close: string): TemplateFormatter => {
	return (strings, ...values) => {
		let output = `${open}${strings[0]}`;
		let index = 0;
		while (index < values.length) {
			const nextLiteral = strings[index + 1] ?? '';
			const shouldReopen = index + 1 < values.length || nextLiteral.length > 0;
			output += text(values[index]);
			if (shouldReopen) output += open;
			output += nextLiteral;
			index++;
		}
		return `${output}${close}`;
	};
};
