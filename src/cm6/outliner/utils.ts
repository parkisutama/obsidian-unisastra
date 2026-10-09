// SPDX-License-Identifier: GPL-3.0-only AND MIT
// Derived from Typewriter Mode (https://github.com/davisriedel/obsidian-typewriter-mode)
// Copyright (c) 2023-2026 Davis Riedel
// Modifications Copyright (C) 2025-2026 Parkis Utama

import type { EditorState, RangeSet, RangeValue } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { outlinerFocusEffect, outlinerUnfocusEffect } from "./effects";
import { outlinerStateField } from "./state-field";

const BLOCK_ID_LINE_RE = / \^[\w-]+$/u;

function rangeSetToArray<T extends RangeValue>(
	rs: RangeSet<T>,
): Array<{ from: number; to: number }> {
	const res: Array<{ from: number; to: number }> = [];
	const i = rs.iter();
	while (i.value !== null) {
		res.push({ from: i.from, to: i.to });
		i.next();
	}
	return res;
}

export function getHiddenRanges(state: EditorState): Array<{ from: number; to: number }> {
	const field = state.field(outlinerStateField, false);
	if (!field) {
		return [];
	}
	return rangeSetToArray(field);
}

export function getVisibleRange(state: EditorState): { from: number; to: number } | null {
	const hidden = getHiddenRanges(state);

	if (hidden.length === 1) {
		const [a] = hidden;
		if (a.from === 0) {
			return { from: a.to + 1, to: state.doc.length };
		}
		return { from: 0, to: a.from - 1 };
	}

	if (hidden.length === 2) {
		const [a, b] = hidden;
		return { from: a.to + 1, to: b.from - 1 };
	}

	return null;
}

export function isOutlinerFocused(state: EditorState): boolean {
	return getVisibleRange(state) !== null;
}

export function getLineContentEndBeforeBlockId(state: EditorState, pos: number): number {
	const line = state.doc.lineAt(pos);
	const blockIdMatch = line.text.match(BLOCK_ID_LINE_RE);
	if (!blockIdMatch || blockIdMatch.index === undefined) {
		return line.to;
	}

	return line.from + blockIdMatch.index;
}

export function dispatchOutlinerFocus(view: EditorView, from: number, to: number): void {
	const targetPos = getLineContentEndBeforeBlockId(view.state, from);
	view.dispatch({
		selection: { anchor: targetPos },
		effects: [
			outlinerFocusEffect.of({ from, to }),
			EditorView.scrollIntoView(targetPos, { y: "center" }),
		],
	});
}

export function dispatchOutlinerUnfocus(view: EditorView): void {
	view.dispatch({ effects: [outlinerUnfocusEffect.of()] });
	view.dispatch({
		effects: [EditorView.scrollIntoView(view.state.selection.main, { y: "center" })],
	});
}
