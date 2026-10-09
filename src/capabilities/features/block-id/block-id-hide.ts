// SPDX-License-Identifier: GPL-3.0-only
// Copyright (C) 2025-2026 Parkis Utama

import { FeatureToggle } from "@/capabilities/base/feature-toggle";

export default class BlockIdHide extends FeatureToggle {
	readonly settingKey = "blockId.isHideIdsInLivePreviewEnabled" as const;
	protected settingTitle = "Hide block IDs in Live Preview";
	protected settingDesc =
		"Visually hide ^block-id suffixes in Live Preview mode. IDs remain visible in Source mode.";
}
