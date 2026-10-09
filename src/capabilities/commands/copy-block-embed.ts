// SPDX-License-Identifier: GPL-3.0-only
// Copyright (C) 2025-2026 Parkis Utama

import type { EditorView } from "@codemirror/view";
import type { Editor, MarkdownFileInfo, MarkdownView } from "obsidian";
import { Notice } from "obsidian";
import { insertBlockId } from "@/cm6/outliner/block-id";
import { EditorCommand } from "../base/editor-command";

export class CopyBlockEmbed extends EditorCommand {
	readonly commandKey = "copy-block-embed";
	readonly commandTitle = "Outliner: Copy block embed";

	protected override registerCommand() {
		this.tm.plugin.addCommand({
			id: this.commandKey,
			name: this.commandTitle,
			icon: "box",
			editorCallback: this.onCommand.bind(this),
		});
	}

	protected onCommand(editor: Editor, _view: MarkdownView | MarkdownFileInfo) {
		const cm = (editor as unknown as { cm: EditorView }).cm;
		const blockId = insertBlockId(cm);
		const file = this.tm.plugin.app.workspace.getActiveFile();
		if (!file) {
			return;
		}

		const embed = `![[${file.basename}#^${blockId}]]`;
		navigator.clipboard.writeText(embed);
		new Notice(`Copied: ${embed}`);
	}
}
