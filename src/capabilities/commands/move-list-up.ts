// SPDX-License-Identifier: GPL-3.0-only AND MIT
// Derived from Typewriter Mode (https://github.com/davisriedel/obsidian-typewriter-mode)
// Copyright (c) 2023-2026 Davis Riedel
// Modifications Copyright (C) 2025-2026 Parkis Utama

import type { EditorView } from "@codemirror/view";
import type { Editor, MarkdownFileInfo, MarkdownView } from "obsidian";
import { moveListItemUp } from "@/cm6/outliner/keyboard-ops";
import { EditorCommand } from "../base/editor-command";

export class MoveListUp extends EditorCommand {
	readonly commandKey = "move-list-up";
	readonly commandTitle = "Outliner: Move list item up";

	protected override registerCommand() {
		this.tm.plugin.addCommand({
			id: this.commandKey,
			name: this.commandTitle,
			icon: "arrow-up",
			editorCallback: this.onCommand.bind(this),
		});
	}

	protected onCommand(editor: Editor, _view: MarkdownView | MarkdownFileInfo) {
		const cm = (editor as unknown as { cm: EditorView }).cm;
		moveListItemUp({ state: cm.state, dispatch: cm.dispatch });
	}
}
