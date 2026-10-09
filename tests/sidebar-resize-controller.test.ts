// SPDX-License-Identifier: GPL-3.0-only
// Copyright (C) 2025-2026 Parkis Utama

import { describe, expect, it, vi } from "vitest";
import {
	type SidebarHost,
	SidebarResizeController,
	type SidebarSignal,
	type SidebarSnapshot,
} from "@/capabilities/features/general/sidebar-resize/controller";
import type { SidebarSide } from "@/capabilities/features/general/sidebar-resize/model";

function fixture() {
	const snapshot: SidebarSnapshot = {
		identity: {},
		stable: true,
		left: { open: true, width: 320, rendered: 320, min: 200, max: 600 },
		right: { open: true, width: 380, rendered: 380, min: 200, max: 600 },
	};
	let listener: (signal: SidebarSignal) => void = () => undefined;
	let frame: (() => void) | null = null;
	let available = true;
	const host: SidebarHost = {
		read: vi.fn(() => (available ? structuredCloneExceptIdentity() : null)),
		subscribe: (next) => {
			listener = next;
			return () => {
				listener = () => undefined;
			};
		},
		frame: (next) => {
			frame = next;
			return 1;
		},
		cancelFrame: () => {
			frame = null;
		},
		write: vi.fn((side: SidebarSide, width: number, expected: SidebarSnapshot) => {
			if (
				!available ||
				snapshot.identity !== expected.identity ||
				!snapshot.stable ||
				!(snapshot.left.open && snapshot.right.open)
			) {
				return false;
			}
			snapshot[side].width = width;
			snapshot[side].rendered = width;
			return true;
		}),
		save: vi.fn(),
		warn: vi.fn(),
	};
	function structuredCloneExceptIdentity() {
		return {
			...snapshot,
			left: { ...snapshot.left },
			right: { ...snapshot.right },
		};
	}
	const controller = new SidebarResizeController(host);
	const flush = () => {
		const next = frame;
		frame = null;
		next?.();
	};
	return {
		snapshot,
		host,
		controller,
		flush,
		emit: (s: SidebarSignal) => listener(s),
		pending: () => frame !== null,
		unsupported: () => {
			available = false;
		},
	};
}

describe("sidebar synchronization lifecycle", () => {
	it("does not save or schedule verification when the host rejects a stale write", () => {
		const f = fixture();
		f.host.write = vi.fn(() => false);
		f.controller.start();
		f.flush();
		expect(f.host.save).not.toHaveBeenCalled();
		expect(f.pending()).toBe(false);
	});
	it("coalesces input bursts to one measurement and writes only the follower", () => {
		const f = fixture();
		f.controller.start();
		f.flush();
		f.flush();
		vi.mocked(f.host.read).mockClear();
		vi.mocked(f.host.write).mockClear();
		f.emit({ type: "drag-start", side: "left" });
		f.snapshot.left.width = 420;
		f.snapshot.left.rendered = 420;
		for (let i = 0; i < 100; i++) {
			f.emit({ type: "geometry" });
		}
		f.flush();
		expect(f.host.read).toHaveBeenCalledTimes(1);
		expect(f.host.write).toHaveBeenCalledTimes(1);
		expect(f.snapshot.right.width).toBe(420);
	});
	it("checks pairwise rendered equality, not only each side's distance to target", () => {
		const f = fixture();
		f.snapshot.left.width = 350;
		f.snapshot.right.width = 350;
		f.snapshot.left.rendered = 349.6;
		f.snapshot.right.rendered = 350.4;
		f.controller.start();
		f.flush();
		expect(Math.abs(f.snapshot.left.rendered - f.snapshot.right.rendered)).toBeLessThanOrEqual(0.5);
	});
	it("uses the final native size even when pointerup arrives before the frame", () => {
		const f = fixture();
		f.controller.start();
		f.flush();
		f.flush();
		f.emit({ type: "drag-start", side: "left" });
		f.snapshot.left.width = 430;
		f.snapshot.left.rendered = 430;
		f.emit({ type: "drag-end" });
		f.flush();
		expect(f.snapshot.right.width).toBe(430);
	});
	it("reclamps the shared target when native bounds shrink", () => {
		const f = fixture();
		f.controller.start();
		f.flush();
		f.flush();
		f.snapshot.right.max = 280;
		f.emit({ type: "layout" });
		f.flush();
		expect(f.snapshot.left.width).toBe(280);
		expect(f.snapshot.right.width).toBe(280);
	});
	it("rechecks the second side if native write synchronously collapses it", () => {
		const f = fixture();
		const write = f.host.write;
		f.host.write = vi.fn((...args: Parameters<SidebarHost["write"]>) => {
			const changed = write(...args);
			f.snapshot.right.open = false;
			return changed;
		});
		f.controller.start();
		f.flush();
		expect(f.snapshot.right.width).toBe(380);
		expect(f.host.write).toHaveBeenCalledTimes(2);
	});
	it("resets when the host replaces the sidebar pair", () => {
		const f = fixture();
		f.controller.start();
		f.flush();
		f.flush();
		f.snapshot.identity = {};
		f.snapshot.left.width = 250;
		f.snapshot.left.rendered = 250;
		f.emit({ type: "layout" });
		f.flush();
		expect(f.snapshot.right.width).toBe(300);
	});
	it("averages once and does not bounce observer writes", () => {
		const f = fixture();
		f.controller.start();
		f.flush();
		f.flush();
		expect(f.snapshot.left.width).toBe(350);
		expect(f.snapshot.right.width).toBe(350);
		f.emit({ type: "geometry" });
		f.flush();
		expect(f.host.write).toHaveBeenCalledTimes(2);
		expect(f.pending()).toBe(false);
	});
	it.each(["left", "right"] as const)("mirrors %s before drag ends", (side) => {
		const f = fixture();
		f.controller.start();
		f.flush();
		f.flush();
		f.emit({ type: "drag-start", side });
		f.snapshot[side].width = 420;
		f.snapshot[side].rendered = 420;
		f.emit({ type: "geometry" });
		f.flush();
		expect(f.snapshot.left.width).toBe(420);
		expect(f.snapshot.right.width).toBe(420);
	});
	it("does not copy opening animation or change the closed side", () => {
		const f = fixture();
		f.snapshot.right.open = false;
		f.controller.start();
		f.flush();
		f.snapshot.left.width = 300;
		f.snapshot.left.rendered = 300;
		f.emit({ type: "geometry" });
		f.flush();
		expect(f.host.write).not.toHaveBeenCalled();
		f.snapshot.right.open = true;
		f.snapshot.stable = false;
		f.snapshot.right.rendered = 20;
		f.emit({ type: "layout" });
		f.flush();
		expect(f.host.write).not.toHaveBeenCalled();
		f.snapshot.stable = true;
		f.snapshot.right.rendered = 380;
		f.flush();
		expect(f.snapshot.left.width).toBe(380);
	});
	it("rechecks visibility and cancels a queued drag when a side closes", () => {
		const f = fixture();
		f.controller.start();
		f.flush();
		f.flush();
		f.emit({ type: "drag-start", side: "left" });
		f.snapshot.left.width = 420;
		f.snapshot.right.open = false;
		f.emit({ type: "layout" });
		f.flush();
		expect(f.snapshot.right.width).toBe(350);
	});
	it("stops bounded reconciliation when rendered width is forced by CSS", () => {
		const f = fixture();
		f.host.write = vi.fn((side: SidebarSide, width: number) => {
			f.snapshot[side].width = width;
			return true;
		});
		f.controller.start();
		for (let i = 0; i < 10; i++) {
			f.flush();
			f.emit({ type: "geometry" });
		}
		f.flush();
		expect(f.host.write).toHaveBeenCalledTimes(4);
		expect(f.host.warn).toHaveBeenCalledTimes(1);
		expect(f.pending()).toBe(false);
	});
	it("refuses impossible bounds and an unsupported host", () => {
		const f = fixture();
		f.snapshot.right.min = 700;
		f.controller.start();
		f.flush();
		expect(f.host.write).not.toHaveBeenCalled();
		expect(f.host.warn).toHaveBeenCalledTimes(1);
		f.unsupported();
		f.emit({ type: "layout" });
		f.flush();
		expect(f.host.write).not.toHaveBeenCalled();
	});
	it("cleans up pending work and supports idempotent start/stop", () => {
		const f = fixture();
		f.controller.start();
		f.controller.start();
		f.controller.stop();
		f.controller.stop();
		f.flush();
		f.emit({ type: "layout" });
		f.flush();
		expect(f.host.write).not.toHaveBeenCalled();
		f.controller.start();
		f.flush();
		expect(f.snapshot.left.width).toBe(350);
	});
	it("bounds missing animation completion and can recover on new input", () => {
		const f = fixture();
		f.snapshot.stable = false;
		f.controller.start();
		for (let i = 0; i < 60; i++) {
			f.flush();
		}
		expect(f.pending()).toBe(false);
		expect(f.host.write).not.toHaveBeenCalled();
		f.snapshot.stable = true;
		f.emit({ type: "layout" });
		f.flush();
		expect(f.snapshot.left.width).toBe(350);
	});
});
