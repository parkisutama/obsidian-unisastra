// SPDX-License-Identifier: GPL-3.0-only AND MIT
// Derived from Typewriter Mode (https://github.com/davisriedel/obsidian-typewriter-mode)
// Copyright (c) 2023-2026 Davis Riedel
// Modifications Copyright (C) 2025-2026 Parkis Utama

import type UnisastraCore from "@/lib";
import { AbstractCommand } from "../base/abstract-command";

function registerMoveTypewriterCommand(tm: UnisastraCore, direction: "up" | "down") {
	const editorCommand = direction === "up" ? "goUp" : "goDown";

	tm.plugin.addCommand({
		id: `move-typewriter-${direction}`,
		name: `Move typewriter ${direction}`,
		editorCallback: (editor, _view) => {
			editor.exec(editorCommand);
			window.dispatchEvent(new Event("moveByCommand"));
		},
	});
}

export class MoveTypewriterUp extends AbstractCommand {
	readonly commandKey = "move-typewriter-up";
	readonly commandTitle = "Move typewriter up";
	protected override registerCommand(): void {
		registerMoveTypewriterCommand(this.tm, "up");
	}
}

export class MoveTypewriterDown extends AbstractCommand {
	readonly commandKey = "move-typewriter-down";
	readonly commandTitle = "Move typewriter down";
	protected override registerCommand(): void {
		registerMoveTypewriterCommand(this.tm, "down");
	}
}
