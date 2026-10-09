import type UnisastraCore from "@/lib";
import OutlinerCursorStick from "./outliner-cursor-stick";
import OutlinerEnabled from "./outliner-enabled";
import OutlinerKeyboardOps from "./outliner-keyboard-ops";
import OutlinerOnClick from "./outliner-on-click";
import OutlinerSidebar from "./outliner-sidebar";
import OutlinerSmartEnter from "./outliner-smart-enter";
import OutlinerSmartSelect from "./outliner-smart-select";
import OutlinerSmartTab from "./outliner-smart-tab";

export default function getOutlinerFeatures(tm: UnisastraCore) {
	return Object.fromEntries(
		[
			new OutlinerEnabled(tm),
			new OutlinerOnClick(tm),
			new OutlinerKeyboardOps(tm),
			new OutlinerCursorStick(tm),
			new OutlinerSmartEnter(tm),
			new OutlinerSmartTab(tm),
			new OutlinerSmartSelect(tm),
			new OutlinerSidebar(tm),
		].map((feature) => [feature.getSettingKey(), feature]),
	);
}
