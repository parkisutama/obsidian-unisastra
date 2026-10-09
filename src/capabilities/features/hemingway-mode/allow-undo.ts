import { FeatureToggle } from "@/capabilities/base/feature-toggle";

export default class AllowUndoInHemingwayMode extends FeatureToggle {
	readonly settingKey = "hemingwayMode.isAllowUndoInHemingwayModeEnabled" as const;
	protected override toggleClass = null;
	protected settingTitle = "Allow using Undo (Ctrl/Cmd+Z) in Hemingway mode";
	protected settingDesc = "Allows undo operations when Hemingway mode is active.";
}
