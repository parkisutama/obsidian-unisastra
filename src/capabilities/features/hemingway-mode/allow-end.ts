import { FeatureToggle } from "@/capabilities/base/feature-toggle";

export default class AllowEndInHemingwayMode extends FeatureToggle {
  readonly settingKey =
    "hemingwayMode.isAllowEndInHemingwayModeEnabled" as const;
  protected override toggleClass = null;
  protected settingTitle = "Allow using End key in Hemingway mode";
  protected settingDesc =
    "Allows jumping to the end of the line with the End key when Hemingway mode is active.";
}
