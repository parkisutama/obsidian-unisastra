import { FeatureToggle } from "@/capabilities/base/feature-toggle";

export default class ToggleSmartUrl extends FeatureToggle {
	readonly settingKey = "toolbar.smartUrl" as const;
	protected settingTitle = "Smart URL for Link";
	protected settingDesc =
		"When you use the Link action, read the clipboard and use its content as the URL if it looks like a valid http(s) link. Off by default; the clipboard is never read otherwise.";
}
