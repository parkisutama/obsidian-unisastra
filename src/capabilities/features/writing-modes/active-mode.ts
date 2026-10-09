import type { SettingGroup } from "obsidian";
import { Feature } from "@/capabilities/base/feature";
import type { WritingMode, WritingModePreset } from "@/capabilities/settings";

const MANAGED_FEATURES: Array<{
	settingKey: string;
	presetKey: keyof WritingModePreset;
	featureGroup: string;
}> = [
	{
		presetKey: "outliner",
		featureGroup: "outliner",
		settingKey: "outliner.isOutlinerEnabled",
	},
	{
		presetKey: "hemingwayMode",
		featureGroup: "hemingwayMode",
		settingKey: "hemingwayMode.isHemingwayModeEnabled",
	},
	{
		presetKey: "typewriter",
		featureGroup: "typewriter",
		settingKey: "typewriter.isTypewriterScrollEnabled",
	},
	{
		presetKey: "dimming",
		featureGroup: "dimming",
		settingKey: "dimming.isDimUnfocusedEnabled",
	},
	{
		presetKey: "currentLine",
		featureGroup: "currentLine",
		settingKey: "currentLine.isHighlightCurrentLineEnabled",
	},
	{
		presetKey: "showWhitespace",
		featureGroup: "showWhitespace",
		settingKey: "showWhitespace.isShowWhitespaceEnabled",
	},
	{
		presetKey: "maxChars",
		featureGroup: "maxChar",
		settingKey: "maxChars.isMaxCharsPerLineEnabled",
	},
	{
		presetKey: "maxChars",
		featureGroup: "maxChar",
		settingKey: "maxChars.isWarnLongLineEnabled",
	},
];

export default class WritingModeActive extends Feature {
	readonly settingKey = "writingMode.activeMode" as const;

	registerSetting(settingGroup: SettingGroup): void {
		const currentMode = this.tm.settings.writingMode.activeMode;

		settingGroup.addSetting((setting) =>
			setting
				.setName("Active writing mode")
				.setDesc(
					"Activate a saved preset recipe. Normal enables outliner by default. Choose none to manage features manually without undoing current states.",
				)
				.setClass("unisastra-setting")
				.addDropdown((dropdown) => {
					dropdown
						.addOption("none", "None")
						.addOption("idea", "Idea")
						.addOption("writing", "Writing")
						.addOption("editing", "Editing")
						.addOption("normal", "Normal")
						.setValue(currentMode)
						.onChange((newValue) => {
							this.applyMode(newValue as WritingMode);
							this.tm.saveSettings().catch((error) => {
								console.error("Failed to save settings:", error);
							});
						});
				}),
		);
	}

	override load() {
		// Don't apply mode on load — features load their own saved state
	}

	applyMode(mode: WritingMode) {
		this.setSettingValue(mode);

		if (mode === "none") {
			return;
		}

		const preset = this.tm.settings.writingMode.presets[mode];
		this.applyPreset(preset);
	}

	applyPreset(preset: WritingModePreset) {
		for (const entry of MANAGED_FEATURES) {
			const category = this.tm.features[entry.featureGroup];
			if (!category) {
				continue;
			}

			const feature = category[entry.settingKey];
			if (feature && "applyValue" in feature) {
				(feature as { applyValue: (value: boolean) => void }).applyValue(preset[entry.presetKey]);
			}
		}

		const writingFocusCommand = this.tm.commands?.["writing-focus"];
		if (
			writingFocusCommand &&
			typeof (
				writingFocusCommand as unknown as {
					setWritingFocusEnabled?: (isEnabled: boolean) => void;
				}
			).setWritingFocusEnabled === "function"
		) {
			(
				writingFocusCommand as unknown as {
					setWritingFocusEnabled: (isEnabled: boolean) => void;
				}
			).setWritingFocusEnabled(preset.writingFocus);
		}
	}
}
