// SPDX-License-Identifier: GPL-3.0-only AND MIT
// Derived from Typewriter Mode (https://github.com/davisriedel/obsidian-typewriter-mode)
// Copyright (c) 2023-2026 Davis Riedel
// Modifications Copyright (C) 2025-2026 Parkis Utama

// Zoom-on-bullet concept inspired by vslinko's obsidian-zoom
// (https://github.com/vslinko/obsidian-zoom). No code ported; this uses
// Obsidian's native fold-heading/fold-indent settings and an original CM6
// range calculator (src/lib.ts outlinerFocusAtCursor), not upstream's data
// model.

import type { EditorView } from "@codemirror/view";
import type { Editor, MarkdownFileInfo, MarkdownView } from "obsidian";
import { EditorCommand } from "../base/editor-command";

export class OutlinerFocus extends EditorCommand {
	readonly commandKey = "zoom-in";
	readonly commandTitle = "Outliner: Focus on block";

	protected override registerCommand() {
		this.tm.plugin.addCommand({
			id: this.commandKey,
			name: this.commandTitle,
			icon: "list-tree",
			editorCallback: this.onCommand.bind(this),
		});
	}

	protected onCommand(editor: Editor, _view: MarkdownView | MarkdownFileInfo) {
		const cm = (editor as unknown as { cm: EditorView }).cm;
		this.tm.outlinerFocusAtCursor(cm);
	}
}
