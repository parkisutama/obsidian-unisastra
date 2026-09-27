import { FeatureToggle } from "@/capabilities/base/feature-toggle";

export default class BlockIdEnabled extends FeatureToggle {
  readonly settingKey = "blockId.isBlockIdEnabled" as const;
  protected settingTitle = "Enable block IDs";
  protected settingDesc =
    "Enable automatic block ID features for list items. Manual ID and link commands remain available when this is off.";
}
