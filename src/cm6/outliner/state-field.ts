// SPDX-License-Identifier: GPL-3.0-only AND MIT
// Derived from Typewriter Mode (https://github.com/davisriedel/obsidian-typewriter-mode)
// Copyright (c) 2023-2026 Davis Riedel
// Modifications Copyright (C) 2025-2026 Parkis Utama

import { type Extension, StateField } from "@codemirror/state";
import { Decoration, type DecorationSet, EditorView } from "@codemirror/view";
import { outlinerFocusEffect, outlinerUnfocusEffect } from "./effects";

const outlinerMarkHidden = Decoration.replace({ block: true });

export const outlinerStateField = StateField.define<DecorationSet>({
	create: () => Decoration.none,

	update: (decorations, tr) => {
		let result = decorations.map(tr.changes);

		for (const e of tr.effects) {
			if (e.is(outlinerFocusEffect)) {
				result = result.update({ filter: () => false });

				if (e.value.from > 0) {
					result = result.update({
						add: [outlinerMarkHidden.range(0, e.value.from - 1)],
					});
				}

				if (e.value.to < tr.newDoc.length) {
					result = result.update({
						add: [outlinerMarkHidden.range(e.value.to + 1, tr.newDoc.length)],
					});
				}
			}

			if (e.is(outlinerUnfocusEffect)) {
				result = result.update({ filter: () => false });
			}
		}

		return result;
	},

	provide: (f) => EditorView.decorations.from(f),
});

export function getOutlinerExtension(): Extension {
	return outlinerStateField;
}
