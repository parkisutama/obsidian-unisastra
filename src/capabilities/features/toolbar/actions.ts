// Adapted for MD Writer from Floaty Toolbar by 0png (MIT).
// https://github.com/0png/Floaty-Toolbar, src/utils.ts
// Revision b2113d06e1870851963053cd0bab0a0a971bb920.
// Copyright (c) 2026 0png. Full notice: licenses/floaty-toolbar-MIT.txt.
export interface ToolbarAction {
  kind: "bold";
}
export interface TextEdit {
  from: number;
  insert: string;
  to: number;
}
export function boldEdit(text: string, from: number, to: number): TextEdit {
  const wrapped =
    text.length > 4 &&
    text.startsWith("**") &&
    text.endsWith("**") &&
    !text.slice(2).startsWith("**");
  return { from, to, insert: wrapped ? text.slice(2, -2) : `**${text}**` };
}
