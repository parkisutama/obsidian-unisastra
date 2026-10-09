// SPDX-License-Identifier: GPL-3.0-only AND MIT
// Derived from Typewriter Mode (https://github.com/davisriedel/obsidian-typewriter-mode)
// Copyright (c) 2023-2026 Davis Riedel
// Modifications Copyright (C) 2025-2026 Parkis Utama

import type { EditorView } from "@codemirror/view";
import type { Editor, MarkdownFileInfo, MarkdownView } from "obsidian";
import { EditorCommand } from "../base/editor-command";

export class FocusParent extends EditorCommand {
	readonly commandKey = "focus-parent";
	readonly commandTitle = "Outliner: Focus parent";

	protected override registerCommand() {
		this.tm.plugin.addCommand({
			id: this.commandKey,
			name: this.commandTitle,
			icon: "corner-up-left",
			editorCallback: this.onCommand.bind(this),
		});
	}

	protected onCommand(editor: Editor, _view: MarkdownView | MarkdownFileInfo) {
		const cm = (editor as unknown as { cm: EditorView }).cm;
		this.tm.focusOutlinerRelation(cm, "parent");
	}
}
