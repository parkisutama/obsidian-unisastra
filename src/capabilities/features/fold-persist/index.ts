// SPDX-License-Identifier: GPL-3.0-only
// Copyright (C) 2025-2026 Parkis Utama

import type UnisastraCore from "@/lib";
import FoldPersistEnabled from "./fold-persist-enabled";

export default function getFoldPersistFeatures(tm: UnisastraCore) {
	return Object.fromEntries(
		[new FoldPersistEnabled(tm)].map((feature) => [feature.getSettingKey(), feature]),
	);
}
