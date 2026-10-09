// SPDX-License-Identifier: GPL-3.0-only AND MIT
// Derived from Typewriter Mode (https://github.com/davisriedel/obsidian-typewriter-mode)
// Copyright (c) 2023-2026 Davis Riedel
// Modifications Copyright (C) 2025-2026 Parkis Utama

import type UnisastraCore from "@/lib";
import WritingFocusFontSize from "./writing-focus-font-size";
import WritingFocusIsFullScreen from "./writing-focus-is-fullscreen";
import WritingFocusShowsHeader from "./writing-focus-shows-header";
import WritingFocusShowsStatusBar from "./writing-focus-shows-status-bar";

export default function getWritingFocusFeatures(tm: UnisastraCore) {
	return Object.fromEntries(
		[
			new WritingFocusShowsHeader(tm),
			new WritingFocusShowsStatusBar(tm),
			new WritingFocusIsFullScreen(tm),
			new WritingFocusFontSize(tm),
		].map((feature) => [feature.getSettingKey(), feature]),
	);
}
