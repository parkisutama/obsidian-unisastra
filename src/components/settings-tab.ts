import {
  type App,
  Component,
  PluginSettingTab,
  Setting,
  SettingGroup,
  setIcon,
} from "obsidian";
import type WritingModePresetConfig from "@/capabilities/features/writing-modes/preset-config";
import { renderCalloutManager } from "@/components/callout-manager";
import { renderToolbarButtonOrder } from "@/components/toolbar-button-order";
import { renderTypewriterSettings } from "@/components/typewriter-settings";
import type UnisastraCore from "@/lib";

const CAPABILITIES = [
  ["writingFocus", "Writing Focus"],
  ["outliner", "Outliner"],
  ["hemingwayMode", "Hemingway"],
  ["dimming", "Dimming"],
  ["currentLine", "Current Line"],
  ["typewriter", "Typewriter"],
  ["showWhitespace", "Whitespace"],
  ["maxChar", "Line Width"],
] as const;

export default class UnisastraSettingTab extends PluginSettingTab {
  override icon = "type-outline";
  private activeTab = "overview";
  private previewComponent: Component | null = null;
  private visible = false;
  private revision = 0;
  private overviewScroll = 0;
  private returnRow: string | null = null;
  private readonly tm: UnisastraCore;

  constructor(app: App, tm: UnisastraCore) {
    super(app, tm.plugin);
    this.tm = tm;
  }

  private clearPreviewComponent(): void {
    if (this.previewComponent) {
      this.tm.plugin.removeChild(this.previewComponent);
      this.previewComponent = null;
    }
  }

  override hide(): void {
    this.visible = false;
    this.revision++;
    this.clearPreviewComponent();
  }

  setActiveTab(id: string): void {
    this.activeTab = id;
  }

  private registerGroup(
    container: HTMLElement,
    ...keys: string[]
  ): SettingGroup {
    const group = new SettingGroup(container);
    for (const key of keys) {
      for (const feature of Object.values(this.tm.features[key] ?? {})) {
        feature.registerSetting(group);
      }
    }
    return group;
  }

  private navigate(id: string): void {
    if (this.activeTab === "overview") {
      this.overviewScroll = this.containerEl.scrollTop;
      this.returnRow = id;
    }
    this.activeTab = id;
    this.display();
  }

  private row(
    container: HTMLElement,
    id: string,
    label: string,
    description?: string
  ): HTMLButtonElement {
    const button = container.createEl("button", {
      cls: "tm-settings-row",
    });
    button.setAttribute("type", "button");
    button.setAttribute("aria-label", label);
    const info = button.createSpan({ cls: "tm-settings-row-info" });
    info.createSpan({ cls: "tm-settings-row-label", text: label });
    if (description) {
      info.createSpan({
        cls: "tm-settings-row-description",
        text: description,
      });
    }
    const chevron = button.createSpan({ cls: "tm-settings-chevron" });
    chevron.setAttribute("aria-hidden", "true");
    setIcon(chevron, "chevron-right");
    button.addEventListener("click", () => this.navigate(id));
    return button;
  }

  private renderOverview(container: HTMLElement): void {
    // The maintainer explicitly requested General as the compatibility grouping.
    // eslint-disable-next-line obsidianmd/settings-tab/no-problematic-settings-headings
    new Setting(container).setName("General").setHeading();
    const generalPanel = container.createDiv({
      cls: "tm-settings-panel tm-settings-general",
    });
    const general = this.registerGroup(
      generalPanel,
      "general",
      "compatibility"
    );
    const rows = new Map<string, HTMLButtonElement>();
    const toolbarDescription =
      "Formatting actions, floating toolbar, dock, timers, and button order. Desktop only.";
    rows.set(
      "toolbar",
      this.row(general.listEl, "toolbar", "Toolbar", toolbarDescription)
    );
    rows.set(
      "callouts",
      this.row(
        general.listEl,
        "callouts",
        "Callouts",
        "Manage callout types, visibility, order, and appearance."
      )
    );
    new Setting(container).setName("Writing modes presets").setHeading();
    const active = this.tm.features.writingModes["writingMode.activeMode"];
    const presets = container.createDiv({
      cls: "tm-settings-panel tm-settings-presets",
    });
    const presetGroup = new SettingGroup(presets);
    active?.registerSetting(presetGroup);
    for (const mode of ["normal", "idea", "writing", "editing"] as const) {
      const id = `preset:${mode}`;
      rows.set(
        id,
        this.row(
          presetGroup.listEl,
          id,
          mode.charAt(0).toUpperCase() + mode.slice(1)
        )
      );
    }
    new Setting(container)
      .setName("Capabilities")
      .setDesc(
        "Configure the features used by writing modes. These settings adjust feature behavior; preset recipes choose which features a mode activates."
      )
      .setHeading();
    const capabilities = container.createDiv({
      cls: "tm-settings-panel tm-settings-capabilities",
    });
    for (const [id, label] of CAPABILITIES) {
      rows.set(id, this.row(capabilities, id, label));
    }
    if (this.returnRow) {
      rows.get(this.returnRow)?.focus({ preventScroll: true });
    }
    this.containerEl.scrollTop = this.overviewScroll;
  }

  private renderDetail(container: HTMLElement): void {
    const id = this.activeTab;
    const mode = id.startsWith("preset:") ? id.slice(7) : null;
    const capability = CAPABILITIES.find(([key]) => key === id);
    const title = mode
      ? `${mode.charAt(0).toUpperCase()}${mode.slice(1)} preset`
      : (capability?.[1] ?? (id === "toolbar" ? "Toolbar" : "Callouts"));
    const header = container.createDiv({ cls: "tm-settings-detail-header" });
    const back = header.createEl("button", {
      cls: "tm-settings-back",
    });
    back.setAttribute("type", "button");
    back.setAttribute("aria-label", "Back to settings");
    back.setAttribute("title", "Back to settings");
    setIcon(back, "chevron-left");
    back.addEventListener("click", () => this.navigate("overview"));
    const heading = new Setting(header)
      .setName(title)
      .setHeading()
      .setClass("tm-settings-title").nameEl;
    heading.setAttribute("tabindex", "-1");
    if (id === "toolbar") {
      container.createDiv({
        cls: "tm-settings-detail-description",
        text: "Configure formatting actions, the floating toolbar and dock, elapsed timers, and button order. Desktop only.",
      });
    }
    const body = container.createDiv({ cls: "tm-settings-detail" });
    const revision = this.revision;
    const draw = () => {
      if (!this.visible || revision !== this.revision || !body.isConnected) {
        return;
      }
      body.empty();
      if (id === "callouts") {
        this.clearPreviewComponent();
        this.previewComponent = this.tm.plugin.addChild(new Component());
        renderCalloutManager(body, this.tm, draw, this.previewComponent);
      } else if (id === "toolbar") {
        this.registerGroup(body, "toolbar");
        renderToolbarButtonOrder(body, this.tm, draw);
      } else if (
        mode &&
        ["normal", "idea", "writing", "editing"].includes(mode)
      ) {
        const feature = this.tm.features.writingModes[
          "writingMode.presets"
        ] as WritingModePresetConfig;
        feature.registerMode(
          new SettingGroup(body),
          mode as "normal" | "idea" | "writing" | "editing"
        );
      } else if (id === "typewriter") {
        renderTypewriterSettings(body, this.tm);
      } else if (capability) {
        this.registerGroup(body, id);
      }
    };
    draw();
    this.containerEl.scrollTop = 0;
    heading.focus({ preventScroll: true });
  }

  override display(): void {
    this.visible = true;
    this.revision++;
    this.clearPreviewComponent();
    this.containerEl.empty();
    this.containerEl.addClass("tm-settings");
    const valid =
      this.activeTab === "toolbar" ||
      this.activeTab === "callouts" ||
      this.activeTab.startsWith("preset:") ||
      CAPABILITIES.some(([id]) => id === this.activeTab);
    if (!valid) {
      this.activeTab = "overview";
    }
    if (this.activeTab === "overview") {
      this.renderOverview(this.containerEl);
    } else {
      this.renderDetail(this.containerEl);
    }
  }
}
