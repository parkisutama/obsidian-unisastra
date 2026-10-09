// SPDX-License-Identifier: GPL-3.0-only AND MIT
// Derived from Typewriter Mode (https://github.com/davisriedel/obsidian-typewriter-mode)
// Copyright (c) 2023-2026 Davis Riedel
// Modifications Copyright (C) 2025-2026 Parkis Utama

import { FeatureToggle } from "@/capabilities/base/feature-toggle";

export default class PauseCurrentLineHighlightWhileSelecting extends FeatureToggle {
	readonly settingKey = "currentLine.isPauseCurrentLineHighlightWhileSelectingEnabled" as const;
	protected override toggleClass = "unisastra-current-line-pause-while-selecting";
	protected settingTitle = "Pause current line highlight while selecting text";
	protected settingDesc = "If enabled, the current line highlight is hidden while selecting text";
}
