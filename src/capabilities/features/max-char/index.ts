import type UnisastraCore from "@/lib";
import LimitMaxCharsPerLine from "./limit-max-chars-per-line";
import MaxCharsPerLine from "./max-chars-per-line";
import WarnLongLine from "./warn-long-line";
import WarnLongLineChars from "./warn-long-line-chars";

export default function getMaxCharFeatures(tm: UnisastraCore) {
	return Object.fromEntries(
		[
			new LimitMaxCharsPerLine(tm),
			new MaxCharsPerLine(tm),
			new WarnLongLine(tm),
			new WarnLongLineChars(tm),
		].map((feature) => [feature.getSettingKey(), feature]),
	);
}
