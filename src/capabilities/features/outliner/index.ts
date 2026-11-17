// SPDX-License-Identifier: GPL-3.0-only
// Copyright (C) 2025-2026 Parkis Utama

import type UnisastraCore from "@/lib";
import OutlinerEnabled from "./outliner-enabled";
import OutlinerOnClick from "./outliner-on-click";
import OutlinerSidebar from "./outliner-sidebar";

export default function getOutlinerFeatures(tm: UnisastraCore) {
	return Object.fromEntries(
		[new OutlinerEnabled(tm), new OutlinerOnClick(tm), new OutlinerSidebar(tm)].map((feature) => [
			feature.getSettingKey(),
			feature,
		]),
	);
}
