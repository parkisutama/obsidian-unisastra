// SPDX-License-Identifier: GPL-3.0-only AND MIT
// Derived from Typewriter Mode (https://github.com/davisriedel/obsidian-typewriter-mode)
// Copyright (c) 2023-2026 Davis Riedel
// Modifications Copyright (C) 2025-2026 Parkis Utama

import { RangeSet, Transaction } from "@codemirror/state";
import { type Decoration, EditorView, ViewPlugin, type ViewUpdate } from "@codemirror/view";
import { ItemView, Platform } from "obsidian";
import { dispatchOutlinerUnfocus, isOutlinerFocused } from "@/cm6/outliner/utils";
import type { PerWindowProps } from "@/cm6/per-window-props";
import type { TypewriterPositionData } from "@/cm6/typewriter-offset-calculator";
import { TypewriterOffsetCalculator } from "@/cm6/typewriter-offset-calculator";
import type UnisastraCore from "@/lib";
import { getActiveSentenceDecos } from "./highlight-sentence";
import { getEditorDom, getScrollDom, getSizerDom } from "./selectors";

const currentLineClass = "unisastra-current-line";

// these elements are a workaround, because webkit does not allow
// ::before and ::after elements to have a different mix-blend-mode than their parent
const fadeBeforeClass = "unisastra-current-line-fade-before";
const fadeAfterClass = "unisastra-current-line-fade-after";

// Regex patterns for user event validation
const USER_EVENT_ALLOWED_DEFAULT = /^(select|input|delete|undo|redo)(\..+)?$/;
const USER_EVENT_DISALLOWED_DEFAULT = /^(select.pointer)$/;
const USER_EVENT_ALLOWED_COMMANDS_ONLY = /^(input|delete|undo|redo)(\..+)?$/;
const USER_EVENT_DISALLOWED_COMMANDS_ONLY = /^(select)(\..+)?$/;
const frontmatterDisableKey = "unisastra";

class UnisastraCM6Plugin {
	protected tm: UnisastraCore;
	protected view: EditorView;

	private domResizeObserver: ResizeObserver | null = null;
	private embedObserver: MutationObserver | null = null;
	private readonly frames = new Set<number>();
	private disposed = false;

	private get ownerWindow() {
		return this.view.dom.ownerDocument.defaultView ?? window;
	}

	private scheduleFrame(callback: () => void) {
		if (this.disposed) {
			return;
		}
		const frame = this.ownerWindow.requestAnimationFrame(() => {
			this.frames.delete(frame);
			if (!this.disposed) {
				callback();
			}
		});
		this.frames.add(frame);
	}

	private readonly onScrollEventKey: "wheel" | "touchmove";
	private isListeningToOnScroll = false;
	private isOnScrollClassSet = false;

	private isInitialInteraction = true;
	private isRenderingAllowedUserEvent = false;
	decorations: RangeSet<Decoration> = RangeSet.empty;

	private isPerWindowPropsReloadRequired = false;

	private readonly moveByCommandBound = this.moveByCommand.bind(this);
	private readonly onScrollBound = this.onScroll.bind(this);
	private readonly onResizeBound = this.onResize.bind(this);

	constructor(tm: UnisastraCore, view: EditorView) {
		this.tm = tm;
		this.view = view;

		this.onScrollEventKey = Platform.isMobile ? "touchmove" : "wheel";

		this.onLoad();
	}

	destroy() {
		this.disposed = true;
		this.embedObserver?.disconnect();
		this.embedObserver = null;
		for (const frame of this.frames) {
			this.ownerWindow.cancelAnimationFrame(frame);
		}
		this.frames.clear();
		this.domResizeObserver?.disconnect();

		this.destroyCurrentLine();

		this.removeScrollListener();

		window.removeEventListener("moveByCommand", this.moveByCommandBound);
	}

	protected onLoad() {
		this.domResizeObserver = new ResizeObserver(this.onResizeBound);
		this.domResizeObserver.observe(this.view.dom.ownerDocument.body);

		window.addEventListener("moveByCommand", this.moveByCommandBound);

		this.watchEmbeddedMarkdown();
		this.onReconfigured();

		this.scheduleFrame(() => {
			this.restoreCursorPosition(this.view);
		});
	}

	private userEventAllowed(event: string) {
		let allowed = USER_EVENT_ALLOWED_DEFAULT;
		let disallowed = USER_EVENT_DISALLOWED_DEFAULT;

		if (this.tm.settings.typewriter.isTypewriterOnlyUseCommandsEnabled) {
			allowed = USER_EVENT_ALLOWED_COMMANDS_ONLY;
			disallowed = USER_EVENT_DISALLOWED_COMMANDS_ONLY;
		}

		return allowed.test(event) && !disallowed.test(event);
	}

	private inspectTransactions(update: ViewUpdate) {
		const userEvents: string[] = [];
		let isReconfigured = false;
		for (const tr of update.transactions) {
			if (tr.reconfigured) {
				isReconfigured = true;
			}

			const event = tr.annotation(Transaction.userEvent);
			if (event !== undefined) {
				userEvents.push(event);
			}
		}

		if (userEvents.length === 0) {
			return {
				isReconfigured,
				isUserEvent: false,
				allowedUserEvents: null,
			};
		}

		const allowedUserEvents = userEvents.reduce<boolean>((result, event) => {
			return result && this.userEventAllowed(event);
		}, userEvents.length > 0);
		return {
			isReconfigured: false,
			isUserEvent: true,
			allowedUserEvents,
		};
	}

	update(update: ViewUpdate) {
		const { isReconfigured, isUserEvent, allowedUserEvents } = this.inspectTransactions(update);

		if (this.isTableCell()) {
			return;
		}

		if (isReconfigured) {
			this.onReconfigured();
		}

		if (this.isDisabled()) {
			return;
		}

		if (!isUserEvent) {
			this.updateNonUserEvent();
			return;
		}

		allowedUserEvents ? this.updateAllowedUserEvent() : this.updateDisallowedUserEvent();
	}

	private isTableCell() {
		return (
			this.view.dom.parentElement?.parentElement?.className.contains("table-cell-wrapper") ?? false
		);
	}

	private isMarkdownFile() {
		const view = this.tm.plugin.app.workspace.getActiveViewOfType(ItemView);
		if (!view) {
			// We currently do not have an active view. After a new view gets active, the per window props must be reloaded.
			this.isPerWindowPropsReloadRequired = true;
			return false;
		}
		return view.getViewType() === "markdown";
	}

	private isDisabledInFrontmatter() {
		const file = this.tm.plugin.app.workspace.getActiveFile();
		if (!file) {
			// We currently do not have an active file. After a new file gets active, the per window props must be reloaded.
			this.isPerWindowPropsReloadRequired = true;
			return false;
		}

		const frontmatter = this.tm.plugin.app.metadataCache.getFileCache(file)?.frontmatter;
		if (!frontmatter) {
			return false;
		}

		if (!Object.hasOwn(frontmatter, frontmatterDisableKey)) {
			return false;
		}

		return !frontmatter[frontmatterDisableKey];
	}

	private isDisabledByPlatform() {
		const { enabledPlatforms } = this.tm.settings.general;
		return (
			(enabledPlatforms === "desktop" && Platform.isMobile) ||
			(enabledPlatforms === "mobile" && Platform.isDesktop)
		);
	}

	private isDisabled() {
		if (!this.tm.settings.general.isPluginActivated) {
			return true;
		}
		if (this.isDisabledByPlatform()) {
			return true;
		}
		if (!this.isMarkdownFile()) {
			return true;
		}
		if (this.isDisabledInFrontmatter()) {
			return true;
		}
	}

	private onReconfigured(): void {
		this.isPerWindowPropsReloadRequired = true;

		if (this.isDisabled()) {
			this.destroyCurrentLine();
			this.resetPadding(this.view);
			// Unfocus outliner if currently focused — decorations persist on the StateField
			// and are not cleared by disabling the ViewPlugin
			if (isOutlinerFocused(this.view.state)) {
				dispatchOutlinerUnfocus(this.view);
			}
			this.loadPerWindowProps();
		} else {
			this.updateAfterExternalEvent();
		}
	}

	private watchEmbeddedMarkdown() {
		const selector = ".markdown-embed-content iframe.embed-iframe";
		const props = this.tm.perWindowProps;
		const observer = new MutationObserver((mutations) => {
			if (this.disposed) {
				return;
			}
			mutations.forEach((mutation) => {
				[].forEach.call(mutation.addedNodes, (node: Node) => {
					if (node.nodeType === Node.ELEMENT_NODE && (node as HTMLElement).matches(selector)) {
						const body = (node as HTMLIFrameElement).contentDocument?.body;
						if (!body) {
							return;
						}
						this.loadPerWindowPropsOnElement(props, body);
					}
				});
			});
		});
		this.embedObserver = observer;
		observer.observe(this.view.dom.ownerDocument, {
			childList: true,
			subtree: true,
		});
	}

	private loadPerWindowPropsOnElement(props: PerWindowProps, el: HTMLElement) {
		// remove all classes set by this plugin
		for (const c of props.allBodyClasses) {
			el.classList.remove(c);
		}

		el.addClasses(props.persistentBodyClasses);
		if (!this.isDisabled()) {
			el.addClasses(props.bodyClasses);
		}

		el.setCssProps(props.cssVariables);
		el.setAttrs(props.bodyAttrs);
	}

	private getMarkdownBodies() {
		const embeddedMarkdownContent = this.view.dom.ownerDocument.querySelectorAll(
			".markdown-embed-content iframe.embed-iframe",
		);
		const embeddedMarkdownBodies: HTMLElement[] = Array.from(embeddedMarkdownContent).flatMap(
			(i) => {
				const body = (i as HTMLIFrameElement).contentDocument?.body;
				return body ? [body] : [];
			},
		);
		return [this.view.dom.ownerDocument.body, ...embeddedMarkdownBodies];
	}

	private loadPerWindowProps() {
		if (!this.isPerWindowPropsReloadRequired) {
			return;
		}
		this.isPerWindowPropsReloadRequired = false;

		const bodies = this.getMarkdownBodies();
		for (const b of bodies) {
			this.loadPerWindowPropsOnElement(this.tm.perWindowProps, b);
		}
	}

	private loadCurrentLine(view: EditorView = this.view) {
		const editorDom = getEditorDom(view);
		if (!editorDom) {
			return null;
		}

		let currentLine = editorDom.querySelector(`.${currentLineClass}`) as HTMLElement;

		if (!currentLine) {
			currentLine = editorDom.ownerDocument.createElement("div");
			currentLine.className = currentLineClass;
			editorDom.appendChild(currentLine);
		}

		if (this.tm.settings.currentLine.isFadeLinesEnabled) {
			let fadeBefore = editorDom.querySelector(`.${fadeBeforeClass}`) as HTMLElement;
			let fadeAfter = editorDom.querySelector(`.${fadeAfterClass}`) as HTMLElement;

			if (!fadeBefore) {
				fadeBefore = editorDom.ownerDocument.createElement("div");
				fadeBefore.className = fadeBeforeClass;
				editorDom.appendChild(fadeBefore);
			}

			if (!fadeAfter) {
				fadeAfter = editorDom.ownerDocument.createElement("div");
				fadeAfter.className = fadeAfterClass;
				editorDom.appendChild(fadeAfter);
			}

			return { currentLine, fadeBefore, fadeAfter };
		}

		return { currentLine };
	}

	private destroyCurrentLine(view: EditorView = this.view) {
		const editorDom = getEditorDom(view);
		if (!editorDom) {
			return;
		}

		const currentLine = editorDom.querySelector(`.${currentLineClass}`) as HTMLElement;
		const fadeBefore = editorDom.querySelector(`.${fadeBeforeClass}`) as HTMLElement;
		const fadeAfter = editorDom.querySelector(`.${fadeAfterClass}`) as HTMLElement;

		currentLine?.remove();
		fadeBefore?.remove();
		fadeAfter?.remove();
	}

	private setupScrollListener() {
		if (this.isListeningToOnScroll) {
			return;
		}
		const scrollDom = getScrollDom(this.view);
		if (scrollDom) {
			scrollDom.addEventListener(this.onScrollEventKey, this.onScrollBound, {
				passive: true,
			});
			this.isListeningToOnScroll = true;
		}
	}

	private removeScrollListener() {
		if (!this.isListeningToOnScroll) {
			return;
		}
		const scrollDom = getScrollDom(this.view);
		if (scrollDom) {
			scrollDom.removeEventListener(this.onScrollEventKey, this.onScrollBound);
			this.isListeningToOnScroll = false;
		}
	}

	private measureTypewriterPosition(
		key: string,
		write: (measure: TypewriterPositionData, view: EditorView) => void,
	) {
		this.view.requestMeasure({
			key,
			read: (view: EditorView) =>
				this.disposed
					? null
					: new TypewriterOffsetCalculator(this.tm, view).getTypewriterPositionData(),
			write: (measure, view) => {
				if (!measure) {
					return;
				}
				this.scheduleFrame(() => {
					write(measure, view);
				});
			},
		});
	}

	private updateAllowedUserEvent() {
		this.removeScrollListener();
		this.applyDecorations();

		const editorDom = getEditorDom(this.view);
		if (editorDom) {
			editorDom.classList.remove("unisastra-scroll");
			this.isOnScrollClassSet = false;

			editorDom.classList.remove("unisastra-select");

			if (this.isInitialInteraction) {
				editorDom.classList.remove("unisastra-first-open");
				this.isInitialInteraction = false;
			}
		}

		this.isRenderingAllowedUserEvent = true;

		this.measureTypewriterPosition("UnisastraUpdateAfterAllowedUserEvent", (measure, view) => {
			if (!measure) {
				return;
			}
			this.recenterAndMoveCurrentLine(view, measure);
			this.isRenderingAllowedUserEvent = false;
			this.handleCursorStateUpdate(view);
			this.setupScrollListener();
		});
	}

	private updateDisallowedUserEvent() {
		if (this.isRenderingAllowedUserEvent) {
			return;
		}

		const editorDom = getEditorDom(this.view);

		if (editorDom) {
			if (this.isInitialInteraction) {
				editorDom.classList.remove("unisastra-first-open");
				this.isInitialInteraction = false;
			}

			editorDom.classList.add("unisastra-select");
		}

		this.measureTypewriterPosition("UnisastraUpdateAfterDisallowedUserEvent", (measure, view) => {
			if (!measure) {
				return;
			}
			this.handleCursorStateUpdate(view);

			const { activeLineOffset, lineHeight, lineOffset } = measure;
			if (
				this.tm.settings.currentLine.isHighlightCurrentLineEnabled ||
				this.tm.settings.currentLine.isFadeLinesEnabled
			) {
				this.moveCurrentLine(view, activeLineOffset, lineOffset, lineHeight);
			}
		});
	}

	private updateNonUserEvent() {
		this.applyDecorations();

		if (!this.isInitialInteraction) {
			return;
		}

		if (this.tm.settings.general.isOnlyActivateAfterFirstInteractionEnabled) {
			const editorDom = getEditorDom(this.view);
			if (editorDom) {
				editorDom.classList.add("unisastra-first-open");
			}
		}
	}

	private moveByCommand() {
		const editorDom = getEditorDom(this.view);
		if (editorDom) {
			editorDom.classList.remove("unisastra-select");
		}
		this.updateAllowedUserEvent();
	}

	private onResize() {
		if (this.isDisabled()) {
			return;
		}
		this.updateAfterExternalEvent();
	}

	private onScroll() {
		this.measureTypewriterPosition("UnisastraOnScroll", (measure, view) => {
			// This is placed here to debounce DOM manipulation
			if (!this.isOnScrollClassSet) {
				const editorDom = getEditorDom(this.view);
				if (editorDom) {
					editorDom.classList.add("unisastra-scroll");
					this.isOnScrollClassSet = true;
				}
			}

			if (!measure) {
				return;
			}
			const { activeLineOffset, lineOffset, lineHeight } = measure;
			this.moveCurrentLine(view, activeLineOffset, lineOffset, lineHeight);
		});
	}

	private applyDecorations() {
		if (
			!this.tm.settings.dimming.isDimUnfocusedEnabled ||
			this.tm.settings.dimming.dimUnfocusedMode !== "sentences"
		) {
			return;
		}

		this.decorations = getActiveSentenceDecos(this.view, {
			sentenceDelimiters: ".!?",
			extraCharacters: "*”’",
			ignoredPatterns: "Mr.",
		});
	}

	private updateAfterExternalEvent() {
		if (this.isTableCell()) {
			this.destroyCurrentLine();
			return;
		}

		this.loadPerWindowProps();
		this.applyDecorations();

		this.measureTypewriterPosition("UnisastraUpdateAfterExternalEvent", (measure, view) => {
			this.setupScrollListener();

			if (!measure) {
				return;
			}

			if (this.tm.settings.typewriter.isTypewriterScrollEnabled) {
				this.setPadding(view, measure.typewriterOffset);
			}

			this.recenterAndMoveCurrentLine(view, measure);
		});
	}

	private moveCurrentLine(
		view: EditorView,
		offset: number,
		lineOffset: number,
		lineHeight: number,
	) {
		const result = this.loadCurrentLine(view);
		if (!result) {
			return;
		}

		result.currentLine.style.height = `${lineHeight}px`;
		result.currentLine.style.top = `${offset - lineOffset}px`;

		// this is a workaround, because fadeBefore.style.bottom does not work somehow...
		if (result.fadeBefore) {
			result.fadeBefore.style.top = `calc(${offset - lineOffset}px - 100vh)`;
		}
		if (result.fadeAfter) {
			result.fadeAfter.style.top = `${offset - lineOffset + lineHeight}px`;
		}
	}

	private setPadding(view: EditorView, offset: number) {
		const sizerDom = getSizerDom(view);
		if (!sizerDom) {
			return;
		}

		sizerDom.style.padding = this.tm.settings.typewriter
			.isOnlyMaintainTypewriterOffsetWhenReachedEnabled
			? `0 0 ${offset}px 0`
			: `${offset}px 0`;
	}

	private resetPadding(view: EditorView) {
		if (!this.isMarkdownFile()) {
			return;
		}
		const sizerDom = getSizerDom(view);
		if (!sizerDom) {
			return;
		}
		sizerDom.style.removeProperty("padding");
	}

	private recenter(view: EditorView, offset: number) {
		const head = view.state.selection.main.head;
		const effect = EditorView.scrollIntoView(head, {
			y: "start",
			yMargin: offset,
		});
		const transaction = view.state.update({ effects: effect });
		view.dispatch(transaction);
	}

	private recenterAndMoveCurrentLine(
		view: EditorView,
		{ scrollOffset, lineOffset, lineHeight }: TypewriterPositionData,
	) {
		const isTypewriterScrollEnabled = this.tm.settings.typewriter.isTypewriterScrollEnabled;
		const isKeepLinesAboveAndBelowEnabled =
			this.tm.settings.keepLinesAboveAndBelow.isKeepLinesAboveAndBelowEnabled;
		const isHighlightCurrentLineEnabled =
			this.tm.settings.currentLine.isHighlightCurrentLineEnabled;
		const isFadeLinesEnabled = this.tm.settings.currentLine.isFadeLinesEnabled;

		if (isTypewriterScrollEnabled || isKeepLinesAboveAndBelowEnabled) {
			this.recenter(view, scrollOffset);
		}
		if (isHighlightCurrentLineEnabled || isFadeLinesEnabled) {
			this.moveCurrentLine(view, scrollOffset, lineOffset, lineHeight);
		}
	}

	private handleCursorStateUpdate(view: EditorView) {
		if (!this.tm.settings.restoreCursorPosition.isRestoreCursorPositionEnabled) {
			return;
		}

		this.tm.getRestoreCursorPositionFeature().setCursorState(view.state.selection.main, view);
	}

	private restoreCursorPosition(view: EditorView) {
		if (!this.tm.settings.restoreCursorPosition.isRestoreCursorPositionEnabled) {
			return;
		}

		const rcp = this.tm.getRestoreCursorPositionFeature();

		// Persite the previous state everytime a new file is opened
		rcp.saveState(); // NOTE: async function is intentionally not awaited

		const fileName = rcp.getFilePathForEditorView(view);

		if (fileName) {
			const st = rcp.state[fileName];
			if (st) {
				// Don't scroll when a link scrolls and highlights text
				// i.e. if file is open by links like [link](note.md#header) and wikilinks
				// See https://github.com/dy-sh/obsidian-remember-cursor-position issues #10, #32, #46, #51
				const containsFlashingSpan =
					this.tm.plugin.app.workspace.containerEl.querySelector("span.is-flashing");

				if (!containsFlashingSpan) {
					const clampedSelection = rcp.createClampedSelection(st, view.state.doc.length);
					view.dispatch({ selection: clampedSelection });
				}
			}
		}
	}
}

export default function createUnisastraViewPlugin(tm: UnisastraCore) {
	return ViewPlugin.define(
		(view: EditorView) => {
			return new UnisastraCM6Plugin(tm, view);
		},
		{ decorations: (v) => v.decorations },
	);
}
