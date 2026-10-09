// SPDX-License-Identifier: GPL-3.0-only AND MIT
// Derived from Typewriter Mode (https://github.com/davisriedel/obsidian-typewriter-mode)
// Copyright (c) 2023-2026 Davis Riedel
// Modifications Copyright (C) 2025-2026 Parkis Utama

import type UnisastraCore from "@/lib";
import RestoreCursorPosition from "./restore-cursor-position";

export default function getRestoreCursorPositionFeatures(tm: UnisastraCore) {
	return Object.fromEntries(
		[new RestoreCursorPosition(tm)].map((feature) => [feature.getSettingKey(), feature]),
	);
}
