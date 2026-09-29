import { FeatureToggle } from "@/capabilities/base/feature-toggle";

export default class ShowWhitespace extends FeatureToggle {
  readonly settingKey = "showWhitespace.isShowWhitespaceEnabled" as const;
  protected override toggleClass = "unisastra-show-whitespace";
  protected settingTitle = "Show whitespace characters";
  protected settingDesc =
    "Reveals invisible characters (spaces, tabs, trailing spaces, strict line breaks) in the editor. Essential for SSG authoring where whitespace affects rendering.";
}
