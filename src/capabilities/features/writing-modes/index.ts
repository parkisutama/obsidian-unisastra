// SPDX-License-Identifier: GPL-3.0-only
// Copyright (C) 2025-2026 Parkis Utama

import type UnisastraCore from "@/lib";
import WritingModeActive from "./active-mode";
import WritingModePresetConfig from "./preset-config";

export default function getWritingModeFeatures(tm: UnisastraCore) {
	return Object.fromEntries(
		[new WritingModeActive(tm), new WritingModePresetConfig(tm)].map((feature) => [
			feature.getSettingKey(),
			feature,
		]),
	);
}
