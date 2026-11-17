// SPDX-License-Identifier: GPL-3.0-only
// Copyright (C) 2025-2026 Parkis Utama

import type { EditorView } from "@codemirror/view";
import {
	getNextSibling,
	getPreviousSibling,
	getSubtreeRange,
	reindentText,
	resolveListItem,
} from "@/cm6/list-service";

type StateCommand = (target: {
	state: EditorView["state"];
	dispatch: EditorView["dispatch"];
}) => boolean;

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
