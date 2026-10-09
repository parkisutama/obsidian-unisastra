// SPDX-License-Identifier: GPL-3.0-only AND MIT
// Derived from Typewriter Mode (https://github.com/davisriedel/obsidian-typewriter-mode)
// Copyright (c) 2023-2026 Davis Riedel
// Modifications Copyright (C) 2025-2026 Parkis Utama

import { FeatureToggle } from "@/capabilities/base/feature-toggle";

export default class WritingFocusShowsHeader extends FeatureToggle {
	readonly settingKey = "writingFocus.doesWritingFocusShowHeader" as const;
	protected override toggleClass = "unisastra-writing-focus-shows-header";
	protected settingTitle = "Show header in writing focus";
	protected settingDesc = "If enabled, the header will be shown in writing focus";
}
