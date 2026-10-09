// SPDX-License-Identifier: GPL-3.0-only
// Copyright (C) 2025-2026 Parkis Utama

import type { SettingGroup } from "obsidian";
import { Feature } from "@/capabilities/base/feature";
import type { SettingsPath } from "@/capabilities/settings";

export default class ToggleTimerSessionVisible extends Feature {
	readonly settingKey = "toolbar.timers#sessionVisible" as unknown as SettingsPath;

	registerSetting(settingGroup: SettingGroup): void {
		const timers = this.tm.settings.toolbar.timers;
		settingGroup.addSetting((setting) =>
			setting
				.setName("Show session timer")
				.setDesc("Show the shared session elapsed timer in the toolbar dock and status bar.")
				.setClass("unisastra-setting")
				.addToggle((toggle) =>
					toggle.setValue(timers.sessionVisible).onChange((value) => {
						timers.sessionVisible = value;
						this.tm.saveSettings().catch((error) => {
							console.error("Failed to save settings:", error);
						});
					}),
				),
		);
	}
}
