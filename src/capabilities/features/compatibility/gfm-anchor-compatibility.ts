import { FeatureToggle } from "@/capabilities/base/feature-toggle";

export default class GFMAnchorCompatibility extends FeatureToggle {
	readonly settingKey = "compatibility.isGFMAnchorCompatibilityEnabled" as const;
	protected settingTitle = "Enable GitHub-style heading anchors";
	protected settingDesc =
		"Resolve GitHub-style heading links in Reading Mode and Live Preview without changing vault files.";
}
