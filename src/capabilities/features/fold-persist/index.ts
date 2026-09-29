import type UnisastraCore from "@/lib";
import FoldPersistEnabled from "./fold-persist-enabled";

export default function getFoldPersistFeatures(tm: UnisastraCore) {
  return Object.fromEntries(
    [new FoldPersistEnabled(tm)].map((feature) => [
      feature.getSettingKey(),
      feature,
    ])
  );
}
