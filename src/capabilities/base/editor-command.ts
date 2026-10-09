// SPDX-License-Identifier: GPL-3.0-only AND MIT
// Derived from Typewriter Mode (https://github.com/davisriedel/obsidian-typewriter-mode)
// Copyright (c) 2023-2026 Davis Riedel
// Modifications Copyright (C) 2025-2026 Parkis Utama

import type { Editor, MarkdownFileInfo, MarkdownView } from "obsidian";
import { AbstractCommand } from "./abstract-command";

export abstract class EditorCommand extends AbstractCommand {
	protected override registerCommand() {
		this.tm.plugin.addCommand({
			id: this.commandKey,
			name: this.commandTitle,
			editorCallback: this.onCommand.bind(this),
		});
	}

	override load() {
		this.registerCommand();
	}

	protected abstract onCommand(editor: Editor, view: MarkdownView | MarkdownFileInfo): void;
}
