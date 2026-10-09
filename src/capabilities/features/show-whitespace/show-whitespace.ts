// SPDX-License-Identifier: GPL-3.0-only AND MIT
// Derived from Typewriter Mode (https://github.com/davisriedel/obsidian-typewriter-mode)
// Copyright (c) 2023-2026 Davis Riedel
// Modifications Copyright (C) 2025-2026 Parkis Utama

import { FeatureToggle } from "@/capabilities/base/feature-toggle";

export default class ShowWhitespace extends FeatureToggle {
	readonly settingKey = "showWhitespace.isShowWhitespaceEnabled" as const;
	protected override toggleClass = "unisastra-show-whitespace";
	protected settingTitle = "Show whitespace characters";
	protected settingDesc =
		"Reveals invisible characters (spaces, tabs, trailing spaces, strict line breaks) in the editor. Essential for SSG authoring where whitespace affects rendering.";
}
