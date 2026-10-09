// SPDX-License-Identifier: GPL-3.0-only
// Copyright (C) 2025-2026 Parkis Utama

import { FeatureToggle } from "@/capabilities/base/feature-toggle";

export default class AllowPageUpInHemingwayMode extends FeatureToggle {
	readonly settingKey = "hemingwayMode.isAllowPageUpInHemingwayModeEnabled" as const;
	protected override toggleClass = null;
	protected settingTitle = "Allow using Page Up key in Hemingway mode";
	protected settingDesc =
		"Allows scrolling up a page with the Page Up key when Hemingway mode is active.";
}
