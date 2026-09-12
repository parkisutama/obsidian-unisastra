import type TypewriterModeLib from "@/lib";
import ToggleToolbarEnabled from "./toggle-enabled";
import ToggleSmartUrl from "./toggle-smart-url";

export default function getToolbarFeatures(tm: TypewriterModeLib) {
  return Object.fromEntries(
    [new ToggleToolbarEnabled(tm), new ToggleSmartUrl(tm)].map((feature) => [
      feature.getSettingKey(),
      feature,
    ])
  );
}
