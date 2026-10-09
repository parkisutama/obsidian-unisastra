// SPDX-License-Identifier: GPL-3.0-only AND MIT
// Derived from Typewriter Mode (https://github.com/davisriedel/obsidian-typewriter-mode)
// Copyright (c) 2023-2026 Davis Riedel
// Modifications Copyright (C) 2025-2026 Parkis Utama

import { FeatureToggle } from "@/capabilities/base/feature-toggle";

export default class OnlyActivateAfterFirstInteraction extends FeatureToggle {
	readonly settingKey = "general.isOnlyActivateAfterFirstInteractionEnabled" as const;
	protected settingTitle = "Only activate after first interaction";
	protected settingDesc =
		"Activate the focused line highlight and paragraph dimming only after the first interaction with the editor";
}
