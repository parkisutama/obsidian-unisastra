// Typewriter scrolling concept inspired by deathau's
// cm-typewriter-scroll-obsidian
// (https://github.com/deathau/cm-typewriter-scroll-obsidian).
// No code ported; the scroll offset math lives in
// src/cm6/typewriter-offset-calculator.ts and is an original CM6
// implementation, not a port of upstream's CM5-era extension.

import { FeatureToggle } from "@/capabilities/base/feature-toggle";

export default class TypewriterScroll extends FeatureToggle {
  readonly settingKey = "typewriter.isTypewriterScrollEnabled" as const;
  protected override toggleClass = "ptm-typewriter-scroll";
  protected settingTitle = "Typewriter scrolling";
  protected settingDesc = "Turns typewriter scrolling on or off";

  protected override isSettingEnabled(): boolean {
    return !this.tm.settings.keepLinesAboveAndBelow
      .isKeepLinesAboveAndBelowEnabled;
  }
}
