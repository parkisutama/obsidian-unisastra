// SPDX-License-Identifier: GPL-3.0-only AND MIT
// Derived from Typewriter Mode (https://github.com/davisriedel/obsidian-typewriter-mode)
// Copyright (c) 2023-2026 Davis Riedel
// Modifications Copyright (C) 2025-2026 Parkis Utama

import { FeatureToggle } from "@/capabilities/base/feature-toggle";

export default class HighlightCurrentLineOnlyInFocusedEditor extends FeatureToggle {
	readonly settingKey = "currentLine.isHighlightCurrentLineOnlyInFocusedEditorEnabled" as const;
	protected override toggleClass = "unisastra-highlight-current-line-only-in-active-editor";
	protected hasCommand = false;
	protected settingTitle = "Highlight current line only in focused note";
	protected settingDesc =
		"Only show highlighted line in the note your cursor is on (e.g. if you have multiple notes open in split panes)";
}
