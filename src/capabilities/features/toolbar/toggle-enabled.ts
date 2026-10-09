import { FeatureToggle } from "@/capabilities/base/feature-toggle";

export default class ToggleToolbarEnabled extends FeatureToggle {
	readonly settingKey = "toolbar.enabled" as const;
	protected settingTitle = "Enable floating toolbar";
	protected settingDesc =
		"Show a floating formatting toolbar when you select text in Source mode on desktop.";
}
