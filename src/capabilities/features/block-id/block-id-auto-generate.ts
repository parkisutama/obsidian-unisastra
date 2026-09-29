import { FeatureToggle } from "@/capabilities/base/feature-toggle";

export default class BlockIdAutoGenerate extends FeatureToggle {
  readonly settingKey = "blockId.isAutoGenerateOnFoldEnabled" as const;
  protected settingTitle = "Auto-generate on fold";
  protected settingDesc =
    "Add a block ID when a list item is folded by you or another plugin. Unisastra restore and undo/redo do not generate IDs. Insertion can be undone.";
}
