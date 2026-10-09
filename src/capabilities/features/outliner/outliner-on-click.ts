import { FeatureToggle } from "@/capabilities/base/feature-toggle";

export default class OutlinerOnClick extends FeatureToggle {
	readonly settingKey = "outliner.isOutlinerOnClickEnabled" as const;
	protected override toggleClass = "unisastra-outliner-on-click";
	protected settingTitle = "Focus on bullet click";
	protected settingDesc = "Click list bullets to focus into that list item.";

	override enable() {
		super.enable();
		this.tm.reconfigureOutliner();
	}

	override disable() {
		super.disable();
		this.tm.reconfigureOutliner();
	}
}
