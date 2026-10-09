// SPDX-License-Identifier: GPL-3.0-only
// Copyright (C) 2025-2026 Parkis Utama

import type { EditorView } from "@codemirror/view";
import { editorInfoField, MarkdownView, Platform } from "obsidian";
import type UnisastraCore from "@/lib";

/** Reject embedded/Canvas editors and derive identity from this editor, not the active pane. */
export function foldEditorContext(tm: UnisastraCore, view: EditorView) {
	const info = view.state.field(editorInfoField, false);
	if (!(info instanceof MarkdownView && info.file) || info.getMode() !== "source") {
		return null;
	}
	const editor = info.editor as unknown as { cm?: EditorView };
	if (editor.cm !== view || !foldPlatformEnabled(tm)) {
		return null;
	}
	const frontmatter = tm.plugin.app.metadataCache.getFileCache(info.file)?.frontmatter;
	if (frontmatter?.unisastra === false) {
		return null;
	}
	return { file: info.file, path: info.file.path };
}

export function foldPlatformEnabled(tm: UnisastraCore): boolean {
	const general = tm.settings.general;
	return (
		general.isPluginActivated &&
		!(Platform.isMobile && general.enabledPlatforms === "desktop") &&
		!(!Platform.isMobile && general.enabledPlatforms === "mobile")
	);
}
