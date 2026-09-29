import type { FeatureToggle } from "../base/feature-toggle";
import { ToggleCommand } from "../base/toggle-command";

export class TogglePlugin extends ToggleCommand {
  readonly commandKey = "unisastra-plugin";
  readonly commandTitle = "Unisastra plugin";
  protected override featureToggle = this.tm.features.general[
    "general.isPluginActivated"
  ] as FeatureToggle;
}
