// SPDX-License-Identifier: GPL-3.0-only
// Copyright (C) 2025-2026 Parkis Utama

import type { App, CachedMetadata, HeadingCache, TFile } from "obsidian";
import { describe, expect, it } from "vitest";
import { parseAnchor, resolveSlugTarget } from "@/gfm-anchor/resolver";
import { buildSlugMap, isGFMSlug, toGFMSlug } from "@/gfm-anchor/slug";

const createHeading = (heading: string, line: number): HeadingCache => ({
	heading,
	level: 2,
	position: {
		end: { col: 0, line, offset: 0 },
		start: { col: 0, line, offset: 0 },
	},
});

const createApp = (metadata: CachedMetadata): App =>
	({
		metadataCache: {
			getFileCache: () => metadata,
		},
	}) as unknown as App;

describe("GFM anchor compatibility", () => {
	it("creates Unicode-aware GFM slugs", () => {
		expect(toGFMSlug("Instalasi & Setup")).toBe("instalasi--setup");
		expect(toGFMSlug("Café dan Niño")).toBe("café-dan-niño");
	});

	it("detects GFM fragments without claiming Obsidian heading fragments", () => {
		expect(isGFMSlug("instalasi--setup")).toBe(true);
		expect(isGFMSlug("café-dan-niño")).toBe(true);
		expect(isGFMSlug("Instalasi%20%26%20Setup")).toBe(false);
		expect(isGFMSlug("Instalasi & Setup")).toBe(false);
	});

	it("builds duplicate heading suffixes with GFM numbering", () => {
		const slugMap = buildSlugMap([
			createHeading("Fitur Utama", 1),
			createHeading("Fitur Utama", 4),
			createHeading("Fitur Utama", 8),
		]);

		expect(slugMap.get("fitur-utama")).toBe("Fitur Utama");
		expect(slugMap.get("fitur-utama-1")).toBe("Fitur Utama");
		expect(slugMap.get("fitur-utama-2")).toBe("Fitur Utama");
	});

	it("resolves duplicate heading occurrences and source lines", () => {
		const file = { path: "docs.md" } as TFile;
		const app = createApp({
			headings: [createHeading("Fitur Utama", 1), createHeading("Fitur Utama", 4)],
		});

		expect(resolveSlugTarget("fitur-utama-1", file, app)).toEqual({
			heading: "Fitur Utama",
			headingOccurrence: 1,
			line: 4,
		});
	});

	it("parses same-file, cross-file, and bare fragments", () => {
		expect(parseAnchor("#instalasi--setup")).toEqual({
			filePart: "",
			fragment: "instalasi--setup",
		});
		expect(parseAnchor("panduan.md#café-dan-niño")).toEqual({
			filePart: "panduan.md",
			fragment: "café-dan-niño",
		});
		expect(parseAnchor("fitur-utama")).toEqual({
			filePart: "",
			fragment: "fitur-utama",
		});
	});
});
