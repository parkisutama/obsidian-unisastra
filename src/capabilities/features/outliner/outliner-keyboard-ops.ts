// SPDX-License-Identifier: GPL-3.0-only
// Copyright (C) 2025-2026 Parkis Utama

import { FeatureToggle } from "@/capabilities/base/feature-toggle";

export default class OutlinerKeyboardOps extends FeatureToggle {
	readonly settingKey = "outliner.isKeyboardOpsEnabled" as const;
	protected settingTitle = "List keyboard operations";
	protected settingDesc =
		"Move list items up/down with Ctrl/Cmd+Shift+Arrow keys. Preserves children and indentation.";

	override enable() {
		super.enable();
		this.tm.reconfigureOutliner();
	}

	override disable() {
		super.disable();
		this.tm.reconfigureOutliner();
	}
}
