// SPDX-License-Identifier: GPL-3.0-only AND MIT
// Derived from Typewriter Mode (https://github.com/davisriedel/obsidian-typewriter-mode)
// Copyright (c) 2023-2026 Davis Riedel
// Modifications Copyright (C) 2025-2026 Parkis Utama

import { FeatureToggle } from "@/capabilities/base/feature-toggle";

export default class ShowTabs extends FeatureToggle {
	readonly settingKey = "showWhitespace.isShowTabsEnabled" as const;
	protected override toggleClass = "unisastra-show-tabs";
	protected settingTitle = "Show tabs";
	protected settingDesc =
		"Displays tab characters. Tabs break code block indentation and nested list depth in Hugo and Quartz.";
}
