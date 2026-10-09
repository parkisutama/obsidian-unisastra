// SPDX-License-Identifier: GPL-3.0-only AND MIT
// Derived from Typewriter Mode (https://github.com/davisriedel/obsidian-typewriter-mode)
// Copyright (c) 2023-2026 Davis Riedel
// Modifications Copyright (C) 2025-2026 Parkis Utama

import { EditorState, type Transaction } from "@codemirror/state";
import type { EditorView } from "@codemirror/view";
import { editorEditorField } from "obsidian";
import { getHiddenRanges } from "./utils";

function analyzeBoundaries(tr: Transaction, hiddenRanges: Array<{ from: number; to: number }>) {
	let touchedBefore = false;
	let touchedAfter = false;
	let touchedInside = false;

	const t = (f: number, to: number) => Boolean(tr.changes.touchesRange(f, to));

	if (hiddenRanges.length === 2) {
		const [a, b] = hiddenRanges;
		touchedBefore = t(a.from, a.to);
		touchedInside = t(a.to + 1, b.from - 1);
		touchedAfter = t(b.from, b.to);
	}

	if (hiddenRanges.length === 1) {
		const [a] = hiddenRanges;
		if (a.from === 0) {
			touchedBefore = t(a.from, a.to);
			touchedInside = t(a.to + 1, tr.newDoc.length);
		} else {
			touchedInside = t(0, a.from - 1);
			touchedAfter = t(a.from, a.to);
		}
	}

	return {
		touchedOutside: touchedBefore || touchedAfter,
		touchedInside,
	};
}

export function createBoundaryViolationDetector(onViolation: (view: EditorView) => void) {
	return EditorState.transactionExtender.of((tr: Transaction) => {
		const hiddenRanges = getHiddenRanges(tr.startState);
		if (hiddenRanges.length === 0) {
			return null;
		}

		const { touchedOutside, touchedInside } = analyzeBoundaries(tr, hiddenRanges);

		if (touchedOutside && touchedInside) {
			const state = tr.state;
			// Deferred dispatch — cannot dispatch during a transaction
			window.setTimeout(() => {
				const view = state.field(editorEditorField);
				onViolation(view);
			}, 0);
		}

		return null;
	});
}
