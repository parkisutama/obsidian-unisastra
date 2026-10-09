// SPDX-License-Identifier: GPL-3.0-only
// Copyright (C) 2025-2026 Parkis Utama

import { EditorView } from "@codemirror/view";
import { MarkdownView, Notice, Platform } from "obsidian";
import { calloutMenuOptions } from "@/capabilities/features/callouts/settings";
import { getVisibleRange } from "@/cm6/outliner/utils";
import type UnisastraCore from "@/lib";
import type { ToolbarAction } from "./actions";
import {
	type ElapsedState,
	EMPTY_FILE_ELAPSED,
	elapsedMs,
	type FileElapsedState,
	nextFileElapsedState,
	STOPPED_ELAPSED,
	startElapsed,
} from "./elapsed";
import { executeToolbarAction, type ToolbarTarget } from "./executor";
import { hudSegments } from "./hud";
import { setDockMode, type ToolbarItemId, type ToolbarSettings } from "./settings";

export function dockVisibility(
	mode: ToolbarSettings["mode"],
	persistent: boolean,
	visible: boolean,
	event: "typing" | "leave" | "reveal",
): boolean {
	if (mode !== "dock") {
		return false;
	}
	if (persistent || event === "reveal") {
		return true;
	}
	return event === "typing" || event === "leave" ? false : visible;
}
export type DockEvent = "typing" | "leave" | "reveal";
export interface ToolbarElapsedSnapshot {
	readonly fileMs: number;
	readonly sessionMs: number;
}
export interface ToolbarCalloutOption {
	readonly id: string;
	readonly label: string;
}
export interface ToolbarSurface {
	destroy: () => void;
	update: (
		view: EditorView | null,
		settings: ToolbarSettings,
		dockVisible: boolean,
		elapsed: ToolbarElapsedSnapshot,
		calloutOptions: readonly ToolbarCalloutOption[],
	) => void;
}
export type SurfaceFactory = (
	doc: Document,
	execute: (action: ToolbarAction) => void,
	reportDockEvent: (event: DockEvent) => void,
	resetSession: () => void,
	openCalloutManager: () => void,
	togglePin: () => void,
	reorderButtons: (newOrder: ToolbarItemId[]) => void,
) => ToolbarSurface;

export class ToolbarController {
	private readonly editors = new Set<EditorView>();
	private readonly active = new Map<Document, EditorView>();
	private readonly surfaces = new Map<Document, ToolbarSurface>();
	private readonly frames = new Map<Document, number>();
	private readonly dockVisible = new Map<Document, boolean>();
	private readonly fileElapsed = new Map<Document, FileElapsedState>();
	private session: ElapsedState = STOPPED_ELAPSED;
	private statusBarEl: HTMLElement | null = null;
	private hudSignature = "";
	private tickHandle: number | null = null;
	private tickIntervalSeconds: number | null = null;
	private disposed = false;
	private factory: SurfaceFactory | null = null;
	private readonly tm: UnisastraCore;
	constructor(tm: UnisastraCore) {
		this.tm = tm;
	}

	setSurfaceFactory(factory: SurfaceFactory): void {
		this.factory = factory;
		this.refresh();
	}
	load(): void {
		const workspace = this.tm.plugin.app.workspace;
		this.tm.plugin.registerEvent(
			workspace.on("active-leaf-change", (leaf) => {
				const view = leaf?.view;
				if (!view) {
					return;
				}
				const doc = view.containerEl.ownerDocument;
				const cm =
					view instanceof MarkdownView
						? (view.editor as unknown as { cm?: EditorView }).cm
						: undefined;
				if (cm && this.editors.has(cm)) {
					this.active.set(doc, cm);
				} else {
					this.active.delete(doc);
				}
				this.syncFileElapsed(view, doc);
				this.schedule(doc);
			}),
		);
		this.tm.plugin.registerEvent(
			workspace.on("file-open", () => {
				const view = workspace.getActiveViewOfType(MarkdownView);
				if (!view) {
					return;
				}
				const doc = view.containerEl.ownerDocument;
				this.syncFileElapsed(view, doc);
				this.schedule(doc);
			}),
		);
		this.tm.plugin.registerEvent(
			workspace.on("window-close", (_host, win) => this.closeWindow(win.document)),
		);
		this.syncSession();
		workspace.onLayoutReady(() => {
			if (this.disposed) {
				return;
			}
			const view = workspace.getActiveViewOfType(MarkdownView);
			if (view) {
				this.syncFileElapsed(view, view.containerEl.ownerDocument);
			}
			this.refresh();
		});
	}
	private syncFileElapsed(view: unknown, doc: Document): void {
		const activePath = view instanceof MarkdownView ? (view.file?.path ?? null) : null;
		this.fileElapsed.set(
			doc,
			nextFileElapsedState(this.fileElapsed.get(doc) ?? EMPTY_FILE_ELAPSED, activePath, Date.now()),
		);
	}
	private syncSession(): void {
		const enabled = this.tm.settings.toolbar.enabled;
		if (enabled && this.session.startedAt === null) {
			this.session = startElapsed(Date.now());
		} else if (!enabled && this.session.startedAt !== null) {
			this.session = STOPPED_ELAPSED;
			this.fileElapsed.clear();
		}
		const timers = this.tm.settings.toolbar.timers;
		if (enabled && !Platform.isMobile && (timers.sessionVisible || timers.fileVisible)) {
			this.ensureTick();
		} else {
			this.stopTick();
		}
	}
	private ensureTick(): void {
		if (this.disposed) {
			return;
		}
		const intervalSeconds = this.tm.settings.toolbar.timers.updateIntervalSeconds;
		if (this.tickHandle !== null) {
			if (this.tickIntervalSeconds === intervalSeconds) {
				return;
			}
			this.stopTick();
		}
		const win = this.tm.plugin.app.workspace.containerEl.ownerDocument.defaultView;
		if (!win) {
			return;
		}
		this.tickIntervalSeconds = intervalSeconds;
		this.tickHandle = win.setInterval(() => this.tick(), intervalSeconds * 1000);
	}
	private stopTick(): void {
		if (this.tickHandle === null) {
			return;
		}
		const win = this.tm.plugin.app.workspace.containerEl.ownerDocument.defaultView;
		win?.clearInterval(this.tickHandle);
		this.tickHandle = null;
		this.tickIntervalSeconds = null;
	}
	private tick(): void {
		for (const doc of new Set([...this.active.keys(), ...this.surfaces.keys()])) {
			this.schedule(doc);
		}
	}
	resetSession(): void {
		if (this.session.startedAt !== null) {
			this.session = startElapsed(Date.now());
		}
	}
	togglePin(): void {
		const toolbar = this.tm.settings.toolbar;
		const refusal = setDockMode(toolbar, toolbar.mode !== "dock");
		if (refusal) {
			new Notice(refusal);
			return;
		}
		this.tm.saveSettings().catch((error: unknown) => {
			console.error("Unisastra: failed to save settings.", error);
		});
	}
	reorderButtons(newOrder: ToolbarItemId[]): void {
		this.tm.settings.toolbar.buttonOrder = newOrder;
		this.tm.saveSettings().catch((error: unknown) => {
			console.error("Unisastra: failed to save settings.", error);
		});
		for (const doc of this.active.keys()) {
			this.schedule(doc);
		}
	}
	getSessionElapsedMs(now = Date.now()): number {
		return elapsedMs(this.session, now);
	}
	getFileElapsedMs(doc: Document, now = Date.now()): number {
		const state = this.fileElapsed.get(doc);
		return state ? elapsedMs(state.elapsed, now) : 0;
	}
	attach(view: EditorView): void {
		if (this.disposed || Platform.isMobile) {
			return;
		}
		this.editors.add(view);
		this.changed(view);
	}
	changed(view: EditorView): void {
		if (this.disposed) {
			return;
		}
		const doc = view.dom.ownerDocument;
		if (view.hasFocus || !this.active.has(doc)) {
			this.active.set(doc, view);
		}
		if (this.tm.settings.toolbar.enabled) {
			this.schedule(doc);
		}
	}
	notifyTyping(view: EditorView): void {
		this.reportDockEvent(view.dom.ownerDocument, "typing");
	}
	reportDockEvent(doc: Document, event: DockEvent): void {
		if (this.disposed || !this.tm.settings.toolbar.enabled) {
			return;
		}
		const toolbar = this.tm.settings.toolbar;
		const current = this.dockVisible.get(doc) ?? true;
		this.dockVisible.set(
			doc,
			dockVisibility(toolbar.mode, toolbar.dockAlwaysVisible, current, event),
		);
		this.schedule(doc);
	}
	detach(view: EditorView): void {
		this.editors.delete(view);
		const doc = view.dom.ownerDocument;
		if (this.active.get(doc) === view) {
			this.active.delete(doc);
		}
		this.schedule(doc);
	}
	private markdownView(cm: EditorView): MarkdownView | null {
		for (const leaf of this.tm.plugin.app.workspace.getLeavesOfType("markdown")) {
			if (
				leaf.view instanceof MarkdownView &&
				(leaf.view.editor as unknown as { cm?: EditorView }).cm === cm
			) {
				return leaf.view;
			}
		}
		return null;
	}
	target(view: EditorView): ToolbarTarget {
		const doc = view.dom.ownerDocument;
		const source = this.markdownView(view);
		const path = source?.file?.path;
		return {
			get state() {
				return view.state;
			},
			dispatch: (spec) => view.dispatch(spec),
			readClipboardText: () => {
				const clipboard = doc.defaultView?.navigator.clipboard;
				if (!clipboard?.readText) {
					return Promise.reject(new Error("Clipboard access unavailable."));
				}
				return clipboard.readText();
			},
			policy: () => {
				const sourceNow = this.markdownView(view);
				const general = this.tm.settings.general;
				const frontmatter = sourceNow?.file
					? this.tm.plugin.app.metadataCache.getFileCache(sourceNow.file)?.frontmatter
					: undefined;
				return {
					enabled:
						this.tm.settings.toolbar.enabled &&
						general.isPluginActivated &&
						general.enabledPlatforms !== "mobile" &&
						!Platform.isMobile &&
						frontmatter?.unisastra !== false,
					current:
						!this.disposed &&
						this.active.get(doc) === view &&
						view.dom.isConnected &&
						view.state.facet(EditorView.editable) &&
						sourceNow !== null &&
						sourceNow.getMode() === "source" &&
						sourceNow.file?.path === path,
					hemingway: this.tm.settings.hemingwayMode.isHemingwayModeEnabled,
					smartUrl: this.tm.settings.toolbar.smartUrl,
					visible: getVisibleRange(view.state),
				};
			},
		};
	}
	execute(doc: Document, action: ToolbarAction): void {
		const view = this.active.get(doc);
		if (!view) {
			return;
		}
		Promise.resolve(executeToolbarAction(this.target(view), action))
			.then((issue) => {
				if (issue) {
					new Notice(issue);
				} else {
					view.focus();
				}
				this.schedule(doc);
			})
			.catch((error: unknown) => {
				console.error("Unisastra: toolbar action failed.", error);
			});
	}
	refresh(): void {
		if (this.disposed) {
			return;
		}
		this.syncSession();
		for (const doc of new Set([...this.active.keys(), ...this.surfaces.keys()])) {
			if (this.tm.settings.toolbar.enabled) {
				this.reportDockEvent(doc, "reveal");
			} else {
				const frame = this.frames.get(doc);
				if (frame !== undefined) {
					doc.defaultView?.cancelAnimationFrame(frame);
					this.frames.delete(doc);
				}
				this.schedule(doc);
			}
		}
	}
	private schedule(doc: Document): void {
		const win = doc.defaultView;
		if (this.disposed || !win || this.frames.has(doc)) {
			return;
		}
		if (!this.tm.settings.toolbar.enabled) {
			this.surfaces.get(doc)?.destroy();
			this.surfaces.delete(doc);
			this.updateStatusBarHud(doc, false);
			return;
		}
		const frame = win.requestAnimationFrame(() => {
			this.frames.delete(doc);
			this.render(doc);
		});
		this.frames.set(doc, frame);
	}
	private render(doc: Document): void {
		const view = this.active.get(doc);
		const target = view && this.tm.settings.toolbar.enabled ? this.target(view).policy() : null;
		if (!(target?.enabled && target.current && this.factory)) {
			this.surfaces.get(doc)?.destroy();
			this.surfaces.delete(doc);
			this.dockVisible.delete(doc);
			this.updateStatusBarHud(doc, false);
			return;
		}
		let surface = this.surfaces.get(doc);
		if (!surface) {
			surface = this.factory(
				doc,
				(action) => this.execute(doc, action),
				(event) => this.reportDockEvent(doc, event),
				() => this.resetSession(),
				() => this.tm.openCalloutManager(),
				() => this.togglePin(),
				(newOrder) => this.reorderButtons(newOrder),
			);
			this.surfaces.set(doc, surface);
		}
		const toolbar = this.tm.settings.toolbar;
		const calloutOptions = calloutMenuOptions(this.tm.settings.callouts);
		surface.update(
			view ?? null,
			toolbar,
			this.dockVisible.get(doc) ?? true,
			{
				sessionMs: this.getSessionElapsedMs(),
				fileMs: this.getFileElapsedMs(doc),
			},
			calloutOptions,
		);
		this.updateStatusBarHud(doc, true);
	}
	private isMainWindowDocument(doc: Document): boolean {
		return this.tm.plugin.app.workspace.containerEl.ownerDocument === doc;
	}
	private ensureStatusBarEl(): HTMLElement {
		if (!this.statusBarEl) {
			this.statusBarEl = this.tm.plugin.addStatusBarItem();
			this.statusBarEl.addClass("unisastra-floaty-toolbar-status-bar-hud");
		}
		return this.statusBarEl;
	}
	private updateStatusBarHud(doc: Document, shouldShow: boolean): void {
		if (!this.isMainWindowDocument(doc)) {
			return;
		}
		if (!shouldShow) {
			this.statusBarEl?.hide();
			return;
		}
		const segments = hudSegments(
			this.tm.settings.toolbar.timers,
			this.getSessionElapsedMs(),
			this.getFileElapsedMs(doc),
		);
		if (segments.length === 0) {
			this.statusBarEl?.hide();
			return;
		}
		const el = this.ensureStatusBarEl();
		const signature = JSON.stringify(segments);
		if (signature === this.hudSignature) {
			el.show();
			return;
		}
		this.hudSignature = signature;
		const ownerDoc = el.ownerDocument;
		el.replaceChildren();
		for (const [index, segment] of segments.entries()) {
			if (index > 0) {
				el.appendChild(ownerDoc.createTextNode(" · "));
			}
			const span = ownerDoc.createElement("span");
			span.textContent = segment.label;
			span.title = segment.tooltip;
			if (segment.resettable) {
				span.classList.add("unisastra-floaty-toolbar-status-bar-hud-reset");
				span.setAttribute("role", "button");
				span.tabIndex = 0;
				span.addEventListener("click", (event) => {
					event.stopPropagation();
					this.resetSession();
				});
				span.addEventListener("keydown", (event) => {
					if (event.key === "Enter" || event.key === " ") {
						event.preventDefault();
						this.resetSession();
					}
				});
			}
			el.appendChild(span);
		}
		el.show();
	}
	private closeWindow(doc: Document): void {
		const frame = this.frames.get(doc);
		if (frame !== undefined) {
			doc.defaultView?.cancelAnimationFrame(frame);
		}
		this.frames.delete(doc);
		this.surfaces.get(doc)?.destroy();
		this.surfaces.delete(doc);
		this.dockVisible.delete(doc);
		this.fileElapsed.delete(doc);
		this.active.delete(doc);
		for (const view of this.editors) {
			if (view.dom.ownerDocument === doc) {
				this.editors.delete(view);
			}
		}
	}
	destroy(): void {
		this.disposed = true;
		for (const doc of new Set([...this.frames.keys(), ...this.surfaces.keys()])) {
			this.closeWindow(doc);
		}
		this.editors.clear();
		this.active.clear();
		this.fileElapsed.clear();
		this.dockVisible.clear();
		this.session = STOPPED_ELAPSED;
		this.stopTick();
		this.statusBarEl?.remove();
		this.statusBarEl = null;
	}
}
