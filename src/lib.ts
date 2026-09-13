import type { Extension } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { Notice, type Plugin } from "obsidian";
import {
  getFirstChild,
  getNextSibling,
  getParentItem,
  getPreviousSibling,
  resolveListItem,
} from "@/cm6/list-service";
import {
  createOutlinerExtension,
  getOutlinerReconfigureEffects,
} from "@/cm6/outliner";
import { calculateOutlinerRange } from "@/cm6/outliner/calculate-range";
import {
  dispatchOutlinerFocus,
  dispatchOutlinerUnfocus,
} from "@/cm6/outliner/utils";
import type { PerWindowProps } from "@/cm6/per-window-props";
import createTypewriterModeViewPlugin from "@/cm6/plugin";
import { createShowWhitespaceExtension } from "@/cm6/show-whitespace";
import { createToolbarSelectionExtension } from "@/cm6/toolbar-selection";
import { createWarnLongLineExtension } from "@/cm6/warn-long-line";
import { createFloatyToolbarSurface } from "@/components/floaty-toolbar/toolbar";
import { OUTLINE_VIEW_TYPE, OutlineView } from "@/components/outline-view";
import TypewriterModeSettingTab from "@/components/settings-tab";
import {
  createGFMAnchorLivePreviewExtension,
  registerGFMAnchorCompatibility,
} from "@/gfm-anchor";
import type { AbstractCommand } from "./capabilities/base/abstract-command";
import type { Feature } from "./capabilities/base/feature";
import { getCommands } from "./capabilities/commands";
import { getFeatures } from "./capabilities/features";
import type RestoreCursorPosition from "./capabilities/features/restore-cursor-position/restore-cursor-position";
import { ToolbarController } from "./capabilities/features/toolbar/controller";
import {
  applyStartupMigrations,
  DEFAULT_SETTINGS,
  type TypewriterModeSettings,
} from "./capabilities/settings";

export default class TypewriterModeLib {
  readonly plugin: Plugin;
  private readonly loadData: () => Promise<TypewriterModeSettings>;
  private readonly saveData: (
    settings: TypewriterModeSettings
  ) => Promise<void>;

  settings: TypewriterModeSettings = DEFAULT_SETTINGS;

  perWindowProps: PerWindowProps = {
    cssVariables: {},
    bodyClasses: [],
    bodyAttrs: {},
    allBodyClasses: [],
    persistentBodyClasses: [],
  };

  private readonly editorExtensions: Extension[];

  readonly features: Record<string, Record<string, Feature>>;
  readonly commands: Record<string, AbstractCommand>;
  readonly toolbar: ToolbarController;
  private settingTab: TypewriterModeSettingTab | null = null;

  constructor(
    plugin: Plugin,
    loadData: () => Promise<TypewriterModeSettings>,
    saveData: (settings: TypewriterModeSettings) => Promise<void>
  ) {
    this.plugin = plugin;
    this.loadData = loadData;
    this.saveData = saveData;
    this.toolbar = new ToolbarController(this);

    // Features must be loaded first!
    this.features = getFeatures(this);
    this.commands = getCommands(this);

    this.editorExtensions = [
      createToolbarSelectionExtension(this.toolbar),
      createTypewriterModeViewPlugin(this),
      createShowWhitespaceExtension(),
      createOutlinerExtension(this.settings.outliner, (view, pos) =>
        this.outlinerFocusAtPosition(view, pos)
      ),
      createWarnLongLineExtension(this),
      createGFMAnchorLivePreviewExtension(this.plugin, () =>
        this.isGFMAnchorCompatibilityEnabled()
      ),
    ];
  }

  async load() {
    await this.loadSettings();
    await this.saveSettings(); // if default settings were loaded

    this.registerOutlineView();
    registerGFMAnchorCompatibility(this.plugin, () =>
      this.isGFMAnchorCompatibilityEnabled()
    );
    this.loadPerWindowProps();
    this.loadEditorExtension();
    this.toolbar.setSurfaceFactory(createFloatyToolbarSurface);
    this.toolbar.load();
  }

  private isGFMAnchorCompatibilityEnabled(): boolean {
    return this.settings.compatibility.isGFMAnchorCompatibilityEnabled;
  }

  private registerOutlineView() {
    this.plugin.registerView(
      OUTLINE_VIEW_TYPE,
      (leaf) => new OutlineView(leaf, this)
    );
  }

  private getOutlineViews(): OutlineView[] {
    return this.plugin.app.workspace
      .getLeavesOfType(OUTLINE_VIEW_TYPE)
      .map((leaf) => leaf.view)
      .filter((view): view is OutlineView => view instanceof OutlineView);
  }

  private refreshOutlineViews() {
    for (const view of this.getOutlineViews()) {
      view.requestRefresh();
    }
  }

  async ensureOutlineView(): Promise<OutlineView | null> {
    const existingView = this.getOutlineViews()[0];
    if (existingView) {
      return existingView;
    }

    const leaf = this.plugin.app.workspace.getRightLeaf(false);
    if (!leaf) {
      return null;
    }

    await leaf.setViewState({
      type: OUTLINE_VIEW_TYPE,
      active: true,
    });

    const createdView = leaf.view;
    return createdView instanceof OutlineView ? createdView : null;
  }

  loadPerWindowProps() {
    let allBodyClasses: string[] = [];
    for (const category of Object.values(this.features)) {
      for (const feature of Object.values(category)) {
        feature.load();
        allBodyClasses = allBodyClasses.concat(feature.getBodyClasses());
      }
    }
    this.perWindowProps.allBodyClasses = allBodyClasses;
    for (const command of Object.values(this.commands)) {
      command.load();
    }
  }

  getRestoreCursorPositionFeature(): RestoreCursorPosition {
    return this.features.general[
      "restoreCursorPosition.isRestoreCursorPositionEnabled"
    ] as RestoreCursorPosition;
  }

  loadEditorExtension() {
    this.plugin.registerEditorExtension(this.editorExtensions);
  }

  loadSettingsTab() {
    this.settingTab = new TypewriterModeSettingTab(this.plugin.app, this);
    this.plugin.addSettingTab(this.settingTab);
  }

  /**
   * Opens Settings to this plugin's Callouts tab, from the toolbar's
   * Callout menu. `app.setting` (open/openTabById) is an internal,
   * undocumented Obsidian API used by convention across community plugins;
   * it is not in obsidian.d.ts, so it is accessed defensively with a
   * fallback Notice if it is ever unavailable.
   */
  openCalloutManager(): void {
    this.settingTab?.setActiveTab("callouts");
    const appWithSettings = this.plugin.app as unknown as {
      setting?: { open?: () => void; openTabById?: (id: string) => void };
    };
    if (appWithSettings.setting?.open && appWithSettings.setting.openTabById) {
      appWithSettings.setting.open();
      appWithSettings.setting.openTabById(this.plugin.manifest.id);
    } else {
      new Notice("Open plugin settings, then open the callouts tab.");
    }
  }

  unload() {
    this.toolbar.destroy();
    for (const category of Object.values(this.features)) {
      for (const feature of Object.values(category)) {
        feature.disable();
      }
    }
  }

  async loadSettings() {
    const manifestDir = this.plugin.manifest.dir;
    if (!manifestDir) {
      console.error(
        "MD Writer: Unable to determine plugin manifest directory."
      );
      return;
    }

    const rawData = await this.loadData();
    this.settings = await applyStartupMigrations(
      rawData ?? {},
      this.plugin.app.vault,
      manifestDir
    );
  }

  async saveSettings() {
    await this.saveData(this.settings);
    this.plugin.app.workspace.updateOptions();
    this.toolbar.refresh();
  }

  setCSSVariable(property: string, value: string) {
    this.perWindowProps.cssVariables[property] = value;
  }

  reconfigureOutliner() {
    const effects = getOutlinerReconfigureEffects(
      this.settings.outliner,
      (view, pos) => this.outlinerFocusAtPosition(view, pos)
    );

    for (const leaf of this.plugin.app.workspace.getLeavesOfType("markdown")) {
      const editor = (leaf.view as unknown as { editor?: { cm?: EditorView } })
        .editor;
      if (editor?.cm instanceof EditorView) {
        editor.cm.dispatch({ effects });
      }
    }
  }

  outlinerFocusAtCursor(view: EditorView) {
    const config = {
      foldHeading: true,
      foldIndent: true,
      ...(
        this.plugin.app.vault as unknown as {
          config: Record<string, unknown>;
        }
      ).config,
    };

    if (!(config.foldHeading && config.foldIndent)) {
      new Notice(
        'To use outliner focus, enable "fold heading" and "fold indent" in settings → editor'
      );
      return;
    }

    this.outlinerFocusAtPosition(view, view.state.selection.main.head);
  }

  outlinerFocusAtPosition(view: EditorView, pos: number) {
    const range = calculateOutlinerRange(view.state, pos);
    if (!range) {
      return;
    }

    dispatchOutlinerFocus(view, range.from, range.to);
    this.refreshOutlineViews();
  }

  outlinerUnfocus(view: EditorView) {
    dispatchOutlinerUnfocus(view);
    this.refreshOutlineViews();
  }

  focusOutlinerRelation(
    view: EditorView,
    relation: "parent" | "first-child" | "next-sibling" | "previous-sibling"
  ) {
    const currentItem = resolveListItem(
      view.state,
      view.state.selection.main.head
    );
    if (!currentItem) {
      return false;
    }

    let targetItem: ReturnType<typeof resolveListItem> = null;
    if (relation === "parent") {
      targetItem = getParentItem(view.state, currentItem);
    } else if (relation === "first-child") {
      targetItem = getFirstChild(view.state, currentItem);
    } else if (relation === "next-sibling") {
      targetItem = getNextSibling(view.state, currentItem);
    } else {
      targetItem = getPreviousSibling(view.state, currentItem);
    }

    if (!targetItem) {
      return false;
    }

    this.outlinerFocusAtPosition(view, targetItem.from);
    return true;
  }

  async revealActiveOutlineNode(focus = true) {
    const outlineView = await this.ensureOutlineView();
    outlineView?.revealActiveNode(focus);
    return outlineView !== null;
  }

  async setOutlineFilterMode(mode: "all" | "branch" | "tasks") {
    const outlineView = await this.ensureOutlineView();
    outlineView?.setFilterMode(mode);
    return outlineView !== null;
  }

  async cycleOutlineFilterMode() {
    const outlineView = await this.ensureOutlineView();
    return outlineView?.cycleFilterMode() ?? null;
  }
}
