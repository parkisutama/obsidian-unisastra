// SPDX-License-Identifier: GPL-3.0-only
// Copyright (C) 2025-2026 Parkis Utama

import { describe, expect, it, vi } from "vitest";

vi.mock("@/components/callout-icon-picker", () => ({
	CalloutIconPicker: class {},
}));

vi.mock("obsidian", () => ({
	Notice: class {},
	Setting: class {},
}));

import {
	BUILTIN_CALLOUT_TYPES,
	canonicalBuiltinCalloutId,
	githubAlertMarkersForCanonicalId,
	githubMarkerCanonicalId,
	isBuiltinCalloutId,
	isGithubAlertMarker,
} from "@/capabilities/features/callouts/catalog";
import {
	calloutMenuOptions,
	DEFAULT_CALLOUT_SETTINGS,
	normalizeCalloutSettings,
} from "@/capabilities/features/callouts/settings";
import { moveEntry } from "@/components/callout-manager";

describe("callout catalog", () => {
	it("returns every enabled entry regardless of the legacy outputMode value — there is no separate GitHub menu", () => {
		const settings = normalizeCalloutSettings({
			outputMode: "github",
			entries: [{ id: "custom", label: "Custom", source: "custom", enabled: true }],
		});
		expect(calloutMenuOptions(settings).some((item) => item.id === "custom")).toBe(true);
		expect(calloutMenuOptions(settings).some((item) => item.id === "tip")).toBe(true);
		settings.outputMode = "obsidian";
		expect(calloutMenuOptions(settings)).toEqual(
			calloutMenuOptions({ ...settings, outputMode: "github" }),
		);
	});
	it("hides a disabled entry from the menu regardless of outputMode", () => {
		const settings = normalizeCalloutSettings({ outputMode: "github" });
		const tip = settings.entries.find((entry) => entry.id === "tip");
		if (tip) {
			(tip as { enabled: boolean }).enabled = false;
		}
		expect(calloutMenuOptions(settings).some((item) => item.id === "tip")).toBe(false);
	});
	it("reports the single GitHub Alert marker a builtin ID is compatible with, informationally", () => {
		expect(githubAlertMarkersForCanonicalId("tip")).toEqual(["TIP"]);
		expect(githubAlertMarkersForCanonicalId("important")).toEqual(["IMPORTANT"]);
		expect(githubAlertMarkersForCanonicalId("warning")).toEqual(["WARNING"]);
		expect(githubAlertMarkersForCanonicalId("caution")).toEqual(["CAUTION"]);
		expect(githubAlertMarkersForCanonicalId("note")).toEqual(["NOTE"]);
		expect(githubAlertMarkersForCanonicalId("danger")).toEqual([]);
		expect(githubAlertMarkersForCanonicalId("my-custom-id")).toEqual([]);
	});
	it("resolves builtin types to a canonical lowercase ID, including promoted aliases", () => {
		expect(canonicalBuiltinCalloutId("note")).toBe("note");
		expect(canonicalBuiltinCalloutId("NOTE")).toBe("note");
		expect(canonicalBuiltinCalloutId("tldr")).toBe("abstract");
		// "important"/"caution" are full catalog entries, not aliases collapsed
		// into tip/warning: Obsidian renders their literal type token as the
		// default title even though the icon/color match tip/warning natively.
		expect(canonicalBuiltinCalloutId("Important")).toBe("important");
		expect(canonicalBuiltinCalloutId("caution")).toBe("caution");
		expect(canonicalBuiltinCalloutId("hint")).toBe("tip");
		expect(canonicalBuiltinCalloutId("not-a-callout")).toBeNull();
	});
	it("flags every builtin ID and alias as builtin, and unknown IDs as not", () => {
		for (const type of BUILTIN_CALLOUT_TYPES) {
			expect(isBuiltinCalloutId(type.id)).toBe(true);
			for (const alias of type.aliases) {
				expect(isBuiltinCalloutId(alias)).toBe(true);
			}
		}
		expect(isBuiltinCalloutId("my-custom-id")).toBe(false);
	});
	it("maps each GitHub Alert marker to its own canonical ID", () => {
		expect(isGithubAlertMarker("IMPORTANT")).toBe(true);
		expect(isGithubAlertMarker("unknown")).toBe(false);
		expect(githubMarkerCanonicalId("NOTE")).toBe("note");
		expect(githubMarkerCanonicalId("TIP")).toBe("tip");
		expect(githubMarkerCanonicalId("IMPORTANT")).toBe("important");
		expect(githubMarkerCanonicalId("WARNING")).toBe("warning");
		expect(githubMarkerCanonicalId("CAUTION")).toBe("caution");
	});
});

describe("callout settings normalization", () => {
	it("provides all builtin types enabled and ordered by default", () => {
		expect(DEFAULT_CALLOUT_SETTINGS.outputMode).toBe("obsidian");
		expect(DEFAULT_CALLOUT_SETTINGS.entries).toHaveLength(BUILTIN_CALLOUT_TYPES.length);
		expect(DEFAULT_CALLOUT_SETTINGS.entries.every((entry) => entry.enabled)).toBe(true);
	});
	it("does not share mutable defaults across normalization calls", () => {
		const first = normalizeCalloutSettings(undefined);
		const second = normalizeCalloutSettings(undefined);
		(first.entries[0] as { label: string }).label = "mutated";
		first.entries.pop();
		expect(second.entries[0].label).not.toBe("mutated");
		expect(second.entries).toHaveLength(BUILTIN_CALLOUT_TYPES.length);
	});
	it("accepts a valid custom hyphenated ID and preserves label/order/visibility", () => {
		const settings = normalizeCalloutSettings({
			entries: [
				{
					id: "my-custom-id",
					label: "My Custom",
					enabled: false,
					order: -1,
				},
			],
		});
		const custom = settings.entries.find((entry) => entry.id === "my-custom-id");
		expect(custom).toMatchObject({
			id: "my-custom-id",
			label: "My Custom",
			enabled: false,
			source: "custom",
		});
	});
	it("rejects a malformed custom ID without dropping the builtin catalog", () => {
		const settings = normalizeCalloutSettings({
			entries: [{ id: "Not Valid! ID", label: "Bad" }],
		});
		expect(settings.entries.some((entry) => entry.label === "Bad")).toBe(false);
		expect(settings.entries).toHaveLength(BUILTIN_CALLOUT_TYPES.length);
	});
	it("deduplicates a custom entry that collides with a builtin alias, case-insensitively", () => {
		const settings = normalizeCalloutSettings({
			entries: [
				{ id: "TLDR", label: "Duplicate", order: 0 },
				{ id: "abstract", label: "Abstract", order: 1 },
			],
		});
		const abstractEntries = settings.entries.filter((entry) => entry.id === "abstract");
		expect(abstractEntries).toHaveLength(1);
		expect(abstractEntries[0].label).toBe("Duplicate");
	});
	it("keeps existing entries on a nested merge while adding new builtins", () => {
		const settings = normalizeCalloutSettings({
			outputMode: "github",
			entries: [{ id: "note", label: "Renamed note", enabled: false, order: 5 }],
		});
		expect(settings.outputMode).toBe("github");
		const note = settings.entries.find((entry) => entry.id === "note");
		expect(note).toMatchObject({ label: "Renamed note", enabled: false });
		expect(settings.entries.length).toBe(BUILTIN_CALLOUT_TYPES.length);
	});
});

describe("callout manager reordering", () => {
	function entries() {
		return normalizeCalloutSettings(undefined).entries;
	}
	it("swaps order with the adjacent entry when moving up or down", () => {
		const list = entries();
		const [first, second] = list;
		moveEntry(list, 1, -1);
		expect(list[0].id).toBe(second.id);
		expect(list[1].id).toBe(first.id);
	});
	it("does nothing when moving the first entry up or the last entry down", () => {
		const list = entries();
		const before = list.map((entry) => entry.id);
		moveEntry(list, 0, -1);
		moveEntry(list, list.length - 1, 1);
		expect(list.map((entry) => entry.id)).toEqual(before);
	});
});
