// SPDX-License-Identifier: GPL-3.0-only AND MIT
// Derived from Typewriter Mode (https://github.com/davisriedel/obsidian-typewriter-mode)
// Copyright (c) 2023-2026 Davis Riedel
// Modifications Copyright (C) 2025-2026 Parkis Utama

import type { FeatureToggle } from "../base/feature-toggle";
import { ToggleCommand } from "../base/toggle-command";

export class ToggleShowWhitespace extends ToggleCommand {
	readonly commandKey = "show-whitespace";
	readonly commandTitle = "whitespace visibility";
	protected featureToggle = this.tm.features.showWhitespace[
		"showWhitespace.isShowWhitespaceEnabled"
	] as FeatureToggle;
}
