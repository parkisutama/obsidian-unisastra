// SPDX-License-Identifier: GPL-3.0-only
// Copyright (C) 2025-2026 Parkis Utama

import { Notice } from "obsidian";
import { AbstractCommand } from "../base/abstract-command";

export class OutlineFilterCycle extends AbstractCommand {
	readonly commandKey = "outline-filter-cycle";
	readonly commandTitle = "Outliner: Cycle sidebar filter";

	protected override registerCommand() {
		this.tm.plugin.addCommand({
			id: this.commandKey,
			name: this.commandTitle,
			icon: "refresh-cw",
			callback: async () => {
				const nextMode = await this.tm.cycleOutlineFilterMode();
				if (!nextMode) {
					new Notice("Unable to open the outline sidebar.");
				}
			},
		});
	}
}
