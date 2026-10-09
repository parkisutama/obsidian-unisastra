import { setIcon } from "obsidian";
import type { ToolbarAction } from "@/capabilities/features/toolbar/actions";
import { detectHeadingLevel } from "@/capabilities/features/toolbar/actions";
import type {
	SurfaceFactory,
	ToolbarCalloutOption,
	ToolbarSurface,
} from "@/capabilities/features/toolbar/controller";
import type { ToolbarItemId } from "@/capabilities/features/toolbar/settings";
import { LongPressReorder } from "./reorder";

const TOOLBAR_BUTTONS: ReadonlyArray<{
	action: ToolbarAction;
	icon: string;
	id: ToolbarItemId;
	title: string;
}> = [
	{ id: "bold", action: { kind: "bold" }, icon: "bold", title: "Bold" },
	{ id: "italic", action: { kind: "italic" }, icon: "italic", title: "Italic" },
	{
		id: "strikethrough",
		action: { kind: "strikethrough" },
		icon: "strikethrough",
		title: "Strikethrough",
	},
	{ id: "code", action: { kind: "code" }, icon: "code", title: "Code" },
	{
		id: "highlight",
		action: { kind: "highlight" },
		icon: "highlighter",
		title: "Highlight",
	},
	{
		id: "link",
		action: { kind: "link" },
		icon: "link",
		title: "Insert or remove link",
	},
];

const HEADING_OPTIONS: ReadonlyArray<{
	full: string;
	level: 0 | 1 | 2 | 3 | 4;
	short: string;
}> = [
	{ level: 0, short: "P", full: "Paragraph" },
	{ level: 1, short: "H1", full: "Heading 1" },
	{ level: 2, short: "H2", full: "Heading 2" },
	{ level: 3, short: "H3", full: "Heading 3" },
	{ level: 4, short: "H4", full: "Heading 4" },
];

const MARGIN_PX = 8;

const DOCK_CLASS = "unisastra-floaty-toolbar-dock";

export function dockBottomOffsetPx(statusBarHeight: number): number {
	return statusBarHeight > 0 ? statusBarHeight + MARGIN_PX : MARGIN_PX;
}

function createDivider(doc: Document): HTMLElement {
	const divider = doc.createElement("div");
	divider.className = "unisastra-floaty-toolbar-divider";
	return divider;
}

interface DropdownItem {
	label: string;
	onSelect: () => void;
}

function attachDropdown(
	doc: Document,
	trigger: HTMLElement,
	getItems: () => DropdownItem[],
	getMode: () => "dock" | "floating",
	isDisabled: () => boolean,
	shouldSuppressClick: () => boolean = () => false,
): { close: () => void } {
	let panel: HTMLElement | null = null;

	function close(): void {
		panel?.remove();
		panel = null;
		trigger.classList.remove("is-open");
		trigger.setAttribute("aria-expanded", "false");
	}

	function open(): void {
		close();
		const items = getItems();
		if (items.length === 0) {
			return;
		}
		const rect = trigger.getBoundingClientRect();
		panel = doc.createElement("div");
		panel.className = "unisastra-floaty-toolbar-dropdown-panel";
		panel.setAttribute("role", "listbox");
		for (const item of items) {
			const row = doc.createElement("div");
			row.className = "unisastra-floaty-toolbar-dropdown-item";
			row.setAttribute("role", "option");
			row.tabIndex = 0;
			row.textContent = item.label;
			const activate = () => {
				item.onSelect();
				close();
			};
			row.addEventListener("click", activate);
			row.addEventListener("keydown", (event) => {
				if (event.key === "Enter" || event.key === " ") {
					event.preventDefault();
					activate();
				}
			});
			panel.appendChild(row);
		}
		doc.body.appendChild(panel);
		const win = doc.defaultView;
		const panelRect = panel.getBoundingClientRect();
		const maxLeft = (win?.innerWidth ?? panelRect.right) - panelRect.width - MARGIN_PX;
		const left = Math.max(MARGIN_PX, Math.min(rect.left, maxLeft));
		panel.style.left = `${left}px`;
		panel.style.top =
			getMode() === "dock"
				? `${Math.max(MARGIN_PX, rect.top - panelRect.height - 4)}px`
				: `${rect.bottom + 4}px`;
		trigger.classList.add("is-open");
		trigger.setAttribute("aria-expanded", "true");
		const onOutside = (event: MouseEvent) => {
			if (panel && !panel.contains(event.target as Node) && event.target !== trigger) {
				close();
				doc.removeEventListener("mousedown", onOutside, true);
			}
		};
		doc.addEventListener("mousedown", onOutside, true);
	}

	trigger.setAttribute("role", "button");
	trigger.tabIndex = 0;
	trigger.setAttribute("aria-haspopup", "listbox");
	trigger.setAttribute("aria-expanded", "false");
	trigger.addEventListener("click", (event) => {
		event.preventDefault();
		if (shouldSuppressClick() || isDisabled()) {
			return;
		}
		if (panel) {
			close();
		} else {
			open();
		}
	});
	trigger.addEventListener("keydown", (event) => {
		if (isDisabled()) {
			return;
		}
		if (event.key === "Enter" || event.key === " ") {
			event.preventDefault();
			if (panel) {
				close();
			} else {
				open();
			}
		} else if (event.key === "Escape") {
			close();
		}
	});

	return { close };
}

export const createFloatyToolbarSurface: SurfaceFactory = (
	doc,
	execute,
	reportDockEvent,
	_resetSession,
	openCalloutManager,
	togglePin,
	reorderButtons,
): ToolbarSurface => {
	const win = doc.defaultView ?? window;
	const el = doc.createElement("div");
	el.className = "unisastra-floaty-toolbar";
	el.setAttribute("role", "toolbar");
	el.setAttribute("aria-label", "Formatting toolbar");
	el.hidden = true;
	el.addEventListener("mouseenter", () => reportDockEvent("reveal"));
	el.addEventListener("mouseleave", () => reportDockEvent("leave"));

	let currentMode: "dock" | "floating" = "floating";
	const itemEls = new Map<ToolbarItemId, HTMLElement>();
	let toolbarItemOrder: ToolbarItemId[] = TOOLBAR_BUTTONS.map((button) => button.id).concat([
		"heading",
		"callout",
	]);

	// Long-press-to-reorder: one gesture at a time for this window's toolbar.
	// See reorder.ts for why this is per-surface state rather than a module
	// singleton, and why entering the dragging phase always suppresses that
	// gesture's trailing click.
	let ghostEl: HTMLElement | null = null;
	let dragSourceEl: HTMLElement | null = null;
	function findDropTarget(x: number, y: number): ToolbarItemId | null {
		for (const [id, itemEl] of itemEls) {
			const r = itemEl.getBoundingClientRect();
			if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) {
				return id;
			}
		}
		return null;
	}
	function clearDropHighlight(): void {
		for (const itemEl of itemEls.values()) {
			itemEl.classList.remove("unisastra-floaty-toolbar-drop-target");
		}
	}
	function onDragMove(event: MouseEvent): void {
		if (!ghostEl) {
			return;
		}
		ghostEl.style.left = `${event.clientX - ghostEl.offsetWidth / 2}px`;
		ghostEl.style.top = `${event.clientY - ghostEl.offsetHeight / 2}px`;
		const target = findDropTarget(event.clientX, event.clientY);
		clearDropHighlight();
		if (target) {
			itemEls.get(target)?.classList.add("unisastra-floaty-toolbar-drop-target");
		}
	}
	function onDragMouseUp(event: MouseEvent): void {
		reorder.drop(findDropTarget(event.clientX, event.clientY));
	}
	const reorder = new LongPressReorder<ToolbarItemId>(() => toolbarItemOrder.slice(), {
		setTimeout: (fn, ms) => win.setTimeout(fn, ms),
		clearTimeout: (handle) => win.clearTimeout(handle),
		onDragStart: (itemId) => {
			const sourceEl = itemEls.get(itemId);
			if (!sourceEl) {
				return;
			}
			dragSourceEl = sourceEl;
			sourceEl.classList.add("unisastra-floaty-toolbar-drag-source");
			const rect = sourceEl.getBoundingClientRect();
			const ghost = doc.createElement("div");
			ghost.className = "unisastra-floaty-toolbar-drag-ghost";
			ghost.style.width = `${rect.width}px`;
			ghost.style.height = `${rect.height}px`;
			ghost.style.left = `${rect.left}px`;
			ghost.style.top = `${rect.top}px`;
			for (const child of Array.from(sourceEl.childNodes)) {
				ghost.appendChild(child.cloneNode(true));
			}
			doc.body.appendChild(ghost);
			ghostEl = ghost;
			doc.addEventListener("mousemove", onDragMove);
			doc.addEventListener("mouseup", onDragMouseUp, { once: true });
		},
		onDragEnd: () => {
			doc.removeEventListener("mousemove", onDragMove);
			doc.removeEventListener("mouseup", onDragMouseUp);
			dragSourceEl?.classList.remove("unisastra-floaty-toolbar-drag-source");
			dragSourceEl = null;
			ghostEl?.remove();
			ghostEl = null;
			clearDropHighlight();
		},
		onReorder: (newOrder) => reorderButtons(newOrder),
	});
	el.addEventListener("keydown", (event) => {
		if (event.key === "Escape") {
			reorder.cancel();
			reportDockEvent("leave");
		}
	});

	function attachLongPress(itemEl: HTMLElement, itemId: ToolbarItemId): void {
		itemEl.addEventListener("mousedown", (event) => {
			if (event.button !== 0) {
				return;
			}
			reorder.pressStart(itemId);
		});
		itemEl.addEventListener("mouseup", () => reorder.cancelPending());
		itemEl.addEventListener("mouseleave", () => reorder.cancelPending());
	}

	for (const { id, action, icon, title } of TOOLBAR_BUTTONS) {
		const button = doc.createElement("div");
		button.className = "unisastra-floaty-toolbar-button";
		button.setAttribute("role", "button");
		button.tabIndex = 0;
		setIcon(button, icon);
		button.title = title;
		button.setAttribute("aria-label", title);
		button.addEventListener("click", (event) => {
			event.preventDefault();
			if (reorder.consumeSuppressClick()) {
				return;
			}
			execute(action);
		});
		button.addEventListener("keydown", (event) => {
			if (event.key === "Enter" || event.key === " ") {
				event.preventDefault();
				execute(action);
			}
		});
		attachLongPress(button, id);
		itemEls.set(id, button);
	}

	const headingTrigger = doc.createElement("div");
	headingTrigger.className = "unisastra-floaty-toolbar-dropdown-trigger";
	headingTrigger.setAttribute("aria-label", "Heading level");
	const headingLabel = doc.createElement("span");
	headingLabel.textContent = "P";
	headingTrigger.appendChild(headingLabel);
	const headingChevron = doc.createElement("span");
	headingChevron.className = "unisastra-floaty-toolbar-chevron";
	setIcon(headingChevron, "chevron-down");
	headingTrigger.appendChild(headingChevron);
	let headingDisabled = false;
	const headingDropdown = attachDropdown(
		doc,
		headingTrigger,
		() =>
			HEADING_OPTIONS.map((option) => ({
				label: option.full,
				onSelect: () => execute({ kind: "heading", level: option.level }),
			})),
		() => currentMode,
		() => headingDisabled,
		() => reorder.consumeSuppressClick(),
	);
	attachLongPress(headingTrigger, "heading");
	itemEls.set("heading", headingTrigger);

	const calloutTrigger = doc.createElement("div");
	calloutTrigger.className =
		"unisastra-floaty-toolbar-dropdown-trigger unisastra-floaty-toolbar-callout-trigger";
	calloutTrigger.setAttribute("aria-label", "Insert callout");
	calloutTrigger.title = "Insert callout";
	const calloutIcon = doc.createElement("span");
	setIcon(calloutIcon, "quote");
	calloutTrigger.appendChild(calloutIcon);
	const calloutChevron = doc.createElement("span");
	calloutChevron.className = "unisastra-floaty-toolbar-chevron";
	setIcon(calloutChevron, "chevron-down");
	calloutTrigger.appendChild(calloutChevron);
	let latestCalloutOptions: readonly ToolbarCalloutOption[] = [];
	const calloutDropdown = attachDropdown(
		doc,
		calloutTrigger,
		() => [
			...latestCalloutOptions.map((option) => ({
				label: option.label,
				onSelect: () => execute({ kind: "callout", id: option.id }),
			})),
			{ label: "Manage callouts…", onSelect: () => openCalloutManager() },
		],
		() => currentMode,
		() => false,
		() => reorder.consumeSuppressClick(),
	);
	attachLongPress(calloutTrigger, "callout");
	itemEls.set("callout", calloutTrigger);

	const trailingDivider = createDivider(doc);

	const pinButton = doc.createElement("div");
	pinButton.className = "unisastra-floaty-toolbar-pin-btn";
	pinButton.setAttribute("role", "button");
	pinButton.tabIndex = 0;
	pinButton.title = "Pin toolbar as a dock";
	pinButton.setAttribute("aria-label", "Pin toolbar as a dock");
	setIcon(pinButton, "pin");
	pinButton.addEventListener("click", (event) => {
		event.preventDefault();
		togglePin();
	});
	pinButton.addEventListener("keydown", (event) => {
		if (event.key === "Enter" || event.key === " ") {
			event.preventDefault();
			togglePin();
		}
	});

	let lastOrderSignature = "";
	function applyOrder(order: readonly ToolbarItemId[]): void {
		const signature = order.join(",");
		if (signature === lastOrderSignature) {
			return;
		}
		lastOrderSignature = signature;
		for (const id of order) {
			const itemEl = itemEls.get(id);
			if (itemEl) {
				el.appendChild(itemEl);
			}
		}
		el.appendChild(trailingDivider);
		el.appendChild(pinButton);
	}
	applyOrder(toolbarItemOrder);

	doc.body.appendChild(el);

	return {
		destroy() {
			reorder.cancel();
			doc.removeEventListener("mousemove", onDragMove);
			doc.removeEventListener("mouseup", onDragMouseUp);
			ghostEl?.remove();
			ghostEl = null;
			headingDropdown.close();
			calloutDropdown.close();
			el.remove();
		},
		update(view, settings, dockVisible, _elapsed, calloutOptions) {
			currentMode = settings.mode;
			latestCalloutOptions = calloutOptions;
			toolbarItemOrder = settings.buttonOrder;
			applyOrder(settings.buttonOrder);
			pinButton.classList.toggle("is-pinned", settings.mode === "dock");
			if (view) {
				const line = view.state.doc.lineAt(view.state.selection.main.head);
				const level = detectHeadingLevel(line.text);
				headingDisabled = level === -1;
				headingTrigger.classList.toggle("is-disabled", headingDisabled);
				if (!headingDisabled) {
					const option = HEADING_OPTIONS.find((entry) => entry.level === level);
					headingLabel.textContent = option?.short ?? "P";
				}
			}
			if (settings.mode === "dock") {
				el.classList.add(DOCK_CLASS);
				el.style.removeProperty("top");
				el.style.removeProperty("left");
				const statusBarHeight =
					doc.querySelector(".status-bar")?.getBoundingClientRect().height ?? 0;
				el.style.bottom = `${dockBottomOffsetPx(statusBarHeight)}px`;
				if (!view) {
					headingDropdown.close();
					calloutDropdown.close();
				}
				el.hidden = !view;
				el.classList.toggle("unisastra-floaty-toolbar-dock-peek", !dockVisible);
				return;
			}
			el.classList.remove(DOCK_CLASS, "unisastra-floaty-toolbar-dock-peek");
			el.style.removeProperty("bottom");
			const range = view?.state.selection.main;
			const coords = range && !range.empty ? view?.coordsAtPos(range.head) : null;
			if (!coords) {
				headingDropdown.close();
				calloutDropdown.close();
				el.hidden = true;
				return;
			}
			el.hidden = false;
			el.style.top = `${Math.max(coords.top - el.offsetHeight - MARGIN_PX, MARGIN_PX)}px`;
			el.style.left = `${Math.max(coords.left - el.offsetWidth / 2, MARGIN_PX)}px`;
		},
	};
};
