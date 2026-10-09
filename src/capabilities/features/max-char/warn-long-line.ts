// SPDX-License-Identifier: GPL-3.0-only
// Copyright (C) 2025-2026 Parkis Utama

import { FeatureToggle } from "@/capabilities/base/feature-toggle";

// Measures raw document lines (newline-to-newline), not sentences. Since
// Obsidian doesn't hard-wrap prose by default, one raw line is typically one
// paragraph/block. A true per-sentence warning (e.g. for "one effective
// sentence per line" style guidance) would need sentence-boundary detection
// and is a possible future direction — not implemented, pending research
// into a sensible character/word threshold per sentence.
export default class WarnLongLine extends FeatureToggle {
	readonly settingKey = "maxChars.isWarnLongLineEnabled" as const;
	protected override toggleClass = "unisastra-warn-long-line";
	override isToggleClassPersistent = true;
	protected settingTitle = "Warn when line exceeds character limit";
	protected settingDesc =
		"Highlights document lines (not sentences) that exceed the character limit below — useful for keeping paragraphs skimmable and diffs clean.";
}
