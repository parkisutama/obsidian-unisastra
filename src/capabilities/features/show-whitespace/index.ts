import type UnisastraCore from "@/lib";
import ShowSpaces from "./show-spaces";
import ShowStrictLineBreak from "./show-strict-line-break";
import ShowTabs from "./show-tabs";
import ShowTrailing from "./show-trailing";
import ShowWhitespace from "./show-whitespace";

export default function getShowWhitespaceFeatures(tm: UnisastraCore) {
  return Object.fromEntries(
    [
      new ShowWhitespace(tm),
      new ShowSpaces(tm),
      new ShowTabs(tm),
      new ShowTrailing(tm),
      new ShowStrictLineBreak(tm),
    ].map((feature) => [feature.getSettingKey(), feature])
  );
}
