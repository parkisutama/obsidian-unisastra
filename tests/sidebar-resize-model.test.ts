// SPDX-License-Identifier: GPL-3.0-only
// Copyright (C) 2025-2026 Parkis Utama

import { describe, expect, it } from "vitest";
import {
	chooseSidebarTarget,
	constrainSidebarTarget,
	type SidebarPair,
	sidebarPairMaximum,
	sidebarWidthMatches,
} from "@/capabilities/features/general/sidebar-resize/model";

const pair = (left = 320, right = 380): SidebarPair => ({
	left: { open: true, width: left },
	right: { open: true, width: right },
});

describe("sidebar resize decisions", () => {
	it("bounds the pair by the viewport even when its workspace has overflowed", () => {
		expect(sidebarPairMaximum(1000, 1200)).toBe(400);
		expect(sidebarPairMaximum(26_843_546, 962)).toBeCloseTo(384.8);
		expect(sidebarPairMaximum(1536, 1536)).toBeCloseTo(614.4);
		expect(sidebarPairMaximum(400, 1200)).toBe(160);
		expect(sidebarPairMaximum(0, 1200)).toBeNull();
		expect(sidebarPairMaximum(Number.NaN, 1200)).toBeNull();
	});
	it("averages activation and an unordered simultaneous open", () => {
		expect(chooseSidebarTarget(pair(), null, null, null)).toBe(350);
		const closed = pair();
		closed.left.open = false;
		closed.right.open = false;
		expect(chooseSidebarTarget(pair(), closed, null, 250)).toBe(350);
	});

	it.each(["left", "right"] as const)(
		"uses the newly opened %s sidebar rather than the previous shared target",
		(side) => {
			const before = pair();
			before[side].open = false;
			expect(chooseSidebarTarget(pair(), before, null, 300)).toBe(pair()[side].width);
		},
	);

	it("follows the drag source and otherwise preserves the shared target", () => {
		expect(chooseSidebarTarget(pair(340), pair(), "left", 380)).toBe(340);
		expect(chooseSidebarTarget(pair(340), pair(), "right", 340)).toBe(380);
		expect(chooseSidebarTarget(pair(), pair(), null, 340)).toBe(340);
	});

	it.each(["left", "right"] as const)(
		"never writes when %s is closed, including during drag",
		(side) => {
			const current = pair();
			current[side].open = false;
			expect(chooseSidebarTarget(current, pair(), "left", 350)).toBeNull();
		},
	);

	it("clamps to the intersection, refusing impossible or invalid bounds", () => {
		const left = { min: 200, max: 500 };
		const right = { min: 250, max: 400 };
		expect(constrainSidebarTarget(220, left, right)).toBe(250);
		expect(constrainSidebarTarget(450, left, right)).toBe(400);
		expect(constrainSidebarTarget(350, left, right)).toBe(350);
		expect(constrainSidebarTarget(350, left, { min: 600, max: 700 })).toBeNull();
		expect(constrainSidebarTarget(Number.NaN, left, right)).toBeNull();
		expect(constrainSidebarTarget(350, { min: 500, max: 200 }, right)).toBeNull();
		expect(constrainSidebarTarget(350, left, { min: 0, max: Number.NaN })).toBeNull();
	});

	it("compares rendered CSS pixels within half a pixel without rounding", () => {
		expect(sidebarWidthMatches(320, 320.5)).toBe(true);
		expect(sidebarWidthMatches(320, 320.51)).toBe(false);
		expect(sidebarWidthMatches(Number.NaN, 320)).toBe(false);
	});
});
