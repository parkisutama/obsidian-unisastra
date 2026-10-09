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
import { createOutlinerExtension, getOutlinerReconfigureEffects } from "@/cm6/outliner";
import { createBlockIdHiderPlugin } from "@/cm6/outliner/block-id";
import { calculateOutlinerRange } from "@/cm6/outliner/calculate-range";
import { foldPlatformEnabled } from "@/cm6/outliner/fold-context";
import { createFoldPersistExtension } from "@/cm6/outliner/fold-persist";
import { dispatchOutlinerFocus, dispatchOutlinerUnfocus } from "@/cm6/outliner/utils";
import type { PerWindowProps } from "@/cm6/per-window-props";
import createUnisastraViewPlugin from "@/cm6/plugin";
import { createShowWhitespaceExtension } from "@/cm6/show-whitespace";
import { createToolbarSelectionExtension } from "@/cm6/toolbar-selection";
import { createWarnLongLineExtension } from "@/cm6/warn-long-line";
import { createFloatyToolbarSurface } from "@/components/floaty-toolbar/toolbar";
import { OUTLINE_VIEW_TYPE, OutlineView } from "@/components/outline-view";
import UnisastraSettingTab from "@/components/settings-tab";
import { createGFMAnchorLivePreviewExtension, registerGFMAnchorCompatibility } from "@/gfm-anchor";
import type { AbstractCommand } from "./capabilities/base/abstract-command";
import type { Feature } from "./capabilities/base/feature";
import { getCommands } from "./capabilities/commands";
import { getFeatures } from "./capabilities/features";
import { CalloutStyles } from "./capabilities/features/callouts/styles";
import { FoldPersistenceCoordinator } from "./capabilities/features/fold-persist/coordinator";
import type SidebarEqualResize from "./capabilities/features/general/sidebar-equal-resize";
import type RestoreCursorPosition from "./capabilities/features/restore-cursor-position/restore-cursor-position";
import { ToolbarController } from "./capabilities/features/toolbar/controller";
import {
	applyStartupMigrations,
	DEFAULT_SETTINGS,
	type UnisastraSettings,
} from "./capabilities/settings";
import { SettingsWriter } from "./settings-writer";

export default class UnisastraCore {
	readonly plugin: Plugin;
	private readonly loadData: () => Promise<UnisastraSettings>;
	private readonly settingsWriter: SettingsWriter<UnisastraSettings>;
	readonly foldPersistence: FoldPersistenceCoordinator;

	settings: UnisastraSettings = DEFAULT_SETTINGS;

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
	private readonly calloutStyles = new CalloutStyles();
	private settingTab: UnisastraSettingTab | null = null;

	constructor(
		plugin: Plugin,
		loadData: () => Promise<UnisastraSettings>,
		saveData: (settings: UnisastraSettings) => Promise<void>,
	) {
		this.plugin = plugin;
		this.loadData = loadData;
		this.settingsWriter = new SettingsWriter(saveData);
		this.foldPersistence = new FoldPersistenceCoordinator({
			enabled: () => foldPlatformEnabled(this) && this.settings.foldPersist.isFoldPersistEnabled,
			state: () => this.settings.foldPersist.foldState,
			persist: (allowed) => this.settingsWriter.save(this.settings, allowed),
		});
		this.toolbar = new ToolbarController(this);

		// Features must be loaded first!
		this.features = getFeatures(this);
		this.commands = getCommands(this);

		this.editorExtensions = [
			createBlockIdHiderPlugin(this),
			createFoldPersistExtension(this),
			createToolbarSelectionExtension(this.toolbar),
			createUnisastraViewPlugin(this),
			createShowWhitespaceExtension(),
			createOutlinerExtension(this.settings.outliner, (view, pos) =>
				this.outlinerFocusAtPosition(view, pos),
			),
			createWarnLongLineExtension(this),
			createGFMAnchorLivePreviewExtension(this.plugin, () =>
				this.isGFMAnchorCompatibilityEnabled(),
			),
		];
	}

	async load() {
		await this.loadSettings();
		await this.saveSettings(); // if default settings were loaded

		this.registerOutlineView();
		registerGFMAnchorCompatibility(this.plugin, () => this.isGFMAnchorCompatibilityEnabled());
		this.loadPerWindowProps();
		this.loadEditorExtension();
		this.plugin.registerEvent(
			this.plugin.app.vault.on("rename", (file, oldPath) =>
				this.foldPersistence.rename(oldPath, file.path),
			),
		);
		this.plugin.registerEvent(
			this.plugin.app.vault.on("delete", (file) => this.foldPersistence.delete(file.path)),
		);
		this.toolbar.setSurfaceFactory(createFloatyToolbarSurface);
		this.toolbar.load();
		this.loadCalloutStyles();
	}

	private loadCalloutStyles(): void {
		const workspace = this.plugin.app.workspace;
		this.calloutStyles.open(workspace.containerEl.ownerDocument);
		workspace.iterateAllLeaves((leaf) => {
			this.calloutStyles.open(leaf.view.containerEl.ownerDocument);
		});
		this.plugin.registerEvent(
			workspace.on("window-open", (_host, win) => {
				this.calloutStyles.open(win.document);
			}),
		);
		this.plugin.registerEvent(
			workspace.on("window-close", (_host, win) => {
				this.calloutStyles.close(win.document);
			}),
		);
		this.calloutStyles.update(this.settings.callouts.entries);
	}

	private isGFMAnchorCompatibilityEnabled(): boolean {
		return this.settings.compatibility.isGFMAnchorCompatibilityEnabled;
	}

	private registerOutlineView() {
		this.plugin.registerView(OUTLINE_VIEW_TYPE, (leaf) => new OutlineView(leaf, this));
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
		this.settingTab = new UnisastraSettingTab(this.plugin.app, this);
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
		this.foldPersistence.destroy();
		this.getSidebarResizeFeature().dispose();
		this.calloutStyles.destroy();
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
			console.error("Unisastra: Unable to determine plugin manifest directory.");
			return;
		}

		const rawData = await this.loadData();
		this.settings = await applyStartupMigrations(rawData ?? {}, this.plugin.app.vault, manifestDir);
	}

	async saveSettings() {
		this.foldPersistence.refresh();
		this.getSidebarResizeFeature().refresh();
		await this.settingsWriter.save(this.settings);
		if (this.calloutStyles.update(this.settings.callouts.entries)) {
			this.plugin.app.workspace.trigger("css-change");
		}
		this.plugin.app.workspace.updateOptions();
		this.toolbar.refresh();
	}

	setCSSVariable(property: string, value: string) {
		this.perWindowProps.cssVariables[property] = value;
	}

	private getSidebarResizeFeature(): SidebarEqualResize {
		return this.features.general["general.isSidebarEqualResizeEnabled"] as SidebarEqualResize;
	}

	reconfigureOutliner() {
		const effects = getOutlinerReconfigureEffects(this.settings.outliner, (view, pos) =>
			this.outlinerFocusAtPosition(view, pos),
		);

		for (const leaf of this.plugin.app.workspace.getLeavesOfType("markdown")) {
			const editor = (leaf.view as unknown as { editor?: { cm?: EditorView } }).editor;
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
				'To use outliner focus, enable "fold heading" and "fold indent" in settings → editor',
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
		relation: "parent" | "first-child" | "next-sibling" | "previous-sibling",
	) {
		const currentItem = resolveListItem(view.state, view.state.selection.main.head);
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
