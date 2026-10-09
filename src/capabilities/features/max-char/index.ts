// SPDX-License-Identifier: GPL-3.0-only AND MIT
// Derived from Typewriter Mode (https://github.com/davisriedel/obsidian-typewriter-mode)
// Copyright (c) 2023-2026 Davis Riedel
// Modifications Copyright (C) 2025-2026 Parkis Utama

import type UnisastraCore from "@/lib";
import LimitMaxCharsPerLine from "./limit-max-chars-per-line";
import MaxCharsPerLine from "./max-chars-per-line";
import WarnLongLine from "./warn-long-line";
import WarnLongLineChars from "./warn-long-line-chars";

export default function getMaxCharFeatures(tm: UnisastraCore) {
	return Object.fromEntries(
		[
			new LimitMaxCharsPerLine(tm),
			new MaxCharsPerLine(tm),
			new WarnLongLine(tm),
			new WarnLongLineChars(tm),
		].map((feature) => [feature.getSettingKey(), feature]),
	);
}
