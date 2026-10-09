import { Setting } from "obsidian";
import { TOOLBAR_ITEM_LABELS, type ToolbarItemId } from "@/capabilities/features/toolbar/settings";
import type UnisastraCore from "@/lib";

/** Swaps `order[index]` with its neighbor at `index + delta`, in place. No-op past either end. */
export function moveToolbarItem(order: ToolbarItemId[], index: number, delta: number): void {
	const targetIndex = index + delta;
	if (targetIndex < 0 || targetIndex >= order.length) {
		return;
	}
	const [item] = order.splice(index, 1);
	order.splice(targetIndex, 0, item as ToolbarItemId);
}

function saveAndRerender(tm: UnisastraCore, rerender: () => void): void {
	tm.saveSettings()
		.catch((error) => {
			console.error("Failed to save settings:", error);
		})
		.finally(rerender);
}

/**
 * Reorder control for the toolbar's own buttons/dropdowns, shown in the
 * Toolbar settings tab. This is the settings-driven counterpart to
 * long-press dragging the same items directly on the toolbar
 * (floaty-toolbar/reorder.ts) — both mutate the same
 * `settings.toolbar.buttonOrder` array, so either one is reflected by the
 * other.
 */
export function renderToolbarButtonOrder(
	container: HTMLElement,
	tm: UnisastraCore,
	rerender: () => void,
): void {
	const order = tm.settings.toolbar.buttonOrder;
	container.createEl("p", {
		text: "Order of the buttons and dropdowns on the floating toolbar. You can also reorder them by long-pressing an item directly on the toolbar.",
	});
	for (const [index, id] of order.entries()) {
		new Setting(container)
			.setName(TOOLBAR_ITEM_LABELS[id])
			.addExtraButton((button) =>
				button
					.setIcon("arrow-up")
					.setTooltip("Move up")
					.setDisabled(index === 0)
					.onClick(() => {
						moveToolbarItem(order, index, -1);
						saveAndRerender(tm, rerender);
					}),
			)
			.addExtraButton((button) =>
				button
					.setIcon("arrow-down")
					.setTooltip("Move down")
					.setDisabled(index === order.length - 1)
					.onClick(() => {
						moveToolbarItem(order, index, 1);
						saveAndRerender(tm, rerender);
					}),
			);
	}
}
