import { FeatureToggle } from "@/capabilities/base/feature-toggle";

export default class AllowArrowDownInHemingwayMode extends FeatureToggle {
	readonly settingKey = "hemingwayMode.isAllowArrowDownInHemingwayModeEnabled" as const;
	protected override toggleClass = null;
	protected settingTitle = "Allow using Down Arrow key in Hemingway mode";
	protected settingDesc =
		"Allows moving the cursor down with the Down Arrow key when Hemingway mode is active.";
}
