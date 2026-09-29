import type { SettingGroup } from "obsidian";
import { Feature } from "@/capabilities/base/feature";

export default class ToggleDockAlwaysVisible extends Feature {
  readonly settingKey = "toolbar.dockAlwaysVisible" as const;

  registerSetting(settingGroup: SettingGroup): void {
    const toolbar = this.tm.settings.toolbar;
    settingGroup.addSetting((setting) =>
      setting
        .setName("Always show dock")
        .setDesc(
          "Keep the docked toolbar visible at all times instead of auto-hiding while typing. Turning this on pins the toolbar as a dock."
        )
        .setClass("unisastra-setting")
        .addToggle((toggle) =>
          toggle.setValue(toolbar.dockAlwaysVisible).onChange((value) => {
            toolbar.dockAlwaysVisible = value;
            if (value) {
              toolbar.mode = "dock";
            }
            this.tm.saveSettings().catch((error) => {
              console.error("Failed to save settings:", error);
            });
          })
        )
    );
  }
}
