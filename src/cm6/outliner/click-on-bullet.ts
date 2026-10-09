// SPDX-License-Identifier: GPL-3.0-only AND MIT
// Derived from Typewriter Mode (https://github.com/davisriedel/obsidian-typewriter-mode)
// Copyright (c) 2023-2026 Davis Riedel
// Modifications Copyright (C) 2025-2026 Parkis Utama

// Zoom-on-bullet-click concept inspired by vslinko's obsidian-zoom
// (https://github.com/vslinko/obsidian-zoom). No code ported — this uses
// Obsidian's own `cm-formatting-list-*`/`list-bullet` DOM classes, not
// upstream's implementation.

import { EditorSelection } from "@codemirror/state";
import { EditorView } from "@codemirror/view";

function isBulletPoint(e: HTMLElement): boolean {
	if (!e.instanceOf(HTMLSpanElement)) {
		return false;
	}
	if (e.classList.contains("list-bullet")) {
		return true;
	}
	// In source mode, Obsidian uses cm-formatting-list-ul / cm-formatting-list-ol
	for (const cls of Array.from(e.classList)) {
		if (cls.startsWith("cm-formatting-list")) {
			return true;
		}
	}
	return false;
}

export function createClickOnBulletHandler(onBulletClick: (view: EditorView, pos: number) => void) {
	return EditorView.domEventHandlers({
		click: (e: MouseEvent, view: EditorView) => {
			if (!(e.target instanceof HTMLElement)) {
				return;
			}
			const target = e.target;
			if (!isBulletPoint(target)) {
				return;
			}

			const pos = view.posAtDOM(e.target);
			const line = view.state.doc.lineAt(pos);

			// Move cursor to line end before zooming
			view.dispatch({
				selection: EditorSelection.cursor(line.to),
			});

			onBulletClick(view, pos);
		},
	});
}
