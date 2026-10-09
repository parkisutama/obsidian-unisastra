// Adapted for Unisastra from Floaty Toolbar by 0png (MIT).
// https://github.com/0png/Floaty-Toolbar, src/utils.ts
// Revision b2113d06e1870851963053cd0bab0a0a971bb920.
// Copyright (c) 2026 0png. Full notice: licenses/floaty-toolbar-MIT.txt.
// Italic/strikethrough/code/highlight/heading below follow the same
// wrap/unwrap pattern as boldEdit, not lifted from a specific upstream line.
export type HeadingLevel = 0 | 1 | 2 | 3 | 4;
export type ToolbarAction =
	| { kind: "bold" | "italic" | "strikethrough" | "code" | "highlight" }
	| { kind: "heading"; level: HeadingLevel }
	| { kind: "link" }
	| { id: string; kind: "callout" };
export interface TextEdit {
	from: number;
	insert: string;
	to: number;
}
function symmetricWrapEdit(text: string, from: number, to: number, marker: string): TextEdit {
	const wrapped =
		text.length > marker.length * 2 &&
		text.startsWith(marker) &&
		text.endsWith(marker) &&
		!text.slice(marker.length).startsWith(marker);
	return {
		from,
		to,
		insert: wrapped ? text.slice(marker.length, -marker.length) : `${marker}${text}${marker}`,
	};
}
export function boldEdit(text: string, from: number, to: number): TextEdit {
	return symmetricWrapEdit(text, from, to, "**");
}
export function italicEdit(text: string, from: number, to: number): TextEdit {
	const wrapped =
		text.length > 2 &&
		text.startsWith("*") &&
		text.endsWith("*") &&
		!text.startsWith("**") &&
		!text.endsWith("**");
	return { from, to, insert: wrapped ? text.slice(1, -1) : `*${text}*` };
}
export function strikethroughEdit(text: string, from: number, to: number): TextEdit {
	return symmetricWrapEdit(text, from, to, "~~");
}
export function codeEdit(text: string, from: number, to: number): TextEdit {
	return symmetricWrapEdit(text, from, to, "`");
}
export function highlightEdit(text: string, from: number, to: number): TextEdit {
	return symmetricWrapEdit(text, from, to, "==");
}
const UNSUPPORTED_HEADING_PATTERN = /^#{5,}\s/;
const HEADING_PREFIX_PATTERN = /^(#{1,4})\s+/;
/** Returns the cursor line's heading level (0 = paragraph), or -1 if it's an H5+ line the toolbar does not manage. */
export function detectHeadingLevel(lineText: string): number {
	if (UNSUPPORTED_HEADING_PATTERN.test(lineText)) {
		return -1;
	}
	const match = HEADING_PREFIX_PATTERN.exec(lineText);
	return match ? match[1].length : 0;
}
export function headingEdit(
	lineText: string,
	lineFrom: number,
	lineTo: number,
	level: HeadingLevel,
): TextEdit | null {
	if (UNSUPPORTED_HEADING_PATTERN.test(lineText)) {
		return null;
	}
	const match = HEADING_PREFIX_PATTERN.exec(lineText);
	const rest = match ? lineText.slice(match[0].length) : lineText;
	const insert = level === 0 ? rest : `${"#".repeat(level)} ${rest}`;
	return { from: lineFrom, to: lineTo, insert };
}
export const LINK_PLACEHOLDER_URL = "https://";
const LINK_PATTERN = /^\[(.*)\]\([^)]*\)$/;
export interface LinkInsertion extends TextEdit {
	urlFrom: number;
	urlTo: number;
}
export function linkUnwrapEdit(text: string, from: number, to: number): TextEdit | null {
	const match = LINK_PATTERN.exec(text);
	if (!match) {
		return null;
	}
	return { from, to, insert: match[1] };
}
export function linkWrapEdit(text: string, from: number, to: number, url: string): LinkInsertion {
	const insert = `[${text}](${url})`;
	const urlFrom = from + text.length + 3;
	return { from, to, insert, urlFrom, urlTo: urlFrom + url.length };
}
export function isLikelyUrl(value: string): boolean {
	try {
		const parsed = new URL(value);
		return parsed.protocol === "http:" || parsed.protocol === "https:";
	} catch {
		return false;
	}
}
