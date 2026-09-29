import type UnisastraCore from "@/lib";
import RestoreCursorPosition from "./restore-cursor-position";

export default function getRestoreCursorPositionFeatures(tm: UnisastraCore) {
  return Object.fromEntries(
    [new RestoreCursorPosition(tm)].map((feature) => [
      feature.getSettingKey(),
      feature,
    ])
  );
}
