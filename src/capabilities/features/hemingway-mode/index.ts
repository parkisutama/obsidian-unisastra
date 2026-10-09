// SPDX-License-Identifier: GPL-3.0-only AND MIT
// Derived from Typewriter Mode (https://github.com/davisriedel/obsidian-typewriter-mode)
// Copyright (c) 2023-2026 Davis Riedel
// Modifications Copyright (C) 2025-2026 Parkis Utama

import type UnisastraCore from "@/lib";
import AllowArrowDownInHemingwayMode from "./allow-arrow-down";
import AllowArrowLeftInHemingwayMode from "./allow-arrow-left";
import AllowArrowRightInHemingwayMode from "./allow-arrow-right";
import AllowArrowUpInHemingwayMode from "./allow-arrow-up";
import AllowBackspaceInHemingwayMode from "./allow-backspace";
import AllowDeleteInHemingwayMode from "./allow-delete";
import AllowEndInHemingwayMode from "./allow-end";
import AllowHomeInHemingwayMode from "./allow-home";
import AllowPageDownInHemingwayMode from "./allow-page-down";
import AllowPageUpInHemingwayMode from "./allow-page-up";
import AllowUndoInHemingwayMode from "./allow-undo";
import HemingwayMode from "./hemingway-mode";
import ShowHemingwayModeStatusBar from "./show-status-bar";
import HemingwayModeStatusBarText from "./status-bar-text";

export default function getHemingwayModeFeatures(tm: UnisastraCore) {
	return Object.fromEntries(
		[
			new HemingwayMode(tm),
			new AllowArrowLeftInHemingwayMode(tm),
			new AllowArrowRightInHemingwayMode(tm),
			new AllowArrowUpInHemingwayMode(tm),
			new AllowArrowDownInHemingwayMode(tm),
			new AllowHomeInHemingwayMode(tm),
			new AllowEndInHemingwayMode(tm),
			new AllowPageUpInHemingwayMode(tm),
			new AllowPageDownInHemingwayMode(tm),
			new AllowDeleteInHemingwayMode(tm),
			new AllowBackspaceInHemingwayMode(tm),
			new AllowUndoInHemingwayMode(tm),
			new ShowHemingwayModeStatusBar(tm),
			new HemingwayModeStatusBarText(tm),
		].map((feature) => [feature.getSettingKey(), feature]),
	);
}
