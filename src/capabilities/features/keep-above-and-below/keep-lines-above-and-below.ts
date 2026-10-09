// SPDX-License-Identifier: GPL-3.0-only AND MIT
// Derived from Typewriter Mode (https://github.com/davisriedel/obsidian-typewriter-mode)
// Copyright (c) 2023-2026 Davis Riedel
// Modifications Copyright (C) 2025-2026 Parkis Utama

import { FeatureToggle } from "@/capabilities/base/feature-toggle";

export default class KeepLinesAboveAndBelow extends FeatureToggle {
	readonly settingKey = "keepLinesAboveAndBelow.isKeepLinesAboveAndBelowEnabled" as const;
	protected settingTitle = "Keep lines above and below";
	protected settingDesc =
		"When enabled, always keeps the specified amount of lines above and below the current line in view";

	protected override isSettingEnabled(): boolean {
		return !this.tm.settings.typewriter.isTypewriterScrollEnabled;
	}
}
