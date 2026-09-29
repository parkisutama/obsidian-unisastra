import type UnisastraCore from "@/lib";
import BlockIdAutoGenerate from "./block-id-auto-generate";
import BlockIdEnabled from "./block-id-enabled";
import BlockIdHide from "./block-id-hide";

export default function getBlockIdFeatures(tm: UnisastraCore) {
  return Object.fromEntries(
    [
      new BlockIdEnabled(tm),
      new BlockIdAutoGenerate(tm),
      new BlockIdHide(tm),
    ].map((feature) => [feature.getSettingKey(), feature])
  );
}
