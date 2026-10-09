// SPDX-License-Identifier: GPL-3.0-only AND MIT
// Derived from Typewriter Mode (https://github.com/davisriedel/obsidian-typewriter-mode)
// Copyright (c) 2023-2026 Davis Riedel
// Modifications Copyright (C) 2025-2026 Parkis Utama

import type UnisastraCore from "@/lib";
import OnlyMaintainTypewriterOffsetWhenReached from "./only-maintain-typewriter-offset-when-reached";
import TypewriterOffset from "./typewriter-offset";
import TypewriterOnlyUseCommands from "./typewriter-only-use-commands";
import TypewriterScroll from "./typewriter-scroll";

export default function getTypewriterFeatures(tm: UnisastraCore) {
	return Object.fromEntries(
		[
			new TypewriterScroll(tm),
			new TypewriterOffset(tm),
			new OnlyMaintainTypewriterOffsetWhenReached(tm),
			new TypewriterOnlyUseCommands(tm),
		].map((feature) => [feature.getSettingKey(), feature]),
	);
}
