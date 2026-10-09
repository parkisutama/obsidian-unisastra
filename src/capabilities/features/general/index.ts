// SPDX-License-Identifier: GPL-3.0-only AND MIT
// Derived from Typewriter Mode (https://github.com/davisriedel/obsidian-typewriter-mode)
// Copyright (c) 2023-2026 Davis Riedel
// Modifications Copyright (C) 2025-2026 Parkis Utama

import type UnisastraCore from "@/lib";
import RestoreCursorPosition from "../restore-cursor-position/restore-cursor-position";
import EnabledPlatforms from "./enabled-platforms";
import Mononote from "./mononote";
import OnlyActivateAfterFirstInteraction from "./only-activate-after-first-interaction";
import SidebarEqualResize from "./sidebar-equal-resize";
import TogglePluginActivation from "./toggle-plugin-activation";

export default function getGeneralFeatures(tm: UnisastraCore) {
	return Object.fromEntries(
		[
			new TogglePluginActivation(tm),
			new EnabledPlatforms(tm),
			new OnlyActivateAfterFirstInteraction(tm),
			new RestoreCursorPosition(tm),
			new Mononote(tm),
			new SidebarEqualResize(tm),
		].map((feature) => [feature.getSettingKey(), feature]),
	);
}
