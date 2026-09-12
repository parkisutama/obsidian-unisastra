import type TypewriterModeLib from "@/lib";
import ToggleDockAlwaysVisible from "./toggle-dock-always-visible";
import ToggleDockMode from "./toggle-dock-mode";
import ToggleToolbarEnabled from "./toggle-enabled";
import ToggleSmartUrl from "./toggle-smart-url";

export default function getToolbarFeatures(tm: TypewriterModeLib) {
  return Object.fromEntries(
    [
      new ToggleToolbarEnabled(tm),
      new ToggleSmartUrl(tm),
      new ToggleDockMode(tm),
      new ToggleDockAlwaysVisible(tm),
    ].map((feature) => [feature.getSettingKey(), feature])
  );
}
