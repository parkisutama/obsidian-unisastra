// SPDX-License-Identifier: GPL-3.0-only
// Copyright (C) 2025-2026 Parkis Utama

import { Notice } from "obsidian";
import { AbstractCommand } from "../base/abstract-command";

export class RevealActiveOutlineNode extends AbstractCommand {
	readonly commandKey = "reveal-active-outline-node";
	readonly commandTitle = "Outliner: Reveal active node in sidebar";

	protected override registerCommand() {
		this.tm.plugin.addCommand({
			id: this.commandKey,
			name: this.commandTitle,
			icon: "panel-right-open",
			callback: async () => {
				const ok = await this.tm.revealActiveOutlineNode(true);
				if (!ok) {
					new Notice("Unable to open the outline sidebar.");
				}
			},
		});
	}
}
