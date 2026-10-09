// SPDX-License-Identifier: GPL-3.0-only AND MIT
// Derived from Typewriter Mode (https://github.com/davisriedel/obsidian-typewriter-mode)
// Copyright (c) 2023-2026 Davis Riedel
// Modifications Copyright (C) 2025-2026 Parkis Utama

import { FeatureToggle } from "@/capabilities/base/feature-toggle";

export default class OnlyMaintainTypewriterOffsetWhenReached extends FeatureToggle {
	readonly settingKey = "typewriter.isOnlyMaintainTypewriterOffsetWhenReachedEnabled" as const;
	protected hasCommand = false;
	protected settingTitle = "Only maintain typewriter offset when reached";
	protected settingDesc =
		"The line that the cursor is on will not be scrolled to the center of the editor until it the specified typewriter offset is reached. This removes the additional space at the top of the editor.";
}
