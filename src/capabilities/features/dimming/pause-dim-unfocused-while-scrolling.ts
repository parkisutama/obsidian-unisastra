// SPDX-License-Identifier: GPL-3.0-only AND MIT
// Derived from Typewriter Mode (https://github.com/davisriedel/obsidian-typewriter-mode)
// Copyright (c) 2023-2026 Davis Riedel
// Modifications Copyright (C) 2025-2026 Parkis Utama

import { FeatureToggle } from "@/capabilities/base/feature-toggle";

export default class PauseDimUnfocusedParagraphsWhileScrolling extends FeatureToggle {
	readonly settingKey = "dimming.isPauseDimUnfocusedWhileScrollingEnabled" as const;
	protected override toggleClass = "unisastra-dim-unfocused-pause-while-scrolling";
	protected settingTitle = "Pause dimming while scrolling";
	protected settingDesc =
		"If this is enabled, paragraphs / sentences are not dimmed while scrolling";
}
