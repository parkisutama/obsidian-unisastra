import type { SettingGroup } from "obsidian";
import { Feature } from "@/capabilities/base/feature";
import type { SettingsPath } from "@/capabilities/settings";
import { prefix } from "./settings";

export default class EditTimerFilePrefix extends Feature {
  readonly settingKey = "toolbar.timers#filePrefix" as unknown as SettingsPath;

  registerSetting(settingGroup: SettingGroup): void {
    const timers = this.tm.settings.toolbar.timers;
    settingGroup.addSetting((setting) =>
      setting
        .setName("File timer prefix")
        .setDesc("Label shown before the per-window file elapsed time.")
        .setClass("unisastra-setting")
        .addText((text) =>
          text.setValue(timers.filePrefix).onChange((value) => {
            timers.filePrefix = prefix(value, "File:");
            this.tm.saveSettings().catch((error) => {
              console.error("Failed to save settings:", error);
            });
          })
        )
    );
  }
}
