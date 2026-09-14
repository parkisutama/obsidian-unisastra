import type TypewriterModeLib from "@/lib";
import AllowArrowDownInHemingwayMode from "./allow-arrow-down";
import AllowArrowLeftInHemingwayMode from "./allow-arrow-left";
import AllowArrowRightInHemingwayMode from "./allow-arrow-right";
import AllowArrowUpInHemingwayMode from "./allow-arrow-up";
import AllowBackspaceInHemingwayMode from "./allow-backspace";
import AllowDeleteInHemingwayMode from "./allow-delete";
import AllowEndInHemingwayMode from "./allow-end";
import AllowHomeInHemingwayMode from "./allow-home";
import AllowPageDownInHemingwayMode from "./allow-page-down";
import AllowPageUpInHemingwayMode from "./allow-page-up";
import AllowUndoInHemingwayMode from "./allow-undo";
import HemingwayMode from "./hemingway-mode";
import ShowHemingwayModeStatusBar from "./show-status-bar";
import HemingwayModeStatusBarText from "./status-bar-text";

export default function getHemingwayModeFeatures(tm: TypewriterModeLib) {
  return Object.fromEntries(
    [
      new HemingwayMode(tm),
      new AllowArrowLeftInHemingwayMode(tm),
      new AllowArrowRightInHemingwayMode(tm),
      new AllowArrowUpInHemingwayMode(tm),
      new AllowArrowDownInHemingwayMode(tm),
      new AllowHomeInHemingwayMode(tm),
      new AllowEndInHemingwayMode(tm),
      new AllowPageUpInHemingwayMode(tm),
      new AllowPageDownInHemingwayMode(tm),
      new AllowDeleteInHemingwayMode(tm),
      new AllowBackspaceInHemingwayMode(tm),
      new AllowUndoInHemingwayMode(tm),
      new ShowHemingwayModeStatusBar(tm),
      new HemingwayModeStatusBarText(tm),
    ].map((feature) => [feature.getSettingKey(), feature])
  );
}
