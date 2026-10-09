// SPDX-License-Identifier: GPL-3.0-only
// Copyright (C) 2025-2026 Parkis Utama

import { FeatureToggle } from "@/capabilities/base/feature-toggle";

export default class AllowArrowUpInHemingwayMode extends FeatureToggle {
	readonly settingKey = "hemingwayMode.isAllowArrowUpInHemingwayModeEnabled" as const;
	protected override toggleClass = null;
	protected settingTitle = "Allow using Up Arrow key in Hemingway mode";
	protected settingDesc =
		"Allows moving the cursor up with the Up Arrow key when Hemingway mode is active.";
}
