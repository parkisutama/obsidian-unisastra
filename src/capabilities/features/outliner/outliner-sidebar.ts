import { FeatureToggle } from "@/capabilities/base/feature-toggle";
import { OUTLINE_VIEW_TYPE } from "@/components/outline-view";

export default class OutlinerSidebar extends FeatureToggle {
	readonly settingKey = "outliner.isSidebarOutlineEnabled" as const;
	protected settingTitle = "Sidebar outline";
	protected settingDesc =
		"Show a sidebar panel with heading and list item hierarchy for quick navigation.";

	override enable() {
		super.enable();
		this.tm.plugin.app.workspace.onLayoutReady(() => {
			this.activateView();
		});
	}

	override disable() {
		super.disable();
		this.tm.plugin.app.workspace.detachLeavesOfType(OUTLINE_VIEW_TYPE);
	}

	private activateView() {
		const workspace = this.tm.plugin.app.workspace;
		if (workspace.getLeavesOfType(OUTLINE_VIEW_TYPE).length === 0) {
			workspace.getRightLeaf(false)?.setViewState({
				type: OUTLINE_VIEW_TYPE,
				active: true,
			});
		}
	}
}
