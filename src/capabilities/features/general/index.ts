import type TypewriterModeLib from "@/lib";
import RestoreCursorPosition from "../restore-cursor-position/restore-cursor-position";
import AnnounceUpdates from "../updates/announce-updates";
import EnabledPlatforms from "./enabled-platforms";
import Mononote from "./mononote";
import OnlyActivateAfterFirstInteraction from "./only-activate-after-first-interaction";
import TogglePluginActivation from "./toggle-plugin-activation";

export default function getGeneralFeatures(tm: TypewriterModeLib) {
  return Object.fromEntries(
    [
      new TogglePluginActivation(tm),
      new EnabledPlatforms(tm),
      new OnlyActivateAfterFirstInteraction(tm),
      new AnnounceUpdates(tm),
      new RestoreCursorPosition(tm),
      new Mononote(tm),
    ].map((feature) => [feature.getSettingKey(), feature])
  );
}
