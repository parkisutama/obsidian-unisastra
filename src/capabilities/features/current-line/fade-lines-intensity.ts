// SPDX-License-Identifier: GPL-3.0-only AND MIT
// Derived from Typewriter Mode (https://github.com/davisriedel/obsidian-typewriter-mode)
// Copyright (c) 2023-2026 Davis Riedel
// Modifications Copyright (C) 2025-2026 Parkis Utama

import type { SettingGroup } from "obsidian";
import { Feature } from "@/capabilities/base/feature";

export default class FadeLinesIntensity extends Feature {
	readonly settingKey = "currentLine.fadeLinesIntensity" as const;

	registerSetting(settingGroup: SettingGroup): void {
		settingGroup.addSetting((setting) =>
			setting
				.setName("Intensity of the fade lines gradient")
				.setDesc("How soon lines shall be faded out")
				.setClass("unisastra-setting")
				.addSlider((slider) =>
					slider
						.setLimits(0, 100, 5)
						.setDynamicTooltip()
						.setValue((this.getSettingValue() as number) * 100)
						.onChange((newValue) => {
							this.changeFadeLinesIntensity(newValue / 100);
						}),
				),
		);
	}

	override load() {
		this.tm.setCSSVariable(
			"--unisastra-fade-lines-intensity",
			`${(this.getSettingValue() as number) * 100}%`,
		);
	}

	private changeFadeLinesIntensity(newValue = 0.5) {
		this.setSettingValue(newValue);
		this.tm.setCSSVariable("--unisastra-fade-lines-intensity", `${newValue * 100}%`);
		this.tm.saveSettings().catch((error) => {
			console.error("Failed to save settings:", error);
		});
	}
}
