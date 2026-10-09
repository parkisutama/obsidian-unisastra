// SPDX-License-Identifier: GPL-3.0-only
// Copyright (C) 2025-2026 Parkis Utama

import { Notice } from "obsidian";
import { Command } from "@/capabilities/base/command";
import type { WritingMode } from "@/capabilities/settings";
import type UnisastraCore from "@/lib";

export const WRITING_MODES: Array<{ mode: WritingMode; label: string }> = [
	{ mode: "idea", label: "Idea" },
	{ mode: "writing", label: "Writing" },
	{ mode: "editing", label: "Editing" },
	{ mode: "normal", label: "Normal" },
	{ mode: "none", label: "Manual" },
];

export default class SetWritingModeCommand extends Command {
	private readonly _commandKey: string;
	private readonly _commandTitle: string;
	private readonly mode: WritingMode;

	constructor(tm: UnisastraCore, mode: WritingMode, label: string) {
		super(tm);
		this.mode = mode;
		this._commandKey = `set-writing-mode-${mode}`;
		this._commandTitle =
			mode === "none" ? "Use Manual Writing Mode" : `Activate Writing Mode: ${label}`;
	}

	get commandKey(): string {
		return this._commandKey;
	}

	get commandTitle(): string {
		return this._commandTitle;
	}

	protected onCommand(): void {
		const feature = this.tm.features.writingModes["writingMode.activeMode"];
		if (
			feature &&
			typeof (feature as unknown as { applyMode?: (mode: WritingMode) => void }).applyMode ===
				"function"
		) {
			(feature as unknown as { applyMode: (mode: WritingMode) => void }).applyMode(this.mode);
		}

		this.tm.saveSettings().catch((error) => {
			console.error("Failed to save settings:", error);
		});

		if (this.mode === "none") {
			new Notice("Manual writing mode: current feature states unchanged");
			return;
		}

		new Notice(`Activated ${this.mode} writing mode preset`);
	}
}
