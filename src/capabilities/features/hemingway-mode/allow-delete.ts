// SPDX-License-Identifier: GPL-3.0-only
// Copyright (C) 2025-2026 Parkis Utama

import { FeatureToggle } from "@/capabilities/base/feature-toggle";

export default class AllowDeleteInHemingwayMode extends FeatureToggle {
	readonly settingKey = "hemingwayMode.isAllowDeleteInHemingwayModeEnabled" as const;
	protected override toggleClass = null;
	protected settingTitle = "Allow using Delete key in Hemingway mode";
	protected settingDesc = "Allows deleting text with the Delete key when Hemingway mode is active.";
}
