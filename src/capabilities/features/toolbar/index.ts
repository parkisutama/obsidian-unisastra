import type TypewriterModeLib from "@/lib";
import ToggleToolbarEnabled from "./toggle-enabled";

export default function getToolbarFeatures(tm: TypewriterModeLib) {
  return Object.fromEntries(
    [new ToggleToolbarEnabled(tm)].map((feature) => [
      feature.getSettingKey(),
      feature,
    ])
  );
}
