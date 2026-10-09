// SPDX-License-Identifier: GPL-3.0-only AND MIT
// Derived from Typewriter Mode (https://github.com/davisriedel/obsidian-typewriter-mode)
// Copyright (c) 2023-2026 Davis Riedel
// Modifications Copyright (C) 2025-2026 Parkis Utama

import type { SettingGroup } from "obsidian";
import { Feature } from "@/capabilities/base/feature";
import {
	CURRENT_LINE_HIGHLIGHT_STYLE,
	type CurrentLineHighlightStyle as CurrentLineHighlightStyleType,
} from "@/capabilities/constants";

export default class CurrentLineHighlightStyle extends Feature {
	readonly settingKey = "currentLine.currentLineHighlightStyle" as const;

	override getBodyClasses(): string[] {
		return ["unisastra-current-line-highlight-box", "unisastra-current-line-highlight-underline"];
	}

	registerSetting(settingGroup: SettingGroup): void {
		settingGroup.addSetting((setting) =>
			setting
				.setName("Current line highlight style")
				.setDesc("The style of the current line highlight")
				.setClass("unisastra-setting")
				.addDropdown((dropdown) =>
					dropdown
						.addOption(CURRENT_LINE_HIGHLIGHT_STYLE.BOX, "Box")
						.addOption(CURRENT_LINE_HIGHLIGHT_STYLE.UNDERLINE, "Underline")
						.setValue(this.getSettingValue() as CurrentLineHighlightStyleType)
						.onChange((newValue) => {
							this.changeCurrentLineHighlightStyle(newValue as CurrentLineHighlightStyleType);
						}),
				),
		);
	}

	override load() {
		super.load();
		this.applyClass();
	}

	private applyClass() {
		const currentLineStyleClass = `unisastra-current-line-highlight-${this.getSettingValue()}`;
		for (const cl of this.getBodyClasses()) {
			this.tm.perWindowProps.bodyClasses.remove(cl);
		}
		this.tm.perWindowProps.bodyClasses.push(currentLineStyleClass);
	}

	private changeCurrentLineHighlightStyle(newValue: CurrentLineHighlightStyleType) {
		this.setSettingValue(newValue);
		this.applyClass();
		this.tm.saveSettings().catch((error) => {
			console.error("Failed to save settings:", error);
		});
	}
}
