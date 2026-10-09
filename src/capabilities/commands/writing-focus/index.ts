// SPDX-License-Identifier: GPL-3.0-only AND MIT
// Derived from Typewriter Mode (https://github.com/davisriedel/obsidian-typewriter-mode)
// Copyright (c) 2023-2026 Davis Riedel
// Modifications Copyright (C) 2025-2026 Parkis Utama

// Command wrapper for WritingFocus (./writing-focus.ts), which is adapted
// from Obsidian Focus Mode (MPL-2.0) — see that file for the full notice.

import { ToggleCommand } from "@/capabilities/base/toggle-command";
import { WritingFocus } from "./writing-focus";

export class WritingFocusCommand extends ToggleCommand {
	protected override featureToggle = null;

	readonly commandKey = "writing-focus";
	readonly commandTitle = "writing focus";

	private readonly writingFocus = new WritingFocus(this.tm);

	setWritingFocusEnabled(isEnabled: boolean): void {
		if (isEnabled) {
			this.writingFocus.enableFocusMode();
			return;
		}

		this.writingFocus.disableFocusMode();
	}

	protected override onCommand(): void {
		this.writingFocus.toggleFocusMode();
	}

	protected override onEnable(): void {
		this.writingFocus.enableFocusMode();
	}

	protected override onDisable(): void {
		this.writingFocus.disableFocusMode();
	}

	onload() {
		this.tm.plugin.addRibbonIcon("enter", "Toggle writing focus", (_event): void => {
			this.writingFocus.toggleFocusMode();
		});
	}
}
