// SPDX-License-Identifier: GPL-3.0-only AND MIT
// Derived from Typewriter Mode (https://github.com/davisriedel/obsidian-typewriter-mode)
// Copyright (c) 2023-2026 Davis Riedel
// Modifications Copyright (C) 2025-2026 Parkis Utama

import type { SettingGroup } from "obsidian";
import { Feature } from "@/capabilities/base/feature";

export default class TypewriterOffset extends Feature {
	readonly settingKey = "typewriter.typewriterOffset" as const;

	registerSetting(settingGroup: SettingGroup): void {
		settingGroup.addSetting((setting) =>
			setting
				.setName("Typewriter offset")
				.setDesc("Positions the typewriter line at the specified percentage of the screen")
				.setClass("unisastra-setting")
				.addSlider((slider) =>
					slider
						.setLimits(0, 100, 5)
						.setDynamicTooltip()
						.setValue((this.getSettingValue() as number) * 100)
						.onChange((newValue) => {
							this.changeTypewriterOffset(newValue / 100);
						}),
				),
		);
	}

	private changeTypewriterOffset(newValue: number) {
		this.setSettingValue(newValue);
		this.tm.saveSettings().catch((error) => {
			console.error("Failed to save settings:", error);
		});
	}
}
