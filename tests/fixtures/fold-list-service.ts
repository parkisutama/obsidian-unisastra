import type { EditorState } from "@codemirror/state";

const LIST = /^\s*- /;
const ID = / \^([\w-]+)$/;
// Synthetic parser boundary for adapter tests. HyperMD remains a native QA gate.
export function getAllListItems(state: EditorState) {
	const items: { from: number; blockId: string | null }[] = [];
	for (let n = 1; n <= state.doc.lines; n++) {
		const line = state.doc.line(n);
		if (LIST.test(line.text)) {
			items.push({
				from: line.from,
				blockId: ID.exec(line.text)?.[1] ?? null,
			});
		}
	}
	return items;
}
export function resolveListItem(state: EditorState, pos: number) {
	return getAllListItems(state).find((item) => item.from === state.doc.lineAt(pos).from) ?? null;
}
