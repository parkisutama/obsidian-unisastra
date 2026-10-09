// Forward-only writing concept inspired by jobedom's obsidian-hemingway-mode
// (https://github.com/jobedom/obsidian-hemingway-mode). No code ported;
// upstream uses a CodeMirror `StateField`/`ViewPlugin` to toggle a CSS
// class, while this blocks the relevant keydown events directly.

import { FeatureToggle } from "@/capabilities/base/feature-toggle";

export default class HemingwayMode extends FeatureToggle {
	readonly settingKey = "hemingwayMode.isHemingwayModeEnabled" as const;
	protected override toggleClass = "unisastra-hemingway-mode-enabled";
	protected settingTitle = "Hemingway mode";
	protected settingDesc =
		"Prevents editing previously written text. Blocks navigation keys (arrows, Home, End, Page Up/Down), Delete key, and undo operations to enforce forward-only writing.";

	private statusBarItem: HTMLElement | null = null;
	private keyboardDocument: Document | null = null;
	private readonly onWindowUnload = () => this.unregisterKeyboardHandler();

	override load() {
		super.load();
		this.statusBarItem = this.tm.plugin.addStatusBarItem();
		this.statusBarItem.addClass("unisastra-hemingway-mode-status");
		this.updateStatusBar();
	}

	override enable() {
		super.enable();
		this.registerKeyboardHandler();
		this.updateStatusBar();
	}

	override disable() {
		super.disable();
		this.unregisterKeyboardHandler();
		this.updateStatusBar();
	}

	private updateStatusBar() {
		if (!this.statusBarItem) {
			return;
		}

		const isEnabled = this.getSettingValue() as boolean;
		const showStatusBar = this.tm.settings.hemingwayMode.isShowHemingwayModeStatusBarEnabled;
		const statusBarText = this.tm.settings.hemingwayMode.hemingwayModeStatusBarText;

		if (isEnabled && showStatusBar) {
			this.statusBarItem.setText(statusBarText);
			this.statusBarItem.show();
		} else {
			this.statusBarItem.hide();
		}
	}

	updateStatusBarText() {
		this.updateStatusBar();
	}

	private readonly keyboardHandler = (event: KeyboardEvent) => {
		if (!this.getSettingValue()) {
			return;
		}

		const settings = this.tm.settings.hemingwayMode;
		const isUndo = event.key === "z" && (event.ctrlKey || event.metaKey);

		const keyAllowSettings: Record<string, boolean> = {
			ArrowLeft: settings.isAllowArrowLeftInHemingwayModeEnabled,
			ArrowRight: settings.isAllowArrowRightInHemingwayModeEnabled,
			ArrowUp: settings.isAllowArrowUpInHemingwayModeEnabled,
			ArrowDown: settings.isAllowArrowDownInHemingwayModeEnabled,
			Home: settings.isAllowHomeInHemingwayModeEnabled,
			End: settings.isAllowEndInHemingwayModeEnabled,
			PageUp: settings.isAllowPageUpInHemingwayModeEnabled,
			PageDown: settings.isAllowPageDownInHemingwayModeEnabled,
			Delete: settings.isAllowDeleteInHemingwayModeEnabled,
			Backspace: settings.isAllowBackspaceInHemingwayModeEnabled,
		};

		const isForbiddenKey = event.key in keyAllowSettings && !keyAllowSettings[event.key];
		const isForbiddenUndo = isUndo && !settings.isAllowUndoInHemingwayModeEnabled;

		if (isForbiddenKey || isForbiddenUndo) {
			event.preventDefault();
			event.stopPropagation();
		}
	};

	private registerKeyboardHandler() {
		const doc = window.activeDocument;
		if (this.keyboardDocument === doc) {
			return;
		}
		this.unregisterKeyboardHandler();
		this.keyboardDocument = doc;
		doc.defaultView?.addEventListener("unload", this.onWindowUnload);
		doc.addEventListener("keydown", this.keyboardHandler, {
			capture: true,
		});
	}

	private unregisterKeyboardHandler() {
		this.keyboardDocument?.defaultView?.removeEventListener("unload", this.onWindowUnload);
		this.keyboardDocument?.removeEventListener("keydown", this.keyboardHandler, {
			capture: true,
		});
		this.keyboardDocument = null;
	}
}
