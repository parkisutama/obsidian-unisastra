import type { SettingGroup } from "obsidian";
import { Feature } from "./feature";

export abstract class FeatureToggle extends Feature {
  protected toggleClass: string | null = null;
  readonly isToggleClassPersistent: boolean = false;

  protected abstract settingTitle: string;
  protected abstract settingDesc: string;

  override getBodyClasses(): string[] {
    if (this.toggleClass) {
      return [this.toggleClass];
    }
    return [];
  }

  protected isSettingEnabled() {
    return true;
  }

  getToggleClass() {
    return this.toggleClass;
  }

  registerSetting(settingGroup: SettingGroup) {
    settingGroup.addSetting((setting) =>
      setting
        .setName(this.settingTitle)
        .setDesc(this.settingDesc)
        .setClass("unisastra-setting")
        .addToggle((toggle) =>
          toggle
            .setValue(this.getSettingValue() as boolean)
            .onChange((newValue) => {
              this.toggle(newValue);
            })
        )
        .setDisabled(!this.isSettingEnabled())
    );
  }

  override load() {
    this.getSettingValue() ? this.enable() : this.disable();
  }

  toggle(pNewValue: boolean | null = null) {
    // if no value is passed in, toggle the existing value
    let newValue = pNewValue;
    if (newValue === null) {
      newValue = !this.getSettingValue();
    }

    this.applyValue(newValue);

    this.tm.saveSettings().catch((error) => {
      console.error("Failed to save settings:", error);
    });
  }

  /** Apply a preset member without persisting a partially applied recipe. */
  applyValue(value: boolean): void {
    if (this.getSettingValue() === value) {
      return;
    }
    this.setSettingValue(value);
    value ? this.enable() : this.disable();
  }

  override enable() {
    if (this.toggleClass) {
      const el = this.isToggleClassPersistent
        ? "persistentBodyClasses"
        : "bodyClasses";
      if (!this.tm.perWindowProps[el].contains(this.toggleClass)) {
        this.tm.perWindowProps[el].push(this.toggleClass);
      }
    }
  }

  override disable() {
    if (this.toggleClass) {
      const el = this.isToggleClassPersistent
        ? "persistentBodyClasses"
        : "bodyClasses";
      this.tm.perWindowProps[el].remove(this.toggleClass);
    }
  }
}
