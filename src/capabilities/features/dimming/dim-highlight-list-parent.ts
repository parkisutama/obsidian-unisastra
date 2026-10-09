// SPDX-License-Identifier: GPL-3.0-only AND MIT
// Derived from Typewriter Mode (https://github.com/davisriedel/obsidian-typewriter-mode)
// Copyright (c) 2023-2026 Davis Riedel
// Modifications Copyright (C) 2025-2026 Parkis Utama

import { FeatureToggle } from "@/capabilities/base/feature-toggle";

export default class DimHighlightListParent extends FeatureToggle {
	readonly settingKey = "dimming.isDimHighlightListParentEnabled" as const;
	protected override toggleClass = "unisastra-dim-highlight-list-parent";
	protected settingTitle = "Highlight list parents";
	protected settingDesc =
		"If this is enabled, the parent items of the active list item are not dimmed";
}
