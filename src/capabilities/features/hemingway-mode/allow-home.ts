import { FeatureToggle } from "@/capabilities/base/feature-toggle";

export default class AllowHomeInHemingwayMode extends FeatureToggle {
	readonly settingKey = "hemingwayMode.isAllowHomeInHemingwayModeEnabled" as const;
	protected override toggleClass = null;
	protected settingTitle = "Allow using Home key in Hemingway mode";
	protected settingDesc =
		"Allows jumping to the start of the line with the Home key when Hemingway mode is active.";
}
