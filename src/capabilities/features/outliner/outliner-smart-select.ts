// SPDX-License-Identifier: GPL-3.0-only
// Copyright (C) 2025-2026 Parkis Utama

import { FeatureToggle } from "@/capabilities/base/feature-toggle";

export default class OutlinerSmartSelect extends FeatureToggle {
	readonly settingKey = "outliner.isSmartSelectEnabled" as const;
	protected settingTitle = "Smart Select";
	protected settingDesc =
		"Cmd/Ctrl+A first selects current item text, then the full list, then the entire document.";

	override enable() {
		super.enable();
		this.tm.reconfigureOutliner();
	}

	override disable() {
		super.disable();
		this.tm.reconfigureOutliner();
	}
}
