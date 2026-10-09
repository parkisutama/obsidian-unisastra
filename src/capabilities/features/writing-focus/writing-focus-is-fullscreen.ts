// SPDX-License-Identifier: GPL-3.0-only AND MIT
// Derived from Typewriter Mode (https://github.com/davisriedel/obsidian-typewriter-mode)
// Copyright (c) 2023-2026 Davis Riedel
// Modifications Copyright (C) 2025-2026 Parkis Utama

import { FeatureToggle } from "@/capabilities/base/feature-toggle";

export default class WritingFocusIsFullScreen extends FeatureToggle {
	readonly settingKey = "writingFocus.isWritingFocusFullscreen" as const;
	protected settingTitle = "Make Obsidian fullscreen in writing focus";
	protected settingDesc =
		"If enabled, the Obsidian window will toggle to fullscreen when entering writing focus";
}
