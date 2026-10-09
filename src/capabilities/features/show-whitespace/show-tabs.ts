import { FeatureToggle } from "@/capabilities/base/feature-toggle";

export default class ShowTabs extends FeatureToggle {
	readonly settingKey = "showWhitespace.isShowTabsEnabled" as const;
	protected override toggleClass = "unisastra-show-tabs";
	protected settingTitle = "Show tabs";
	protected settingDesc =
		"Displays tab characters. Tabs break code block indentation and nested list depth in Hugo and Quartz.";
}
