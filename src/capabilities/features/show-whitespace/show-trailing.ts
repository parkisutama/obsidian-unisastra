// SPDX-License-Identifier: GPL-3.0-only AND MIT
// Derived from Typewriter Mode (https://github.com/davisriedel/obsidian-typewriter-mode)
// Copyright (c) 2023-2026 Davis Riedel
// Modifications Copyright (C) 2025-2026 Parkis Utama

import { FeatureToggle } from "@/capabilities/base/feature-toggle";

export default class ShowTrailing extends FeatureToggle {
	readonly settingKey = "showWhitespace.isShowTrailingEnabled" as const;
	protected override toggleClass = "unisastra-show-trailing";
	protected settingTitle = "Show trailing spaces";
	protected settingDesc =
		"Highlights trailing spaces at end of lines. Trailing spaces generate hard line breaks (<br>) in MkDocs, Quartz, and Hugo.";
}
