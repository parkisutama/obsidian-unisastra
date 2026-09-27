import { Platform } from "obsidian";
import { FeatureToggle } from "@/capabilities/base/feature-toggle";
import { ObsidianSidebarHost } from "./sidebar-resize/adapter";
import { SidebarResizeController } from "./sidebar-resize/controller";

export default class SidebarEqualResize extends FeatureToggle {
  readonly settingKey = "general.isSidebarEqualResizeEnabled" as const;
  protected settingTitle = "Sinkronkan lebar sidebar";
  protected settingDesc =
    "Samakan lebar sidebar kiri dan kanan saat keduanya terbuka. Desktop Obsidian 1.14.2; nonaktifkan snippet yang memaksa lebar sidebar.";
  private controller: SidebarResizeController | null = null;
  private loaded = false;
  private generation = 0;
  private waiting = false;

  override load(): void {
    this.loaded = true;
    this.refresh();
  }
  override enable(): void {
    this.refresh();
  }
  override disable(): void {
    this.generation++;
    this.waiting = false;
    this.controller?.stop();
    this.controller = null;
  }
  dispose(): void {
    this.loaded = false;
    this.disable();
  }
  protected override isSettingEnabled(): boolean {
    return Platform.isDesktopApp;
  }

  refresh(): void {
    const general = this.tm.settings.general;
    if (
      !(this.loaded && Platform.isDesktopApp && general.isPluginActivated) ||
      general.enabledPlatforms === "mobile" ||
      !general.isSidebarEqualResizeEnabled
    ) {
      this.disable();
      return;
    }
    if (this.controller || this.waiting) {
      return;
    }
    this.waiting = true;
    const generation = this.generation;
    this.tm.plugin.app.workspace.onLayoutReady(() => {
      if (generation !== this.generation || !this.waiting) {
        return;
      }
      this.waiting = false;
      this.controller = new SidebarResizeController(
        new ObsidianSidebarHost(this.tm.plugin.app)
      );
      this.controller.start();
    });
  }
}
