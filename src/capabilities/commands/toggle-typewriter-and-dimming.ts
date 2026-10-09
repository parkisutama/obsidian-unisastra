// SPDX-License-Identifier: GPL-3.0-only AND MIT
// Derived from Typewriter Mode (https://github.com/davisriedel/obsidian-typewriter-mode)
// Copyright (c) 2023-2026 Davis Riedel
// Modifications Copyright (C) 2025-2026 Parkis Utama

import type { FeatureToggle } from "../base/feature-toggle";
import { ToggleCommand } from "../base/toggle-command";

export class ToggleTypewriterAndDimming extends ToggleCommand {
	protected override featureToggle = null;

	readonly commandKey = "typewriter-scrolling-and-paragraph-dimming";
	readonly commandTitle = "typewriter scrolling and paragraph dimming";

	protected override onCommand(): void {
		const typewriterScrollFeature = this.tm.features.typewriter[
			"typewriter.isTypewriterScrollEnabled"
		] as FeatureToggle;
		const dimUnfocusedFeature = this.tm.features.dimming[
			"dimming.isDimUnfocusedEnabled"
		] as FeatureToggle;
		const isOn = typewriterScrollFeature.getSettingValue() && dimUnfocusedFeature.getSettingValue();
		typewriterScrollFeature.toggle(!isOn);
		dimUnfocusedFeature.toggle(!isOn);
	}

	protected override onEnable(): void {
		(this.tm.features.typewriter["typewriter.isTypewriterScrollEnabled"] as FeatureToggle).toggle(
			true,
		);
		(this.tm.features.dimming["dimming.isDimUnfocusedEnabled"] as FeatureToggle).toggle(true);
	}

	protected override onDisable(): void {
		(this.tm.features.typewriter["typewriter.isTypewriterScrollEnabled"] as FeatureToggle).toggle(
			false,
		);
		(this.tm.features.dimming["dimming.isDimUnfocusedEnabled"] as FeatureToggle).toggle(false);
	}
}
