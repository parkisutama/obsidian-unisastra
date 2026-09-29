import { FeatureToggle } from "@/capabilities/base/feature-toggle";

export default class DimUnfocused extends FeatureToggle {
  readonly settingKey = "dimming.isDimUnfocusedEnabled" as const;
  protected override toggleClass = "unisastra-dim-unfocused";
  protected settingTitle = "Dim unfocused";
  protected settingDesc = "Dim unfocused paragraphs / sentences";
}
