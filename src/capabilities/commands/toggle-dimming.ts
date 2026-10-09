// SPDX-License-Identifier: GPL-3.0-only AND MIT
// Derived from Typewriter Mode (https://github.com/davisriedel/obsidian-typewriter-mode)
// Copyright (c) 2023-2026 Davis Riedel
// Modifications Copyright (C) 2025-2026 Parkis Utama

import type { FeatureToggle } from "../base/feature-toggle";
import { ToggleCommand } from "../base/toggle-command";

export class ToggleDimming extends ToggleCommand {
	readonly commandKey = "dimming";
	readonly commandTitle = "dimming";
	protected featureToggle = this.tm.features.dimming[
		"dimming.isDimUnfocusedEnabled"
	] as FeatureToggle;
}
