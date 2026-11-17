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
function stubCore(registered: string[] = []): UnisastraCore {
	const addCommand = (command: { id: string }) => {
		registered.push(command.id);
	};
	const stub: unknown = new Proxy(() => undefined, {
		get: (_target, prop) => (prop === "plugin" ? { addCommand } : stub),
	});
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

	it("registers every command with Obsidian when loaded", () => {
		const registered: string[] = [];
		for (const command of Object.values(getCommands(stubCore(registered)))) {
			command.load();
		}
		expect(new Set(registered).size).toBe(registered.length);
		expect(registered).toEqual(
			expect.arrayContaining([
				"outline-filter-all",
				"outline-filter-branch",
				"outline-filter-tasks",
				"outline-filter-cycle",
				"reveal-active-outline-node",
				"move-typewriter-up",
				"move-typewriter-down",
			]),
		);
	});
});
