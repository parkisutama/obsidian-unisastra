// SPDX-License-Identifier: GPL-3.0-only AND MIT
// Derived from Typewriter Mode (https://github.com/davisriedel/obsidian-typewriter-mode)
// Copyright (c) 2023-2026 Davis Riedel
// Modifications Copyright (C) 2025-2026 Parkis Utama

import type { EditorView } from "@codemirror/view";

export function getEditorDom(view: EditorView) {
	return view.dom.ownerDocument.querySelector(
		".workspace-leaf.mod-active .cm-editor, .mod-inside-iframe .cm-editor",
	) as HTMLElement;
}

export function getScrollDom(view: EditorView) {
	return view.dom.ownerDocument.querySelector(
		".workspace-leaf.mod-active .cm-scroller, .mod-inside-iframe .cm-scroller",
	) as HTMLElement;
}

export function getSizerDom(view: EditorView) {
	return view.dom.ownerDocument.querySelector(
		".workspace-leaf.mod-active .cm-sizer, .mod-inside-iframe .cm-sizer",
	) as HTMLElement;
}
