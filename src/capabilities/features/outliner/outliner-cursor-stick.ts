// SPDX-License-Identifier: GPL-3.0-only
// Copyright (C) 2025-2026 Parkis Utama

import { FeatureToggle } from "@/capabilities/base/feature-toggle";

export default class OutlinerCursorStick extends FeatureToggle {
	readonly settingKey = "outliner.isCursorStickEnabled" as const;
	protected settingTitle = "Cursor discipline";
	protected settingDesc =
		"Prevent cursor from entering the bullet marker area. Home key moves to start of text content.";

	override enable() {
		super.enable();
		this.tm.reconfigureOutliner();
	}

	override disable() {
		super.disable();
		this.tm.reconfigureOutliner();
	}
}
