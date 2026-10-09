import { Setting, SettingGroup } from "obsidian";
import type { FeatureToggle } from "@/capabilities/base/feature-toggle";
import type UnisastraCore from "@/lib";

export function renderTypewriterSettings(container: HTMLElement, tm: UnisastraCore): void {
	new Setting(container)
		.setName("Scrolling behavior")
		.setDesc("Choose one scrolling behavior. Turn the active option off before enabling the other.")
		.setHeading();
	const typewriter = tm.features.typewriter[
		"typewriter.isTypewriterScrollEnabled"
	] as FeatureToggle;
	const keepLines = tm.features.keepAboveAndBelow[
		"keepLinesAboveAndBelow.isKeepLinesAboveAndBelowEnabled"
	] as FeatureToggle;
	let typewriterControl: Setting;
	let keepControl: Setting;
	const refresh = () => {
		typewriterControl.setDisabled(
			tm.settings.keepLinesAboveAndBelow.isKeepLinesAboveAndBelowEnabled,
		);
		keepControl.setDisabled(tm.settings.typewriter.isTypewriterScrollEnabled);
	};
	new Setting(container).setName("Typewriter").setHeading();
	typewriterControl = new Setting(container)
		.setName("Typewriter scrolling")
		.setDesc("Keep the active line at a fixed vertical position.")
		.setClass("unisastra-setting")
		.addToggle((toggle) =>
			toggle.setValue(tm.settings.typewriter.isTypewriterScrollEnabled).onChange((value) => {
				typewriter.toggle(value);
				refresh();
			}),
		);
	const typewriterGroup = new SettingGroup(container);
	for (const feature of Object.values(tm.features.typewriter)) {
		if (feature !== typewriter) {
			feature.registerSetting(typewriterGroup);
		}
	}
	new Setting(container).setName("Keep lines").setHeading();
	keepControl = new Setting(container)
		.setName("Keep lines above and below")
		.setDesc("Maintain context lines as an alternative to fixed-position scrolling.")
		.setClass("unisastra-setting")
		.addToggle((toggle) =>
			toggle
				.setValue(tm.settings.keepLinesAboveAndBelow.isKeepLinesAboveAndBelowEnabled)
				.onChange((value) => {
					keepLines.toggle(value);
					refresh();
				}),
		);
	const keepGroup = new SettingGroup(container);
	for (const feature of Object.values(tm.features.keepAboveAndBelow)) {
		if (feature !== keepLines) {
			feature.registerSetting(keepGroup);
		}
	}
	refresh();
}
