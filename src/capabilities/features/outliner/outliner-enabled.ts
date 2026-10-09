// SPDX-License-Identifier: GPL-3.0-only
// Copyright (C) 2025-2026 Parkis Utama

import { FeatureToggle } from "@/capabilities/base/feature-toggle";

export default class OutlinerEnabled extends FeatureToggle {
	readonly settingKey = "outliner.isOutlinerEnabled" as const;
	protected settingTitle = "Enable outliner focus";
	protected settingDesc =
		"Focus on a single heading or list item, hiding the rest of the document. Use Cmd/Ctrl+. to focus in and Cmd/Ctrl+Shift+. to unfocus.";

	override enable() {
		super.enable();
		this.tm.reconfigureOutliner();
	}

	override disable() {
		super.disable();
		this.tm.reconfigureOutliner();
	}
}
