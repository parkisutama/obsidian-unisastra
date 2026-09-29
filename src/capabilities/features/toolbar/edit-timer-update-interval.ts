import type { SettingGroup } from "obsidian";
import { Feature } from "@/capabilities/base/feature";
import type { SettingsPath } from "@/capabilities/settings";
import { timerUpdateIntervalSeconds } from "./settings";

export default class EditTimerUpdateInterval extends Feature {
  readonly settingKey =
    "toolbar.timers#updateIntervalSeconds" as unknown as SettingsPath;

  registerSetting(settingGroup: SettingGroup): void {
    const timers = this.tm.settings.toolbar.timers;
    settingGroup.addSetting((setting) =>
      setting
        .setName("Timer update interval (seconds)")
        .setDesc(
          "How often the session and file timers refresh their displayed time. Lower values (e.g. 1) update live; higher values (e.g. 60) reduce distraction. Clamped between 1 and 300 seconds."
        )
        .setClass("unisastra-setting")
        .addText((text) =>
          text
            .setValue(timers.updateIntervalSeconds.toString())
            .onChange((value) => {
              timers.updateIntervalSeconds = timerUpdateIntervalSeconds(
                Number.parseInt(value, 10)
              );
              this.tm.saveSettings().catch((error) => {
                console.error("Failed to save settings:", error);
              });
            })
        )
    );
  }
}
