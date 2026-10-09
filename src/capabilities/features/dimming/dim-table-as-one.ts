// SPDX-License-Identifier: GPL-3.0-only AND MIT
// Derived from Typewriter Mode (https://github.com/davisriedel/obsidian-typewriter-mode)
// Copyright (c) 2023-2026 Davis Riedel
// Modifications Copyright (C) 2025-2026 Parkis Utama

import { FeatureToggle } from "@/capabilities/base/feature-toggle";

export default class DimTableAsOne extends FeatureToggle {
	readonly settingKey = "dimming.isDimTableAsOneEnabled" as const;
	protected override toggleClass = "unisastra-dim-table-as-one";
	protected settingTitle = "Undim all table cells when editing";
	protected settingDesc =
		"If this is enabled, all table cells are shown/not dimmed when you edit a table. If this is disabled, only the current table cell that you are editing is shown, while the other cells remain dimmed.";
}
