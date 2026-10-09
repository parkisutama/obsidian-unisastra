// SPDX-License-Identifier: GPL-3.0-only
// Copyright (C) 2025-2026 Parkis Utama

import type { SettingGroup } from "obsidian";
import { Feature } from "@/capabilities/base/feature";
import type { WritingMode, WritingModePreset } from "@/capabilities/settings";

const FEATURE_LABELS: Record<keyof WritingModePreset, string> = {
	outliner: "Outliner",
	hemingwayMode: "Hemingway",
	writingFocus: "Writing Focus",
	typewriter: "Typewriter",
	dimming: "Dimming",
	currentLine: "Current Line",
	showWhitespace: "Whitespace",
	maxChars: "Line Width",
};

// Line Width bundles two differently-measured behaviors: the editor column
// width (in `ch`, the CSS character unit) and the long-line warning
// highlight (a raw character count on one document line). See the two
// underlying toggles in the "Line Width" settings tab for details.
const FEATURE_DESCRIPTIONS: Partial<Record<keyof WritingModePreset, string>> = {
	maxChars:
		"Controls both the editor column width (measured in characters, ch) and the long-line warning highlight (a raw character count per line) together.",
};

const MODE_DESCRIPTIONS: Record<Exclude<WritingMode, "none">, string> = {
	idea: "Brainstorm and structure ideas. Outliner zoom + Hemingway for forward-only ideation.",
	writing: "Draft and compose. Typewriter scroll + Dimming for focused writing flow.",
	editing: "Revise and polish. Current Line + Whitespace + Line Width for precision editing.",
	normal:
		"Navigate structure with outliner enabled by default; other managed writing effects are off by default.",
};

export default class WritingModePresetConfig extends Feature {
	// Use a dummy path since this feature manages nested preset data
	readonly settingKey = "writingMode.activeMode" as const;

	override getSettingKey() {
		return "writingMode.presets" as unknown as typeof this.settingKey;
	}

	registerSetting(settingGroup: SettingGroup): void {
		for (const mode of ["idea", "writing", "editing", "normal"] as const) {
			this.registerMode(settingGroup, mode);
		}
	}

	registerMode(settingGroup: SettingGroup, mode: Exclude<WritingMode, "none">): void {
		const preset = this.tm.settings.writingMode.presets[mode];
		const description = MODE_DESCRIPTIONS[mode];

		settingGroup.addSetting((setting) =>
			setting
				.setName(`${mode.charAt(0).toUpperCase()}${mode.slice(1)} mode`)
				.setDesc(
					`${description} These switches edit the preset recipe; they do not toggle live features until this mode is activated.`,
				)
				.setHeading(),
		);

		for (const featureKey of Object.keys(FEATURE_LABELS) as Array<keyof WritingModePreset>) {
			settingGroup.addSetting((setting) =>
				setting
					.setName(FEATURE_LABELS[featureKey])
					.setDesc(FEATURE_DESCRIPTIONS[featureKey] ?? "")
					.setClass("unisastra-setting")
					.addToggle((toggle) =>
						toggle.setValue(preset[featureKey]).onChange((newValue) => {
							this.tm.settings.writingMode.presets[mode][featureKey] = newValue;
							this.tm.saveSettings().catch((error) => {
								console.error("Failed to save settings:", error);
							});
						}),
					),
			);
		}
	}
}
