// SPDX-License-Identifier: GPL-3.0-only AND MIT
// Derived from Typewriter Mode (https://github.com/davisriedel/obsidian-typewriter-mode)
// Copyright (c) 2023-2026 Davis Riedel
// Modifications Copyright (C) 2025-2026 Parkis Utama

import type { SettingGroup } from "obsidian";
import { Feature } from "@/capabilities/base/feature";

export default class CurrentLineHighlightUnderlineThickness extends Feature {
	readonly settingKey = "currentLine.currentLineHighlightUnderlineThickness" as const;

	registerSetting(settingGroup: SettingGroup): void {
		settingGroup.addSetting((setting) =>
			setting
				.setName("Current line underline thickness")
				.setDesc("The thickness of the underline that highlights the current line")
				.setClass("unisastra-setting")
				.addSlider((slider) =>
					slider
						.setLimits(1, 5, 1)
						.setDynamicTooltip()
						.setValue(this.getSettingValue() as number)
						.onChange((newValue) => {
							this.changeCurrentLineHighlightUnderlineThickness(newValue);
						}),
				),
		);
	}

	override load() {
		this.tm.setCSSVariable(
			"--current-line-highlight-underline-thickness",
			`${this.getSettingValue()}px`,
		);
	}

	private changeCurrentLineHighlightUnderlineThickness(newValue: number) {
		this.setSettingValue(newValue);
		this.tm.setCSSVariable("--current-line-highlight-underline-thickness", `${newValue}px`);
		this.tm.saveSettings().catch((error) => {
			console.error("Failed to save settings:", error);
		});
	}
}
