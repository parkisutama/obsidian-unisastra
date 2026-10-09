// SPDX-License-Identifier: GPL-3.0-only
// Copyright (C) 2025-2026 Parkis Utama

import { describe, expect, it } from "vitest";
import {
	calculateKeepLinesScrollOffset,
	calculateTypewriterScrollOffset,
} from "@/cm6/typewriter-offset-calculator";

describe("typewriter offset calculations", () => {
	it("pins to the configured typewriter offset by default", () => {
		expect(
			calculateTypewriterScrollOffset({
				activeLineOffset: 10,
				isOnlyMaintainTypewriterOffsetWhenReachedEnabled: false,
				scrollTop: 0,
				typewriterOffset: 240,
			}),
		).toBe(240);
	});

	it("maintains the typewriter offset only after the cursor reaches it", () => {
		expect(
			calculateTypewriterScrollOffset({
				activeLineOffset: 80,
				isOnlyMaintainTypewriterOffsetWhenReachedEnabled: true,
				scrollTop: 0,
				typewriterOffset: 240,
			}),
		).toBe(80);

		expect(
			calculateTypewriterScrollOffset({
				activeLineOffset: 120,
				isOnlyMaintainTypewriterOffsetWhenReachedEnabled: true,
				scrollTop: 200,
				typewriterOffset: 240,
			}),
		).toBe(240);
	});

	it("keeps the cursor inside the configured line buffer", () => {
		expect(
			calculateKeepLinesScrollOffset({
				activeLineOffset: 20,
				editorHeight: 500,
				lineHeight: 20,
				linesAboveAndBelow: 3,
				scrollTop: 100,
			}),
		).toBe(60);

		expect(
			calculateKeepLinesScrollOffset({
				activeLineOffset: 460,
				editorHeight: 500,
				lineHeight: 20,
				linesAboveAndBelow: 3,
				scrollTop: 100,
			}),
		).toBe(420);
	});
});
