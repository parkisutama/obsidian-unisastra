// SPDX-License-Identifier: GPL-3.0-only
// Copyright (C) 2025-2026 Parkis Utama

import { FeatureToggle } from "@/capabilities/base/feature-toggle";

export default class OutlinerSmartTab extends FeatureToggle {
	readonly settingKey = "outliner.isSmartTabEnabled" as const;
	protected settingTitle = "Smart Tab";
	protected settingDesc =
		"Tab indents current list item. Shift+Tab outdents. Only active inside list context.";

	override enable() {
		super.enable();
		this.tm.reconfigureOutliner();
	}

	override disable() {
		super.disable();
		this.tm.reconfigureOutliner();
	}
}
