// SPDX-License-Identifier: GPL-3.0-only
// Copyright (C) 2025-2026 Parkis Utama

import { StateField } from "@codemirror/state";
export class MarkdownView {
	file = { path: "fixture.md" };
	editor: { cm?: unknown } = {};
	getMode() {
		return "source";
	}
}
export const Platform = { isMobile: false };
export const editorInfoField = StateField.define<MarkdownView>({
	create: () => new MarkdownView(),
	update: (value) => value,
});
export const editorLivePreviewField = StateField.define<boolean>({
	create: () => true,
	update: (value) => value,
});
