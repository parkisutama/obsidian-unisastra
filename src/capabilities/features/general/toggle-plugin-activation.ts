// SPDX-License-Identifier: GPL-3.0-only AND MIT
// Derived from Typewriter Mode (https://github.com/davisriedel/obsidian-typewriter-mode)
// Copyright (c) 2023-2026 Davis Riedel
// Modifications Copyright (C) 2025-2026 Parkis Utama

import { FeatureToggle } from "@/capabilities/base/feature-toggle";

export default class TogglePluginActivation extends FeatureToggle {
	readonly settingKey = "general.isPluginActivated" as const;
	protected override toggleClass = "unisastra-plugin-activated";
	protected settingTitle = "Activate Unisastra";
	protected settingDesc = "This enables or disables all the features below.";
}
