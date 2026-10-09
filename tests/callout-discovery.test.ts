// SPDX-License-Identifier: GPL-3.0-only
// Copyright (C) 2025-2026 Parkis Utama

import { describe, expect, it } from "vitest";
import { discoverCallouts } from "@/capabilities/features/callouts/discovery";

describe("callout CSS discovery", () => {
	it("finds literal IDs through nested rules and deduplicates sources without importing styles", () => {
		const result = discoverCallouts([
			{
				href: "theme.css",
				cssRules: [
					{ selectorText: '.callout[data-callout="draft"]:hover' },
					{
						cssRules: [{ selectorText: "[data-callout='DRAFT'], [data-callout=review]" }],
					},
				],
			},
			{
				href: "snippet.css",
				cssRules: [{ selectorText: '[data-callout="draft"]' }],
			},
		]);
		expect(result.candidates).toEqual([
			{ id: "draft", sources: ["theme.css", "snippet.css"] },
			{ id: "review", sources: ["theme.css"] },
		]);
		expect(result.partial).toBe(false);
	});
	it("skips inaccessible sheets and unsafe or nonliteral selectors, preserving other candidates", () => {
		const result = discoverCallouts([
			{
				get cssRules(): never {
					throw new Error("SecurityError");
				},
			},
			{
				cssRules: [
					{
						selectorText:
							'[data-callout^="prefix"], [data-callout="not valid"], [data-callout="safe"]',
					},
				],
			},
		]);
		expect(result.candidates.map((entry) => entry.id)).toEqual(["safe"]);
		expect(result.partial).toBe(true);
	});
	it("bounds rule traversal and depth and marks incomplete scans partial", () => {
		expect(
			discoverCallouts(
				[
					{
						cssRules: [
							{ selectorText: '[data-callout="one"]' },
							{ selectorText: '[data-callout="two"]' },
						],
					},
				],
				{ maxRules: 1 },
			).candidates.map((entry) => entry.id),
		).toEqual(["one"]);
		expect(discoverCallouts([{ cssRules: [{}, {}] }], { maxRules: 1 }).partial).toBe(true);
		expect(discoverCallouts([{ cssRules: [{ cssRules: [{}] }] }], { maxDepth: 0 }).partial).toBe(
			true,
		);
	});
});
