// SPDX-License-Identifier: GPL-3.0-only
// Copyright (C) 2025-2026 Parkis Utama

import { FeatureToggle } from "@/capabilities/base/feature-toggle";

export default class FoldPersistEnabled extends FeatureToggle {
	readonly settingKey = "foldPersist.isFoldPersistEnabled" as const;
	protected settingTitle = "Persist fold state";
	protected settingDesc =
		"Remember folds for list items with unique block IDs when reopening a file. This does not generate IDs or synchronize open panes.";
}
