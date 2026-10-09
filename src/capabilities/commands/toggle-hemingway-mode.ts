// SPDX-License-Identifier: GPL-3.0-only AND MIT
// Derived from Typewriter Mode (https://github.com/davisriedel/obsidian-typewriter-mode)
// Copyright (c) 2023-2026 Davis Riedel
// Modifications Copyright (C) 2025-2026 Parkis Utama

import type { FeatureToggle } from "../base/feature-toggle";
import { ToggleCommand } from "../base/toggle-command";

export class ToggleHemingwayMode extends ToggleCommand {
	readonly commandKey = "hemingway-mode";
	readonly commandTitle = "Hemingway mode";
	protected featureToggle = this.tm.features.hemingwayMode[
		"hemingwayMode.isHemingwayModeEnabled"
	] as FeatureToggle;
}
