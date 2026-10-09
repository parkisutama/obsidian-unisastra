// SPDX-License-Identifier: GPL-3.0-only
// Copyright (C) 2025-2026 Parkis Utama

import { FeatureToggle } from "@/capabilities/base/feature-toggle";

export default class AllowArrowRightInHemingwayMode extends FeatureToggle {
	readonly settingKey = "hemingwayMode.isAllowArrowRightInHemingwayModeEnabled" as const;
	protected override toggleClass = null;
	protected settingTitle = "Allow using Right Arrow key in Hemingway mode";
	protected settingDesc =
		"Allows moving the cursor right with the Right Arrow key when Hemingway mode is active. Enabled by default so the cursor can move past an auto-inserted closing character (e.g. a matched backtick or bracket) without disabling Hemingway mode.";
}
