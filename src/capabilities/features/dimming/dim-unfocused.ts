// SPDX-License-Identifier: GPL-3.0-only AND MIT
// Derived from Typewriter Mode (https://github.com/davisriedel/obsidian-typewriter-mode)
// Copyright (c) 2023-2026 Davis Riedel
// Modifications Copyright (C) 2025-2026 Parkis Utama

import { FeatureToggle } from "@/capabilities/base/feature-toggle";

export default class DimUnfocused extends FeatureToggle {
	readonly settingKey = "dimming.isDimUnfocusedEnabled" as const;
	protected override toggleClass = "unisastra-dim-unfocused";
	protected settingTitle = "Dim unfocused";
	protected settingDesc = "Dim unfocused paragraphs / sentences";
}
