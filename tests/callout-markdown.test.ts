// SPDX-License-Identifier: GPL-3.0-only
// Copyright (C) 2025-2026 Parkis Utama

import { describe, expect, it } from "vitest";
import {
	calloutEdit,
	changeCalloutType,
	hasAmbiguousCalloutHeader,
	wrapAsCallout,
} from "@/capabilities/features/callouts/markdown";

describe("wrapAsCallout", () => {
	it("wraps a single-line selection under an uppercase callout header", () => {
		expect(wrapAsCallout("hello world", "note")).toBe("> [!NOTE]\n> hello world");
	});
	it("wraps a multiline selection, preserving blank lines as bare quote markers", () => {
		expect(wrapAsCallout("first\n\nsecond", "warning")).toBe("> [!WARNING]\n> first\n>\n> second");
	});
	it("uppercases a custom hyphenated ID in the emitted marker", () => {
		expect(wrapAsCallout("body", "my-custom-id")).toBe("> [!MY-CUSTOM-ID]\n> body");
	});
});

describe("changeCalloutType", () => {
	it("swaps only the type to uppercase, keeping fold marker and title intact", () => {
		expect(changeCalloutType("> [!note]- Custom title\n> body", "warning")).toBe(
			"> [!WARNING]- Custom title\n> body",
		);
	});
	it("preserves nested quote depth untouched", () => {
		expect(changeCalloutType(">> [!note]\n>> nested body", "tip")).toBe(
			">> [!TIP]\n>> nested body",
		);
	});
	it("uppercases a custom hyphenated ID when changing type", () => {
		expect(changeCalloutType("> [!note]\n> body", "my-custom-id")).toBe(
			"> [!MY-CUSTOM-ID]\n> body",
		);
	});
	it("returns null when the first line is not a callout header", () => {
		expect(changeCalloutType("plain text", "note")).toBeNull();
	});
});

describe("hasAmbiguousCalloutHeader", () => {
	it("is false for a normal callout starting at the first line", () => {
		expect(hasAmbiguousCalloutHeader("> [!note]\n> body")).toBe(false);
	});
	it("is false for plain text with no callout header at all", () => {
		expect(hasAmbiguousCalloutHeader("just some text")).toBe(false);
	});
	it("is true when a callout header appears after the first line", () => {
		expect(hasAmbiguousCalloutHeader("some text\n> [!note]\n> body")).toBe(true);
	});
});

describe("calloutEdit", () => {
	it("wraps plain text when there is no existing callout, uppercasing the marker", () => {
		expect(calloutEdit("hello", "note")).toEqual({
			insert: "> [!NOTE]\n> hello",
		});
	});
	it("changes an existing callout's type, uppercasing the new marker", () => {
		expect(calloutEdit("> [!note]\n> body", "danger")).toEqual({
			insert: "> [!DANGER]\n> body",
		});
	});
	it("refuses a selection that cuts through an existing callout header", () => {
		const result = calloutEdit("intro\n> [!note]\n> body", "danger");
		expect("refusal" in result && result.refusal).toMatch("cuts through");
	});
	it("supports folding, a title, and nesting — there is no restrictive GitHub output mode", () => {
		expect(calloutEdit("> [!note]- Title\n> body", "tip")).toEqual({
			insert: "> [!TIP]- Title\n> body",
		});
		expect(calloutEdit(">> [!note]\n>> body", "tip")).toEqual({
			insert: ">> [!TIP]\n>> body",
		});
		expect(calloutEdit("> [!note]\n> > [!tip]\n> > body", "danger")).toEqual({
			insert: "> [!DANGER]\n> > [!tip]\n> > body",
		});
	});
	it("supports a custom ID, which the toolbar always allows regardless of GitHub compatibility", () => {
		expect(calloutEdit("body", "custom")).toEqual({
			insert: "> [!CUSTOM]\n> body",
		});
	});
});
