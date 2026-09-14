import { FeatureToggle } from "@/capabilities/base/feature-toggle";

export default class AllowPageDownInHemingwayMode extends FeatureToggle {
  readonly settingKey =
    "hemingwayMode.isAllowPageDownInHemingwayModeEnabled" as const;
  protected override toggleClass = null;
  protected settingTitle = "Allow using Page Down key in Hemingway mode";
  protected settingDesc =
    "Allows scrolling down a page with the Page Down key when Hemingway mode is active.";
}
