// SPDX-License-Identifier: GPL-3.0-only
// Copyright (C) 2025-2026 Parkis Utama

import { describe, expect, it, vi } from "vitest";
import { getCommands } from "@/capabilities/commands";
import type UnisastraCore from "@/lib";

vi.mock("obsidian", () => ({
	ItemView: class {},
	Notice: class {},
	MarkdownView: class {},
}));

// Commands only read feature handles from the core while being built; any property answers.
function stubCore(): UnisastraCore {
	const stub: unknown = new Proxy(() => undefined, { get: () => stub });
	return stub as UnisastraCore;
}

describe("getCommands", () => {
	const keys = Object.keys(getCommands(stubCore()));

	it("no longer offers editor list commands that Obsidian Smart lists replace", () => {
		for (const id of ["indent-list-item", "outdent-list-item", "move-list-up", "move-list-down"]) {
			expect(keys).not.toContain(id);
		}
	});

	it("keeps the focus and outline commands", () => {
		expect(keys).toEqual(expect.arrayContaining(["zoom-in", "reveal-active-outline-node"]));
	});
});
