// SPDX-License-Identifier: GPL-3.0-only AND MIT
// Derived from Typewriter Mode (https://github.com/davisriedel/obsidian-typewriter-mode)
// Copyright (c) 2023-2026 Davis Riedel
// Modifications Copyright (C) 2025-2026 Parkis Utama

import { FeatureToggle } from "@/capabilities/base/feature-toggle";

export default class FadeLines extends FeatureToggle {
	readonly settingKey = "currentLine.isFadeLinesEnabled" as const;
	protected override toggleClass = "unisastra-fade-lines";
	protected settingTitle = "Fade lines";
	protected settingDesc =
		"This places a gradient on the lines above and below the current line, making the text fade out more and more towards the top and bottom of the editor.";
}
