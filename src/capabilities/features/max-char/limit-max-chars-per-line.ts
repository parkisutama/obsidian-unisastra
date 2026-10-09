// SPDX-License-Identifier: GPL-3.0-only AND MIT
// Derived from Typewriter Mode (https://github.com/davisriedel/obsidian-typewriter-mode)
// Copyright (c) 2023-2026 Davis Riedel
// Modifications Copyright (C) 2025-2026 Parkis Utama

import { FeatureToggle } from "@/capabilities/base/feature-toggle";

export default class LimitMaxCharsPerLine extends FeatureToggle {
	readonly settingKey = "maxChars.isMaxCharsPerLineEnabled" as const;
	protected override toggleClass = "unisastra-max-chars-per-line";
	override isToggleClassPersistent = true;
	protected settingTitle = "Limit maximum number of characters per line";
	protected settingDesc = "Limits the maximum number of characters per line";
}
