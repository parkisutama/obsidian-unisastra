// SPDX-License-Identifier: GPL-3.0-only AND MIT
// Derived from Typewriter Mode (https://github.com/davisriedel/obsidian-typewriter-mode)
// Copyright (c) 2023-2026 Davis Riedel
// Modifications Copyright (C) 2025-2026 Parkis Utama

import type { SettingGroup } from "obsidian";
import { Feature } from "@/capabilities/base/feature";

export default class WarnLongLineChars extends Feature {
	readonly settingKey = "maxChars.warnLongLineChars" as const;

	registerSetting(settingGroup: SettingGroup): void {
		settingGroup.addSetting((setting) =>
			setting
				.setName("Character limit for line length warning")
				.setDesc("Lines with more than this number of characters will be highlighted")
				.setClass("unisastra-setting")
				.addText((text) =>
					text.setValue((this.getSettingValue() as number).toString()).onChange((newValue) => {
						this.changeWarnLongLineChars(Number.parseInt(newValue, 10));
					}),
				),
		);
	}

	private changeWarnLongLineChars(newValue: number) {
		this.setSettingValue(newValue);
		this.tm.saveSettings().catch((error) => {
			console.error("Failed to save settings:", error);
		});
	}
}
