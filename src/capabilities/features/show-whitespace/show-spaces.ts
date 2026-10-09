import { FeatureToggle } from "@/capabilities/base/feature-toggle";

export default class ShowSpaces extends FeatureToggle {
	readonly settingKey = "showWhitespace.isShowSpacesEnabled" as const;
	protected override toggleClass = "unisastra-show-spaces";
	protected settingTitle = "Show spaces";
	protected settingDesc =
		"Displays mid-line space characters. Obsidian requires exactly 4 spaces for nested list indentation — visual verification prevents silent indentation bugs.";
}
