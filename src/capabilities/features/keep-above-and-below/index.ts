// SPDX-License-Identifier: GPL-3.0-only AND MIT
// Derived from Typewriter Mode (https://github.com/davisriedel/obsidian-typewriter-mode)
// Copyright (c) 2023-2026 Davis Riedel
// Modifications Copyright (C) 2025-2026 Parkis Utama

import type UnisastraCore from "@/lib";
import KeepLinesAboveAndBelow from "./keep-lines-above-and-below";
import LinesAboveAndBelow from "./lines-above-and-below";

export default function getKeepAboveAndBelowFeatures(tm: UnisastraCore) {
	return Object.fromEntries(
		[new KeepLinesAboveAndBelow(tm), new LinesAboveAndBelow(tm)].map((feature) => [
			feature.getSettingKey(),
			feature,
		]),
	);
}
