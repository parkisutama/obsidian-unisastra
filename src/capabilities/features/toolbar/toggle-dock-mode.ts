import { Notice, type SettingGroup } from "obsidian";
import { Feature } from "@/capabilities/base/feature";

export default class ToggleDockMode extends Feature {
  readonly settingKey = "toolbar.mode" as const;

  registerSetting(settingGroup: SettingGroup): void {
    const toolbar = this.tm.settings.toolbar;
    settingGroup.addSetting((setting) =>
      setting
        .setName("Pin toolbar as a dock")
        .setDesc(
          "Keep the toolbar docked at the bottom of the window instead of floating near your selection."
        )
        .setClass("md-writer-setting")
        .addToggle((toggle) =>
          toggle.setValue(toolbar.mode === "dock").onChange((value) => {
            if (!value && toolbar.dockAlwaysVisible) {
              toggle.setValue(true);
              new Notice(
                'Turn off "always show dock" before undocking the toolbar.'
              );
              return;
            }
            toolbar.mode = value ? "dock" : "floating";
            this.tm.saveSettings().catch((error) => {
              console.error("Failed to save settings:", error);
            });
          })
        )
    );
  }
}
