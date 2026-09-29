import type { SettingGroup } from "obsidian";
import { Feature } from "@/capabilities/base/feature";
import type { SettingsPath } from "@/capabilities/settings";

export default class ToggleTimerFileVisible extends Feature {
  readonly settingKey = "toolbar.timers#fileVisible" as unknown as SettingsPath;

  registerSetting(settingGroup: SettingGroup): void {
    const timers = this.tm.settings.toolbar.timers;
    settingGroup.addSetting((setting) =>
      setting
        .setName("Show file timer")
        .setDesc(
          "Show the per-window file elapsed timer, which resets when you switch to a different file."
        )
        .setClass("unisastra-setting")
        .addToggle((toggle) =>
          toggle.setValue(timers.fileVisible).onChange((value) => {
            timers.fileVisible = value;
            this.tm.saveSettings().catch((error) => {
              console.error("Failed to save settings:", error);
            });
          })
        )
    );
  }
}
