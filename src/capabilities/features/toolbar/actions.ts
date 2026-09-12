// Adapted for MD Writer from Floaty Toolbar by 0png (MIT).
// https://github.com/0png/Floaty-Toolbar, src/utils.ts
// Revision b2113d06e1870851963053cd0bab0a0a971bb920.
// Copyright (c) 2026 0png. Full notice: licenses/floaty-toolbar-MIT.txt.
// Italic/strikethrough/code/highlight/heading below follow the same
// wrap/unwrap pattern as boldEdit, not lifted from a specific upstream line.
export type ToolbarAction =
  | { kind: "bold" | "italic" | "strikethrough" | "code" | "highlight" }
  | { kind: "heading" };
export interface TextEdit {
  from: number;
  insert: string;
  to: number;
}
function symmetricWrapEdit(
  text: string,
  from: number,
  to: number,
  marker: string
): TextEdit {
  const wrapped =
    text.length > marker.length * 2 &&
    text.startsWith(marker) &&
    text.endsWith(marker) &&
    !text.slice(marker.length).startsWith(marker);
  return {
    from,
    to,
    insert: wrapped
      ? text.slice(marker.length, -marker.length)
      : `${marker}${text}${marker}`,
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
export function strikethroughEdit(
  text: string,
  from: number,
  to: number
): TextEdit {
  return symmetricWrapEdit(text, from, to, "~~");
}
export function codeEdit(text: string, from: number, to: number): TextEdit {
  return symmetricWrapEdit(text, from, to, "`");
}
export function highlightEdit(
  text: string,
  from: number,
  to: number
): TextEdit {
  return symmetricWrapEdit(text, from, to, "==");
}
const MAX_TOOLBAR_HEADING_LEVEL = 4;
const UNSUPPORTED_HEADING_PATTERN = /^#{5,}\s/;
const HEADING_PREFIX_PATTERN = /^(#{1,4})\s+/;
function nextHeadingLevel(currentLevel: number): number {
  if (currentLevel === 0) {
    return 1;
  }
  if (currentLevel === MAX_TOOLBAR_HEADING_LEVEL) {
    return 0;
  }
  return currentLevel + 1;
}
export function headingEdit(
  lineText: string,
  lineFrom: number,
  lineTo: number
): TextEdit | null {
  if (UNSUPPORTED_HEADING_PATTERN.test(lineText)) {
    return null;
  }
  const match = HEADING_PREFIX_PATTERN.exec(lineText);
  const currentLevel = match ? match[1].length : 0;
  const rest = match ? lineText.slice(match[0].length) : lineText;
  const nextLevel = nextHeadingLevel(currentLevel);
  const insert = nextLevel === 0 ? rest : `${"#".repeat(nextLevel)} ${rest}`;
  return { from: lineFrom, to: lineTo, insert };
}
