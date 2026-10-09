// SPDX-License-Identifier: GPL-3.0-only AND MIT
// Derived from Typewriter Mode (https://github.com/davisriedel/obsidian-typewriter-mode)
// Copyright (c) 2023-2026 Davis Riedel
// Modifications Copyright (C) 2025-2026 Parkis Utama

import { FeatureToggle } from "@/capabilities/base/feature-toggle";

export default class ShowStrictLineBreak extends FeatureToggle {
	readonly settingKey = "showWhitespace.isShowStrictLineBreakEnabled" as const;
	protected override toggleClass = "unisastra-show-strict-line-break";
	protected settingTitle = "Highlight strict line breaks";
	protected settingDesc =
		"Highlights two-space sequences before newlines — these are intentional Markdown hard breaks, visually distinct from accidental trailing spaces.";
}
