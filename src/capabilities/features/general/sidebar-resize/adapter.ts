// SPDX-License-Identifier: GPL-3.0-only
// Copyright (C) 2025-2026 Parkis Utama

import { type App, apiVersion, Notice } from "obsidian";
import type { SidebarHost, SidebarSignal, SidebarSnapshot } from "./controller";
import { type SidebarSide, sidebarPairMaximum } from "./model";

// Internal contract verified against the installed Obsidian 1.14.2 host.
// The native setter does NOT clamp. The native drag handler uses these bounds.
// A per-side 80% maximum is unsafe when mirrored: cap the pair at 80% of the
// viewport-bounded workspace, independently of overflowing child widths.
// Versions older than the verified one stay inactive (ADR-003). Newer versions
// are allowed; nativeSidebar() structurally validates the internal contract and
// the host falls back to inactive if a release changes it.
const MIN_VERSION = "1.14.2";
const NATIVE_MIN = 200;
const PIXEL_VALUE = /^\d+(?:\.\d+)?px$/;

interface NativeSidebar {
	collapsed: boolean;
	containerEl: HTMLElement;
	resizeHandleEl: HTMLElement;
	setSize(width: number): void;
	size: number;
}

function atLeast(version: string, minimum: string): boolean {
	const a = version.split(".").map((part) => Number.parseInt(part, 10) || 0);
	const b = minimum.split(".").map((part) => Number.parseInt(part, 10) || 0);
	for (let i = 0; i < Math.max(a.length, b.length); i++) {
		const diff = (a[i] ?? 0) - (b[i] ?? 0);
		if (diff !== 0) {
			return diff > 0;
		}
	}
	return true;
}

function nativeSidebar(value: unknown, doc: Document): NativeSidebar | null {
	const side = value as Partial<NativeSidebar> | null;
	if (
		!side ||
		typeof side.collapsed !== "boolean" ||
		typeof side.setSize !== "function" ||
		!Number.isFinite(side.size) ||
		!side.containerEl?.isConnected ||
		!side.resizeHandleEl?.isConnected ||
		side.containerEl.ownerDocument !== doc ||
		side.resizeHandleEl.ownerDocument !== doc
	) {
		return null;
	}
	return side as NativeSidebar;
}

export class ObsidianSidebarHost implements SidebarHost {
	private readonly app: App;
	private readonly doc: Document;
	private readonly win: Window & typeof window;
	private identity: object = {};
	private left: NativeSidebar | null = null;
	private right: NativeSidebar | null = null;

	constructor(app: App) {
		this.app = app;
		this.doc = app.workspace.containerEl.ownerDocument;
		this.win = this.doc.defaultView as Window & typeof window;
	}

	private updatePair(): boolean {
		if (!atLeast(apiVersion, MIN_VERSION)) {
			return false;
		}
		const left = nativeSidebar(this.app.workspace.leftSplit, this.doc);
		const right = nativeSidebar(this.app.workspace.rightSplit, this.doc);
		if (left !== this.left || right !== this.right) {
			this.identity = {};
			this.left = left;
			this.right = right;
		}
		return left !== null && right !== null;
	}

	read(): SidebarSnapshot | null {
		if (!(this.updatePair() && this.left && this.right)) {
			return null;
		}
		const max = sidebarPairMaximum(
			this.app.workspace.containerEl.clientWidth,
			Math.min(this.win.innerWidth, this.doc.documentElement.clientWidth),
		);
		if (max === null) {
			return null;
		}
		const measure = (side: NativeSidebar) => {
			const css = this.win.getComputedStyle(side.containerEl);
			return {
				open: !side.collapsed,
				width: side.size,
				rendered: side.containerEl.getBoundingClientRect().width,
				min: Math.max(
					NATIVE_MIN,
					PIXEL_VALUE.test(css.minWidth) ? Number.parseFloat(css.minWidth) : NATIVE_MIN,
				),
				max: Math.min(max, PIXEL_VALUE.test(css.maxWidth) ? Number.parseFloat(css.maxWidth) : max),
			};
		};
		return {
			identity: this.identity,
			left: measure(this.left),
			right: measure(this.right),
			// Native animation sets overflow:hidden before interpolating width and
			// removes it on completion/cancellation. It retains side.size throughout.
			stable:
				this.left.containerEl.style.overflow !== "hidden" &&
				this.right.containerEl.style.overflow !== "hidden",
		};
	}

	write(side: SidebarSide, width: number, snapshot: SidebarSnapshot): boolean {
		// Recheck native state between writes without read/write/read layout thrashing.
		// Verified setSize only writes size/inline width; it does not change bounds.
		if (
			!this.updatePair() ||
			this.identity !== snapshot.identity ||
			!this.left ||
			!this.right ||
			this.left.collapsed ||
			this.right.collapsed ||
			this.left.containerEl.style.overflow === "hidden" ||
			this.right.containerEl.style.overflow === "hidden"
		) {
			return false;
		}
		const min = Math.max(snapshot.left.min, snapshot.right.min);
		const max = Math.min(snapshot.left.max, snapshot.right.max, this.win.innerWidth * 0.4);
		if (!Number.isFinite(width) || width < min || width > max) {
			return false;
		}
		const dock = side === "left" ? this.left : this.right;
		dock.setSize(width);
		return true;
	}

	save(): void {
		this.app.workspace.requestSaveLayout();
		// Internal companion to setSize, verified in the same native host probe.
		const workspace = this.app.workspace as typeof this.app.workspace & {
			requestResize?: () => void;
		};
		workspace.requestResize?.();
	}

	warn(): void {
		new Notice(
			"Sinkronisasi lebar sidebar ditangguhkan. Perbesar jendela atau tutup satu sidebar bila ruang terlalu sempit. Periksa juga snippet CSS dan versi Obsidian (minimal 1.14.2).",
		);
	}

	frame(callback: () => void): number {
		return this.win.requestAnimationFrame(callback);
	}
	cancelFrame(id: number): void {
		this.win.cancelAnimationFrame(id);
	}

	subscribe(callback: (event: SidebarSignal) => void): () => void {
		let dragging = false;
		const geometry = () => callback({ type: "geometry" });
		const layout = () => {
			observePair();
			callback({ type: "layout" });
		};
		const resize = new this.win.ResizeObserver(geometry);
		const mutation = new this.win.MutationObserver(geometry);
		let observed: object | null = null;
		const observePair = () => {
			this.updatePair();
			if (observed === this.identity) {
				return;
			}
			observed = this.identity;
			resize.disconnect();
			mutation.disconnect();
			resize.observe(this.app.workspace.containerEl);
			for (const side of [this.left, this.right]) {
				if (side) {
					resize.observe(side.containerEl);
					mutation.observe(side.containerEl, {
						attributes: true,
						attributeFilter: ["style", "class"],
					});
				}
			}
		};
		const down = (event: PointerEvent) => {
			if (event.button !== 0) {
				return;
			}
			this.updatePair();
			for (const side of ["left", "right"] as const) {
				const handle = this[side]?.resizeHandleEl;
				if (handle && event.composedPath().includes(handle)) {
					dragging = true;
					callback({ type: "drag-start", side });
				}
			}
		};
		const move = () => {
			if (dragging) {
				geometry();
			}
		};
		const end = () => {
			if (dragging) {
				dragging = false;
				callback({ type: "drag-end" });
			}
		};
		observePair();
		this.doc.addEventListener("pointerdown", down, true);
		this.win.addEventListener("pointermove", move);
		this.win.addEventListener("pointerup", end);
		this.win.addEventListener("pointercancel", end);
		this.win.addEventListener("blur", end);
		this.win.addEventListener("resize", geometry);
		const workspace = this.app.workspace;
		const ref = workspace.on("layout-change", layout);
		const cssRef = workspace.on("css-change", layout);
		return () => {
			resize.disconnect();
			mutation.disconnect();
			workspace.offref(ref);
			workspace.offref(cssRef);
			this.doc.removeEventListener("pointerdown", down, true);
			this.win.removeEventListener("pointermove", move);
			this.win.removeEventListener("pointerup", end);
			this.win.removeEventListener("pointercancel", end);
			this.win.removeEventListener("blur", end);
			this.win.removeEventListener("resize", geometry);
		};
	}
}
