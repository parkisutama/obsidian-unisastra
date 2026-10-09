import type UnisastraCore from "@/lib";
import GFMAnchorCompatibility from "./gfm-anchor-compatibility";

export default function getCompatibilityFeatures(tm: UnisastraCore) {
	return Object.fromEntries(
		[new GFMAnchorCompatibility(tm)].map((feature) => [feature.getSettingKey(), feature]),
	);
}
