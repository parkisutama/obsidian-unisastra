// SPDX-License-Identifier: GPL-3.0-only
// Copyright (C) 2025-2026 Parkis Utama

import { describe, expect, it, vi } from "vitest";

vi.mock("obsidian", () => ({
	Setting: class {},
}));

import type { ToolbarItemId } from "@/capabilities/features/toolbar/settings";
import { LONG_PRESS_MS, LongPressReorder, reorderIds } from "@/components/floaty-toolbar/reorder";
import { moveToolbarItem } from "@/components/toolbar-button-order";

describe("reorderIds", () => {
	it("moves the dragged ID to sit immediately before the drop target", () => {
		expect(reorderIds(["a", "b", "c", "d"], "a", "c")).toEqual(["b", "a", "c", "d"]);
	});
	it("moves an ID backward the same way", () => {
		expect(reorderIds(["a", "b", "c", "d"], "d", "b")).toEqual(["a", "d", "b", "c"]);
	});
	it("returns an equivalent new array when dropped on itself", () => {
		const ids = ["a", "b", "c"];
		const result = reorderIds(ids, "b", "b");
		expect(result).toEqual(ids);
		expect(result).not.toBe(ids);
	});
	it("returns an unchanged copy when either ID is unknown", () => {
		expect(reorderIds(["a", "b"], "a", "z")).toEqual(["a", "b"]);
		expect(reorderIds(["a", "b"], "z", "a")).toEqual(["a", "b"]);
	});
});

function fakeTimers() {
	let nextHandle = 1;
	const pending = new Map<number, () => void>();
	return {
		setTimeout: (fn: () => void) => {
			const handle = nextHandle++;
			pending.set(handle, fn);
			return handle;
		},
		clearTimeout: (handle: number) => {
			pending.delete(handle);
		},
		fireAll: () => {
			for (const fn of pending.values()) {
				fn();
			}
			pending.clear();
		},
		pendingCount: () => pending.size,
	};
}

describe("LongPressReorder", () => {
	it("starts dragging only after the long-press threshold fires", () => {
		const timers = fakeTimers();
		const onDragStart = vi.fn();
		const reorder = new LongPressReorder(() => ["a", "b", "c"], {
			onDragStart,
			onDragEnd: vi.fn(),
			onReorder: vi.fn(),
			setTimeout: timers.setTimeout,
			clearTimeout: timers.clearTimeout,
		});
		reorder.pressStart("a");
		expect(onDragStart).not.toHaveBeenCalled();
		expect(reorder.isDragging()).toBe(false);
		timers.fireAll();
		expect(onDragStart).toHaveBeenCalledWith("a");
		expect(reorder.isDragging()).toBe(true);
	});

	it("cancels the pending timer on a quick release, never suppressing the click", () => {
		const timers = fakeTimers();
		const onDragStart = vi.fn();
		const reorder = new LongPressReorder(() => ["a", "b"], {
			onDragStart,
			onDragEnd: vi.fn(),
			onReorder: vi.fn(),
			setTimeout: timers.setTimeout,
			clearTimeout: timers.clearTimeout,
		});
		reorder.pressStart("a");
		reorder.cancelPending();
		timers.fireAll();
		expect(onDragStart).not.toHaveBeenCalled();
		expect(reorder.consumeSuppressClick()).toBe(false);
	});

	it("drop() reorders on a valid target and suppresses the trailing click", () => {
		const timers = fakeTimers();
		const onReorder = vi.fn();
		const onDragEnd = vi.fn();
		const reorder = new LongPressReorder(() => ["a", "b", "c"], {
			onDragStart: vi.fn(),
			onDragEnd,
			onReorder,
			setTimeout: timers.setTimeout,
			clearTimeout: timers.clearTimeout,
		});
		reorder.pressStart("a");
		timers.fireAll();
		const suppressed = reorder.drop("c");
		expect(suppressed).toBe(true);
		expect(onDragEnd).toHaveBeenCalledWith("a", "c");
		expect(onReorder).toHaveBeenCalledWith(["b", "a", "c"]);
		expect(reorder.isDragging()).toBe(false);
		expect(reorder.consumeSuppressClick()).toBe(true);
		expect(reorder.consumeSuppressClick()).toBe(false);
	});

	it("drop() with no target still suppresses the click, without reordering", () => {
		const timers = fakeTimers();
		const onReorder = vi.fn();
		const reorder = new LongPressReorder(() => ["a", "b"], {
			onDragStart: vi.fn(),
			onDragEnd: vi.fn(),
			onReorder,
			setTimeout: timers.setTimeout,
			clearTimeout: timers.clearTimeout,
		});
		reorder.pressStart("a");
		timers.fireAll();
		expect(reorder.drop(null)).toBe(true);
		expect(onReorder).not.toHaveBeenCalled();
		expect(reorder.consumeSuppressClick()).toBe(true);
	});

	it("cancel() during an active drag ends it without reordering or leaving a stray timer", () => {
		const timers = fakeTimers();
		const onDragEnd = vi.fn();
		const onReorder = vi.fn();
		const reorder = new LongPressReorder(() => ["a", "b"], {
			onDragStart: vi.fn(),
			onDragEnd,
			onReorder,
			setTimeout: timers.setTimeout,
			clearTimeout: timers.clearTimeout,
		});
		reorder.pressStart("a");
		timers.fireAll();
		reorder.cancel();
		expect(onDragEnd).toHaveBeenCalledWith("a", null);
		expect(onReorder).not.toHaveBeenCalled();
		expect(reorder.isDragging()).toBe(false);
		expect(timers.pendingCount()).toBe(0);
	});

	it("cancel() while only pending clears the timer without ever starting a drag", () => {
		const timers = fakeTimers();
		const onDragStart = vi.fn();
		const reorder = new LongPressReorder(() => ["a", "b"], {
			onDragStart,
			onDragEnd: vi.fn(),
			onReorder: vi.fn(),
			setTimeout: timers.setTimeout,
			clearTimeout: timers.clearTimeout,
		});
		reorder.pressStart("a");
		reorder.cancel();
		expect(timers.pendingCount()).toBe(0);
		timers.fireAll();
		expect(onDragStart).not.toHaveBeenCalled();
	});

	it("cancel() is a no-op when already idle", () => {
		const onDragEnd = vi.fn();
		const reorder = new LongPressReorder(() => ["a", "b"], {
			onDragStart: vi.fn(),
			onDragEnd,
			onReorder: vi.fn(),
			setTimeout: vi.fn(),
			clearTimeout: vi.fn(),
		});
		reorder.cancel();
		expect(onDragEnd).not.toHaveBeenCalled();
	});

	it("ignores a second pressStart while a gesture is already in flight", () => {
		const timers = fakeTimers();
		const onDragStart = vi.fn();
		const reorder = new LongPressReorder(() => ["a", "b", "c"], {
			onDragStart,
			onDragEnd: vi.fn(),
			onReorder: vi.fn(),
			setTimeout: timers.setTimeout,
			clearTimeout: timers.clearTimeout,
		});
		reorder.pressStart("a");
		reorder.pressStart("b");
		timers.fireAll();
		expect(onDragStart).toHaveBeenCalledTimes(1);
		expect(onDragStart).toHaveBeenCalledWith("a");
	});

	it("exposes the upstream-parity long-press threshold", () => {
		expect(LONG_PRESS_MS).toBe(500);
	});
});

describe("moveToolbarItem", () => {
	function order(): ToolbarItemId[] {
		return ["bold", "italic", "strikethrough", "code", "highlight", "link", "heading", "callout"];
	}

	it("swaps with the adjacent item when moving up or down", () => {
		const list = order();
		moveToolbarItem(list, 1, -1);
		expect(list.slice(0, 2)).toEqual(["italic", "bold"]);
	});
	it("does nothing when moving the first item up or the last item down", () => {
		const list = order();
		const before = [...list];
		moveToolbarItem(list, 0, -1);
		moveToolbarItem(list, list.length - 1, 1);
		expect(list).toEqual(before);
	});
});
