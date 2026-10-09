// SPDX-License-Identifier: GPL-3.0-only
// Copyright (C) 2025-2026 Parkis Utama

import { FeatureToggle } from "@/capabilities/base/feature-toggle";

export default class AllowArrowLeftInHemingwayMode extends FeatureToggle {
	readonly settingKey = "hemingwayMode.isAllowArrowLeftInHemingwayModeEnabled" as const;
	protected override toggleClass = null;
	protected settingTitle = "Allow using Left Arrow key in Hemingway mode";
	protected settingDesc =
		"Allows moving the cursor left with the Left Arrow key when Hemingway mode is active.";
}
