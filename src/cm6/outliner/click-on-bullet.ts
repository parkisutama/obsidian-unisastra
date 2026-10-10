// SPDX-License-Identifier: GPL-3.0-only AND MIT
// Adapted from Obsidian Zoom (https://github.com/vslinko/obsidian-zoom): src/logic/DetectClickOnBullet.ts
// Copyright (c) 2021 Viacheslav Slinko
// Modifications Copyright (C) 2025-2026 Parkis Utama
// Full notice: third-party-notices/obsidian-zoom-MIT.txt

// Zoom on a bullet click. The click handling follows Obsidian Zoom's DetectClickOnBullet; the
// bullet is recognised through Obsidian's own `cm-formatting-list-*`/`list-bullet` DOM classes.

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
