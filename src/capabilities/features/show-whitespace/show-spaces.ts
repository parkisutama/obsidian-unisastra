// SPDX-License-Identifier: GPL-3.0-only AND MIT
// Derived from Typewriter Mode (https://github.com/davisriedel/obsidian-typewriter-mode)
// Copyright (c) 2023-2026 Davis Riedel
// Modifications Copyright (C) 2025-2026 Parkis Utama

import { FeatureToggle } from "@/capabilities/base/feature-toggle";

export default class ShowSpaces extends FeatureToggle {
	readonly settingKey = "showWhitespace.isShowSpacesEnabled" as const;
	protected override toggleClass = "unisastra-show-spaces";
	protected settingTitle = "Show spaces";
	protected settingDesc =
		"Displays mid-line space characters. Obsidian requires exactly 4 spaces for nested list indentation — visual verification prevents silent indentation bugs.";
}
