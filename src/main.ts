import { type App, Plugin, type PluginManifest } from "obsidian";
import type { UnisastraSettings } from "./capabilities/settings";
import UnisastraCore from "./lib";

export default class UnisastraPlugin extends Plugin {
  private readonly tm: UnisastraCore;

  constructor(app: App, manifest: PluginManifest) {
    super(app, manifest);
    this.tm = new UnisastraCore(
      this,
      async () => await this.loadData(),
      async (settings: UnisastraSettings) => await this.saveData(settings)
    );
  }

  override async onload() {
    await this.tm.load();

    this.tm.loadSettingsTab();
  }
  override onunload() {
    this.tm.unload();
  }
}
