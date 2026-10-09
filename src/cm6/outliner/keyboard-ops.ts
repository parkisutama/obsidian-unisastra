// SPDX-License-Identifier: GPL-3.0-only
// Copyright (C) 2025-2026 Parkis Utama

import type { EditorView } from "@codemirror/view";
import {
	getIndentForDepth,
	getNextSibling,
	getPreviousSibling,
	getSubtreeRange,
	type ListItemInfo,
	reindentText,
	resolveListItem,
} from "@/cm6/list-service";

type StateCommand = (target: {
	state: EditorView["state"];
	dispatch: EditorView["dispatch"];
}) => boolean;

// ---- Helpers ----

function getTextContentStart(_state: EditorView["state"], item: ListItemInfo): number {
	return item.contentFrom;
}

// ---- Move operations ----

/** Move current list item + children up one sibling position */
export const moveListItemUp: StateCommand = ({ state, dispatch }) => {
	const cursor = state.selection.main.head;
	const item = resolveListItem(state, cursor);
	if (!item) {
		return false;
	}

	const prev = getPreviousSibling(state, item);
	if (!prev) {
		return false;
	}

	const subtree = getSubtreeRange(state, item);
	const prevRange = getSubtreeRange(state, prev);

	const cursorOffsetInItem = cursor - subtree.from;

	// We need to swap: remove current item, insert it before previous
	// Build as a single change set to avoid offset issues
	// The swap: replace [prevRange.from, subtree.to] with subtreeText + prevText
	const prevText = state.doc.sliceString(prevRange.from, prevRange.to);
	const itemText = state.doc.sliceString(subtree.from, subtree.to);

	dispatch(
		state.update({
			changes: {
				from: prevRange.from,
				to: subtree.to,
				insert: itemText + state.doc.sliceString(prevRange.to, subtree.from) + prevText,
			},
			selection: {
				anchor: prevRange.from + cursorOffsetInItem,
			},
			userEvent: "input.move",
		}),
	);
	return true;
};

/** Move current list item + children down one sibling position */
export const moveListItemDown: StateCommand = ({ state, dispatch }) => {
	const cursor = state.selection.main.head;
	const item = resolveListItem(state, cursor);
	if (!item) {
		return false;
	}

	const next = getNextSibling(state, item);
	if (!next) {
		return false;
	}

	const subtree = getSubtreeRange(state, item);
	const nextRange = getSubtreeRange(state, next);

	const cursorOffsetInItem = cursor - subtree.from;

	// Swap: replace [subtree.from, nextRange.to] with nextText + gap + itemText
	const itemText = state.doc.sliceString(subtree.from, subtree.to);
	const nextText = state.doc.sliceString(nextRange.from, nextRange.to);
	const gap = state.doc.sliceString(subtree.to, nextRange.from);

	const newText = nextText + gap + itemText;
	const newCursorPos = subtree.from + nextText.length + gap.length + cursorOffsetInItem;

	dispatch(
		state.update({
			changes: {
				from: subtree.from,
				to: nextRange.to,
				insert: newText,
			},
			selection: {
				anchor: newCursorPos,
			},
			userEvent: "input.move",
		}),
	);
	return true;
};

/** Indent: make current item a child of previous sibling */
export const indentListItem: StateCommand = ({ state, dispatch }) => {
	const cursor = state.selection.main.head;
	const item = resolveListItem(state, cursor);
	if (!item) {
		return false;
	}

	const prev = getPreviousSibling(state, item);
	if (!prev) {
		return false;
	}

	const subtree = getSubtreeRange(state, item);
	const reindented = reindentText(state, subtree.text, item.depth, item.depth + 1);

	const cursorOffsetInItem = cursor - subtree.from;
	const tabSize = state.tabSize;

	dispatch(
		state.update({
			changes: {
				from: subtree.from,
				to: subtree.to,
				insert: reindented,
			},
			selection: {
				anchor: subtree.from + cursorOffsetInItem + tabSize,
			},
			userEvent: "input.indent",
		}),
	);
	return true;
};

/** Outdent: move current item up one nesting level */
export const outdentListItem: StateCommand = ({ state, dispatch }) => {
	const cursor = state.selection.main.head;
	const item = resolveListItem(state, cursor);
	if (!item || item.depth === 0) {
		return false;
	}

	const subtree = getSubtreeRange(state, item);
	const reindented = reindentText(state, subtree.text, item.depth, item.depth - 1);

	const cursorOffsetInItem = cursor - subtree.from;
	const tabSize = state.tabSize;

	dispatch(
		state.update({
			changes: {
				from: subtree.from,
				to: subtree.to,
				insert: reindented,
			},
			selection: {
				anchor: subtree.from + Math.max(0, cursorOffsetInItem - tabSize),
			},
			userEvent: "input.outdent",
		}),
	);
	return true;
};

/**
 * Smart Enter:
 * - Non-empty item: create new sibling below
 * - Empty item at depth > 0: outdent
 * - Empty item at depth 0: exit list mode
 */
export const smartEnter: StateCommand = ({ state, dispatch }) => {
	const cursor = state.selection.main.head;
	const item = resolveListItem(state, cursor);
	if (!item) {
		return false;
	}

	// Check if item text is empty (only marker, no content)
	if (item.contentText.trim() === "") {
		if (item.depth > 0) {
			// Outdent empty item
			return outdentListItem({ state, dispatch });
		}
		// At root: remove the bullet and exit list mode
		const line = state.doc.lineAt(item.from);
		dispatch(
			state.update({
				changes: {
					from: line.from,
					to: line.to,
					insert: "",
				},
				userEvent: "input",
			}),
		);
		return true;
	}

	// Non-empty: create new sibling below current line
	const line = state.doc.lineAt(cursor);
	const indent = getIndentForDepth(state, item.depth);
	const newLine = `\n${indent}${item.marker} `;

	// If cursor is in the middle of the text, split the text
	const lineTextAfterCursor = state.doc.sliceString(cursor, line.to);
	const insertPos = cursor;

	if (lineTextAfterCursor.trim()) {
		// Split: remove text after cursor and put it in the new line
		dispatch(
			state.update({
				changes: [
					{ from: cursor, to: line.to, insert: "" },
					{ from: cursor, insert: newLine + lineTextAfterCursor },
				],
				selection: {
					anchor: insertPos + newLine.length,
				},
				userEvent: "input",
			}),
		);
	} else {
		// Cursor at end of content — just insert a new item
		dispatch(
			state.update({
				changes: {
					from: line.to,
					insert: newLine,
				},
				selection: {
					anchor: line.to + newLine.length,
				},
				userEvent: "input",
			}),
		);
	}
	return true;
};

/**
 * Smart Tab: indent in list context
 */
export const smartTab: StateCommand = ({ state, dispatch }) => {
	const cursor = state.selection.main.head;
	const item = resolveListItem(state, cursor);
	if (!item) {
		return false;
	}
	return indentListItem({ state, dispatch });
};

/**
 * Smart Shift+Tab: outdent in list context
 */
export const smartShiftTab: StateCommand = ({ state, dispatch }) => {
	const cursor = state.selection.main.head;
	const item = resolveListItem(state, cursor);
	if (!item) {
		return false;
	}
	return outdentListItem({ state, dispatch });
};

/**
 * Smart Select (Cmd/Ctrl+A):
 * - If selection is collapsed and cursor is in list: select current item text
 * - If current item is selected: select entire list
 * - Otherwise: fall through to default select-all
 */
export const smartSelectAll: StateCommand = ({ state, dispatch }) => {
	const sel = state.selection.main;
	const item = resolveListItem(state, sel.head);
	if (!item) {
		return false;
	}

	// If selection is collapsed (or small) — select current item content line
	const line = state.doc.lineAt(item.from);
	const contentStart = getTextContentStart(state, item);
	const contentEnd = line.to;

	if (sel.from === contentStart && sel.to === contentEnd) {
		// Already selected item content — select entire parent list
		dispatch(
			state.update({
				selection: {
					anchor: item.parentList.from,
					head: item.parentList.to,
				},
			}),
		);
		return true;
	}

	if (sel.from === item.parentList.from && sel.to === item.parentList.to) {
		// Already selected entire list — fall through to default select-all
		return false;
	}

	// Select current item content
	dispatch(
		state.update({
			selection: {
				anchor: contentStart,
				head: contentEnd,
			},
		}),
	);
	return true;
};

/**
 * Cursor stick left: prevent cursor from entering bullet marker area
 */
export const cursorStickLeft: StateCommand = ({ state, dispatch }) => {
	const cursor = state.selection.main.head;
	const item = resolveListItem(state, cursor);
	if (!item) {
		return false;
	}

	const contentStart = getTextContentStart(state, item);
	if (cursor <= contentStart) {
		// Don't move further left — cursor is at or before content start
		dispatch(
			state.update({
				selection: { anchor: contentStart },
			}),
		);
		return true;
	}
	return false;
};

/**
 * Cursor stick home: Home key goes to start of content, not start of line
 */
export const cursorStickHome: StateCommand = ({ state, dispatch }) => {
	const cursor = state.selection.main.head;
	const item = resolveListItem(state, cursor);
	if (!item) {
		return false;
	}

	const contentStart = getTextContentStart(state, item);
	if (cursor !== contentStart) {
		dispatch(
			state.update({
				selection: { anchor: contentStart },
			}),
		);
		return true;
	}
	return false;
};
