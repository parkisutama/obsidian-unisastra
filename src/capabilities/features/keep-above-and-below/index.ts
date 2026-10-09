import type UnisastraCore from "@/lib";
import KeepLinesAboveAndBelow from "./keep-lines-above-and-below";
import LinesAboveAndBelow from "./lines-above-and-below";

export default function getKeepAboveAndBelowFeatures(tm: UnisastraCore) {
	return Object.fromEntries(
		[new KeepLinesAboveAndBelow(tm), new LinesAboveAndBelow(tm)].map((feature) => [
			feature.getSettingKey(),
			feature,
		]),
	);
}
