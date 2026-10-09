// SPDX-License-Identifier: GPL-3.0-only
// Copyright (C) 2025-2026 Parkis Utama

import { describe, expect, it, vi } from "vitest";

vi.mock("obsidian", () => ({ FuzzySuggestModal: class {} }));

import { availableLucideIds } from "@/components/callout-icon-picker";

describe("available icon picker catalog", () => {
	it("uses the host icon catalog, canonicalizes IDs, and excludes unavailable icons", () => {
		const available = new Set(["lucide-pencil", "lucide-book"]);
		expect(
			availableLucideIds(["pencil", "lucide-pencil", "lucide-book", "custom-icon"], (id) =>
				available.has(id),
			),
		).toEqual(["lucide-book", "lucide-pencil"]);
		expect(availableLucideIds([], () => true)).toEqual([]);
	});
});
