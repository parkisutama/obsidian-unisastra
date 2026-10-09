// SPDX-License-Identifier: GPL-3.0-only AND MIT
// Derived from Typewriter Mode (https://github.com/davisriedel/obsidian-typewriter-mode)
// Copyright (c) 2023-2026 Davis Riedel
// Modifications Copyright (C) 2025-2026 Parkis Utama

import type UnisastraCore from "@/lib";
import DimHighlightListParent from "./dim-highlight-list-parent";
import DimTableAsOne from "./dim-table-as-one";
import DimUnfocused from "./dim-unfocused";
import DimUnfocusedEditorsBehavior from "./dim-unfocused-editors-behavior";
import DimUnfocusedMode from "./dim-unfocused-mode";
import DimmedOpacity from "./dimmed-opacity";
import PauseDimUnfocusedWhileScrolling from "./pause-dim-unfocused-while-scrolling";
import PauseDimUnfocusedWhileSelecting from "./pause-dim-unfocused-while-selecting";

export default function getDimmingFeatures(tm: UnisastraCore) {
	return Object.fromEntries(
		[
			new DimUnfocused(tm),
			new DimUnfocusedMode(tm),
			new DimHighlightListParent(tm),
			new DimTableAsOne(tm),
			new DimmedOpacity(tm),
			new PauseDimUnfocusedWhileScrolling(tm),
			new PauseDimUnfocusedWhileSelecting(tm),
			new DimUnfocusedEditorsBehavior(tm),
		].map((feature) => [feature.getSettingKey(), feature]),
	);
}
