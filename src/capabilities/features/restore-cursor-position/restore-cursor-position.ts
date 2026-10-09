// SPDX-License-Identifier: GPL-3.0-only AND MIT
// Derived from Typewriter Mode (https://github.com/davisriedel/obsidian-typewriter-mode)
// Copyright (c) 2023-2026 Davis Riedel
// Modifications Copyright (C) 2025-2026 Parkis Utama

// ADAPTED FROM https://github.com/dy-sh/obsidian-remember-cursor-position/blob/master/main.ts

import { EditorSelection, type SelectionRange } from "@codemirror/state";
import type { EditorView } from "@codemirror/view";
import type { TAbstractFile, TFile } from "obsidian";
import { FeatureToggle } from "@/capabilities/base/feature-toggle";

type ObsidianEventHandler = (...data: unknown[]) => unknown;

function clampCursorPosition(position: number, docLength: number): number {
	if (!Number.isFinite(position)) {
		return 0;
	}

	return Math.max(0, Math.min(position, docLength));
}

export default class RestoreCursorPosition extends FeatureToggle {
	private readonly frames = new Map<number, Window>();
	private enabled = false;
	readonly settingKey = "restoreCursorPosition.isRestoreCursorPositionEnabled" as const;
	protected settingTitle = "Restore cursor position";
	protected settingDesc = "Restore the last cursor position when opening files";

	get state(): Record<string, SelectionRange> {
		return this.tm.settings.restoreCursorPosition.cursorPositions as Record<string, SelectionRange>;
	}

	set state(value: Record<string, SelectionRange>) {
		this.tm.settings.restoreCursorPosition.cursorPositions = value;
	}

	getFilePathForEditorView(cm: EditorView): string | null {
		const leaves = this.tm.plugin.app.workspace.getLeavesOfType("markdown");

		for (const leaf of leaves) {
			const markdownView = leaf.view as unknown as {
				editor?: { cm?: EditorView };
				file?: TFile | null;
			};

			if (markdownView.editor?.cm === cm) {
				return markdownView.file?.path ?? null;
			}
		}

		return null;
	}

	override enable(): void {
		if (this.enabled) {
			return;
		}
		this.enabled = true;
		super.enable();

		this.tm.plugin.registerEvent(this.tm.plugin.app.workspace.on("quit", this.saveState));

		this.tm.plugin.registerEvent(this.tm.plugin.app.vault.on("rename", this.onRenameFile));

		this.tm.plugin.registerEvent(this.tm.plugin.app.vault.on("delete", this.onDeleteFile));

		this.tm.plugin.registerEvent(this.tm.plugin.app.workspace.on("file-open", this.onFileOpen));
	}

	override disable(): void {
		this.enabled = false;
		for (const [frame, win] of this.frames) {
			win.cancelAnimationFrame(frame);
		}
		this.frames.clear();
		this.saveState().catch((error: unknown) => {
			console.error("Failed to save cursor positions:", error);
		});
		this.tm.plugin.app.workspace.off("quit", this.saveState);
		this.tm.plugin.app.vault.off("rename", this.onRenameFile as ObsidianEventHandler);
		this.tm.plugin.app.vault.off("delete", this.onDeleteFile as ObsidianEventHandler);
		this.tm.plugin.app.workspace.off("file-open", this.onFileOpen as ObsidianEventHandler);
	}

	saveState = async (): Promise<void> => {
		await this.tm.saveSettings();
	};

	private readonly onRenameFile = (file: TAbstractFile, oldPath: string): void => {
		const newName = file.path;
		const oldName = oldPath;
		const savedState = this.state[oldName];
		if (!savedState) {
			return;
		}

		this.state[newName] = savedState;
		delete this.state[oldName];
	};

	private readonly onDeleteFile = (file: TAbstractFile): void => {
		const fileName = file.path;
		delete this.state[fileName];
	};

	setCursorState(st: SelectionRange, view?: EditorView) {
		const fileName = view
			? this.getFilePathForEditorView(view)
			: this.tm.plugin.app.workspace.getActiveFile()?.path;
		if (!fileName) {
			return;
		}
		this.state[fileName] = st;
	}

	createClampedSelection(savedState: SelectionRange, docLength: number) {
		return EditorSelection.create([
			EditorSelection.range(
				clampCursorPosition(savedState.anchor, docLength),
				clampCursorPosition(savedState.head, docLength),
			),
		]);
	}

	private readonly onFileOpen = (file: TFile | null): void => {
		if (!file) {
			return;
		}

		// Check if we have a saved cursor position for this file
		const savedPosition = this.state[file.path];
		if (!savedPosition) {
			return;
		}

		// Trigger restoration - use requestAnimationFrame to ensure DOM is ready
		const win = this.tm.plugin.app.workspace.containerEl.ownerDocument.defaultView;
		if (!(win && this.enabled)) {
			return;
		}
		const frame = win.requestAnimationFrame(() => {
			this.frames.delete(frame);
			if (this.enabled) {
				this.restoreSavedPosition(file.path);
			}
		});
		this.frames.set(frame, win);
	};

	private restoreSavedPosition(filePath: string): void {
		// Get all active markdown views
		const leaves = this.tm.plugin.app.workspace.getLeavesOfType("markdown");

		for (const leaf of leaves) {
			const view = leaf.view;
			if (view.getViewType() === "markdown") {
				// Access the editor (CM6 EditorView)
				const editor = (view as unknown as { editor?: { cm?: EditorView } }).editor;
				if (!editor?.cm) {
					continue;
				}

				const cm = editor.cm;
				const currentFile = this.getFilePathForEditorView(cm);

				// Only restore if this view is showing the file we just opened
				if (currentFile === filePath) {
					const savedState = this.state[filePath];

					// Check for flashing span (link anchor highlighting)
					const containsFlashingSpan =
						this.tm.plugin.app.workspace.containerEl.querySelector("span.is-flashing");

					if (!containsFlashingSpan && savedState) {
						const docLength = cm.state.doc.length;
						const clampedSelection = this.createClampedSelection(savedState, docLength);
						cm.dispatch({ selection: clampedSelection });
					}
				}
			}
		}
	}
}
