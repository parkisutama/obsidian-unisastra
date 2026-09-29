import type { SettingGroup } from "obsidian";
import { Feature } from "@/capabilities/base/feature";
import type { SettingsPath } from "@/capabilities/settings";
import { prefix } from "./settings";

export default class EditTimerSessionPrefix extends Feature {
  readonly settingKey =
    "toolbar.timers#sessionPrefix" as unknown as SettingsPath;

  registerSetting(settingGroup: SettingGroup): void {
    const timers = this.tm.settings.toolbar.timers;
    settingGroup.addSetting((setting) =>
      setting
        .setName("Session timer prefix")
        .setDesc("Label shown before the session elapsed time.")
        .setClass("unisastra-setting")
        .addText((text) =>
          text.setValue(timers.sessionPrefix).onChange((value) => {
            timers.sessionPrefix = prefix(value, "Sesi:");
            this.tm.saveSettings().catch((error) => {
              console.error("Failed to save settings:", error);
            });
          })
        )
    );
  }
}
