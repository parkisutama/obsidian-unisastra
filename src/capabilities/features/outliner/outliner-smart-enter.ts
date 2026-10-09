import { FeatureToggle } from "@/capabilities/base/feature-toggle";

export default class OutlinerSmartEnter extends FeatureToggle {
	readonly settingKey = "outliner.isSmartEnterEnabled" as const;
	protected settingTitle = "Smart Enter";
	protected settingDesc =
		"Enter on a non-empty item creates a new sibling. Enter on an empty item outdents or exits list mode.";

	override enable() {
		super.enable();
		this.tm.reconfigureOutliner();
	}

	override disable() {
		super.disable();
		this.tm.reconfigureOutliner();
	}
}
