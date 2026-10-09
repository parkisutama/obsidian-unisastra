import type UnisastraCore from "@/lib";
import EditTimerFilePrefix from "./edit-timer-file-prefix";
import EditTimerSessionPrefix from "./edit-timer-session-prefix";
import EditTimerUpdateInterval from "./edit-timer-update-interval";
import ToggleDockAlwaysVisible from "./toggle-dock-always-visible";
import ToggleDockMode from "./toggle-dock-mode";
import ToggleToolbarEnabled from "./toggle-enabled";
import ToggleSmartUrl from "./toggle-smart-url";
import ToggleTimerFileVisible from "./toggle-timer-file-visible";
import ToggleTimerSessionVisible from "./toggle-timer-session-visible";

export default function getToolbarFeatures(tm: UnisastraCore) {
	return Object.fromEntries(
		[
			new ToggleToolbarEnabled(tm),
			new ToggleSmartUrl(tm),
			new ToggleDockMode(tm),
			new ToggleDockAlwaysVisible(tm),
			new ToggleTimerSessionVisible(tm),
			new ToggleTimerFileVisible(tm),
			new EditTimerSessionPrefix(tm),
			new EditTimerFilePrefix(tm),
			new EditTimerUpdateInterval(tm),
		].map((feature) => [feature.getSettingKey(), feature]),
	);
}
