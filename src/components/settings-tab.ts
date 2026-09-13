import { type App, PluginSettingTab, SettingGroup } from "obsidian";
import { renderCalloutManager } from "@/components/callout-manager";
import type TypewriterModeLib from "@/lib";

interface TabDefinition {
  description: string;
  id: string;
  label: string;
  render: (container: HTMLElement) => void;
}

export default class TypewriterModeSettingTab extends PluginSettingTab {
  override icon = "type-outline";

  private readonly tm: TypewriterModeLib;
  private activeTab = "writingModes";

  constructor(app: App, tm: TypewriterModeLib) {
    super(app, tm.plugin);
    this.tm = tm;
  }

  setActiveTab(id: string): void {
    this.activeTab = id;
  }

  private registerFeaturesInGroup(
    group: SettingGroup,
    features: Record<string, { registerSetting: (group: SettingGroup) => void }>
  ) {
    for (const feature of Object.values(features)) {
      feature.registerSetting(group);
    }
  }

  private addTabDescription(container: HTMLElement, description: string) {
    const descEl = container.createDiv({ cls: "tm-tab-description" });
    descEl.setText(description);
  }

  private getTabs(): TabDefinition[] {
    return [
      {
        id: "writingModes",
        label: "Writing modes",
        description:
          "Preset feature combinations for different writing workflows. Select a mode to activate its preset, or choose None to manage features manually.",
        render: (container) => {
          this.addTabDescription(
            container,
            "Preset feature combinations for different writing workflows. Select a mode to activate its preset, or choose None to manage features manually."
          );
          const group = new SettingGroup(container);
          this.registerFeaturesInGroup(group, this.tm.features.writingModes);
        },
      },
      {
        id: "general",
        label: "General",
        description:
          "Plugin activation, platform settings, and cursor persistence. Active in all conditions.",
        render: (container) => {
          this.addTabDescription(
            container,
            "Plugin activation, platform settings, and cursor persistence. Active in all conditions."
          );
          const group = new SettingGroup(container);
          this.registerFeaturesInGroup(group, this.tm.features.general);
        },
      },
      {
        id: "toolbar",
        label: "Toolbar",
        description:
          "Floating formatting toolbar shown when you select text. Desktop only.",
        render: (container) => {
          this.addTabDescription(
            container,
            "Floating formatting toolbar shown when you select text. Desktop only."
          );
          const group = new SettingGroup(container);
          this.registerFeaturesInGroup(group, this.tm.features.toolbar);
        },
      },
      {
        id: "callouts",
        label: "Callouts",
        description:
          "Manage the callout catalog used by the toolbar's Callout menu: enable/hide, reorder, and add custom entries.",
        render: (container) => {
          const draw = () => {
            container.empty();
            this.addTabDescription(
              container,
              "Manage the callout catalog used by the toolbar's Callout menu: enable/hide, reorder, and add custom entries."
            );
            renderCalloutManager(container, this.tm, draw);
          };
          draw();
        },
      },
      {
        id: "compatibility",
        label: "Compatibility",
        description:
          "Markdown compatibility behavior for links and publishing-oriented notes.",
        render: (container) => {
          this.addTabDescription(
            container,
            "Markdown compatibility behavior for links and publishing-oriented notes."
          );
          const group = new SettingGroup(container);
          this.registerFeaturesInGroup(group, this.tm.features.compatibility);
        },
      },
      {
        id: "writingFocus",
        label: "Writing focus",
        description:
          "Hide Obsidian panels for a full writing space. Use in Writing or Idea mode.",
        render: (container) => {
          this.addTabDescription(
            container,
            "Hide Obsidian panels for a full writing space. Use in Writing or Idea mode."
          );
          const group = new SettingGroup(container);
          this.registerFeaturesInGroup(group, this.tm.features.writingFocus);
        },
      },
      {
        id: "outliner",
        label: "Outliner",
        description:
          "Zoom into bullet nodes and navigate idea hierarchies. Effective for Idea mode. May conflict with Typewriter if both are active.",
        render: (container) => {
          this.addTabDescription(
            container,
            "Zoom into bullet nodes and navigate idea hierarchies. Effective for Idea mode. May conflict with Typewriter if both are active."
          );
          const group = new SettingGroup(container);
          this.registerFeaturesInGroup(group, this.tm.features.outliner);
        },
      },
      {
        id: "hemingway",
        label: "Hemingway",
        description:
          "Block editing of previous text. Pair with Outliner in Idea mode or Typewriter in Writing mode. Disable during Editing.",
        render: (container) => {
          this.addTabDescription(
            container,
            "Block editing of previous text. Pair with Outliner in Idea mode or Typewriter in Writing mode. Disable during Editing."
          );
          const group = new SettingGroup(container);
          this.registerFeaturesInGroup(group, this.tm.features.hemingwayMode);
        },
      },
      {
        id: "dimming",
        label: "Dimming",
        description:
          "Dim paragraphs or sentences outside focus. Pairs naturally with Typewriter. Disable during Editing so all text is visible.",
        render: (container) => {
          this.addTabDescription(
            container,
            "Dim paragraphs or sentences outside focus. Pairs naturally with Typewriter. Disable during Editing so all text is visible."
          );
          const group = new SettingGroup(container);
          this.registerFeaturesInGroup(group, this.tm.features.dimming);
        },
      },
      {
        id: "currentLine",
        label: "Current line",
        description:
          "Visually highlight the active line. Useful in Editing mode. Redundant if Dimming is already active.",
        render: (container) => {
          this.addTabDescription(
            container,
            "Visually highlight the active line. Useful in Editing mode. Redundant if Dimming is already active."
          );
          const group = new SettingGroup(container);
          this.registerFeaturesInGroup(group, this.tm.features.currentLine);
        },
      },
      {
        id: "typewriter",
        label: "Typewriter",
        description:
          "Lock the cursor at a fixed vertical position. Core of Writing mode. Disable when Outliner is active as both manage scrolling differently.",
        render: (container) => {
          this.addTabDescription(
            container,
            "Lock the cursor at a fixed vertical position. Core of Writing mode. Disable when Outliner is active as both manage scrolling differently."
          );
          const group = new SettingGroup(container);
          if (
            this.tm.settings.keepLinesAboveAndBelow
              .isKeepLinesAboveAndBelowEnabled
          ) {
            group.addSetting((setting) =>
              setting.setName(
                'Not available if "keep lines above and below" is activated'
              )
            );
          }
          this.registerFeaturesInGroup(group, this.tm.features.typewriter);
        },
      },
      {
        id: "keepLines",
        label: "Keep lines",
        description:
          "A lighter alternative to Typewriter — maintain line spacing above and below the cursor. Choose one, not both.",
        render: (container) => {
          this.addTabDescription(
            container,
            "A lighter alternative to Typewriter — maintain line spacing above and below the cursor. Choose one, not both."
          );
          const group = new SettingGroup(container);
          if (this.tm.settings.typewriter.isTypewriterScrollEnabled) {
            group.addSetting((setting) =>
              setting.setName(
                "Not available if typewriter scrolling is activated"
              )
            );
          }
          this.registerFeaturesInGroup(
            group,
            this.tm.features.keepAboveAndBelow
          );
        },
      },
      {
        id: "whitespace",
        label: "Whitespace",
        description:
          "Visualize spaces, tabs, and line breaks. Specifically for Editing and pre-publish review.",
        render: (container) => {
          this.addTabDescription(
            container,
            "Visualize spaces, tabs, and line breaks. Specifically for Editing and pre-publish review."
          );
          const group = new SettingGroup(container);
          this.registerFeaturesInGroup(group, this.tm.features.showWhitespace);
        },
      },
      {
        id: "maxChar",
        label: "Line width",
        description:
          "Character limit per line and long line warnings. Useful in Editing for readability and clean Git diffs.",
        render: (container) => {
          this.addTabDescription(
            container,
            "Character limit per line and long line warnings. Useful in Editing for readability and clean Git diffs."
          );
          const group = new SettingGroup(container);
          this.registerFeaturesInGroup(group, this.tm.features.maxChar);
        },
      },
    ];
  }

  override display(): void {
    this.containerEl.empty();
    this.containerEl.addClass("tm-settings");

    const tabs = this.getTabs();

    const tabBar = this.containerEl.createDiv({ cls: "tm-settings-tab-bar" });
    const contentEl = this.containerEl.createDiv({
      cls: "tm-settings-content",
    });

    const renderTab = (tabId: string) => {
      this.activeTab = tabId;
      contentEl.empty();

      Array.from(tabBar.querySelectorAll(".tm-settings-tab")).forEach((btn) => {
        btn.classList.toggle(
          "is-active",
          btn.getAttribute("data-tab-id") === tabId
        );
      });

      const tab = tabs.find((t) => t.id === tabId);
      if (tab) {
        tab.render(contentEl);
      }
    };

    for (const tab of tabs) {
      const tabBtn = tabBar.createDiv({
        cls: "tm-settings-tab",
        text: tab.label,
      });
      tabBtn.setAttribute("data-tab-id", tab.id);
      tabBtn.addEventListener("click", () => renderTab(tab.id));
    }

    const activeTabExists = tabs.some((t) => t.id === this.activeTab);
    renderTab(activeTabExists ? this.activeTab : tabs[0].id);
  }
}
