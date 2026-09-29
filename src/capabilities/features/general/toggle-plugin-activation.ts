import { FeatureToggle } from "@/capabilities/base/feature-toggle";

export default class TogglePluginActivation extends FeatureToggle {
  readonly settingKey = "general.isPluginActivated" as const;
  protected override toggleClass = "unisastra-plugin-activated";
  protected settingTitle = "Activate Unisastra";
  protected settingDesc = "This enables or disables all the features below.";
}
