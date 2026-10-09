// Long-press-to-reorder, adapted for Unisastra from Floaty Toolbar by 0png (MIT).
// https://github.com/0png/Floaty-Toolbar, src/drag.ts and src/toolbar.ts
// (attachLongPressDrag), and src/toolbar-types.ts (LONG_PRESS_MS,
// ToolbarItemId, DEFAULT_BUTTON_ORDER).
// Revision b2113d06e1870851963053cd0bab0a0a971bb920.
// Copyright (c) 2026 0png. Full notice: licenses/floaty-toolbar-MIT.txt.
//
// Differences from upstream, deliberate:
// - Upstream keeps drag state in a module-level `activeDrag` singleton and
//   executes the button's action on `mousedown` (so a long-press that turns
//   into a drag has already fired the formatting action before the timer
//   even starts). Here the state machine below is instantiated once per
//   toolbar surface (one per window; see toolbar.ts), so multiple windows
//   never share drag state, and reaching the "dragging" phase marks the
//   gesture's trailing click as suppressed — entering drag mode never also
//   executes formatting.
// - Adds explicit `cancel()` for Escape and for surface destroy (unload/
//   window close), which upstream's drag.ts does not handle at all.
// - Recomputes the target's index in the post-removal array instead of
//   reusing the pre-removal index, avoiding an off-by-one drift upstream has
//   when the dragged item's original index is before the drop target's.

export const LONG_PRESS_MS = 500;

/**
 * Moves `fromId` to sit immediately before `toId`, preserving every other
 * relative order. Returns `ids` unchanged (a new array, same order) if
 * either ID is missing or `fromId === toId`.
 */
export function reorderIds<T>(ids: readonly T[], fromId: T, toId: T): T[] {
	if (fromId === toId || !ids.includes(fromId) || !ids.includes(toId)) {
		return [...ids];
	}
	const next = ids.filter((id) => id !== fromId);
	const insertAt = next.indexOf(toId);
	next.splice(insertAt, 0, fromId);
	return next;
}

type ReorderPhase = "idle" | "pending" | "dragging";

export interface ReorderCallbacks<T> {
	clearTimeout: (handle: number) => void;
	/** Called when a drag ends, whether or not it dropped on a valid target. */
	onDragEnd: (itemId: T, dropTargetId: T | null) => void;
	/** Called once the long-press threshold elapses and dragging begins. */
	onDragStart: (itemId: T) => void;
	/** Called with the recomputed order after a successful drop. */
	onReorder: (newOrder: T[]) => void;
	setTimeout: (fn: () => void, ms: number) => number;
}

/**
 * Pure state machine for the long-press -> drag -> drop gesture. Holds no
 * DOM references itself — the caller (toolbar.ts) supplies the current
 * order, timer functions (fake-timer friendly), and does the actual ghost
 * element/highlight DOM work in its onDragStart/onDragEnd callbacks.
 */
export class LongPressReorder<T> {
	private phase: ReorderPhase = "idle";
	private timerHandle: number | null = null;
	private activeItemId: T | null = null;
	private justDragged = false;

	private readonly getOrder: () => readonly T[];
	private readonly callbacks: ReorderCallbacks<T>;

	constructor(getOrder: () => readonly T[], callbacks: ReorderCallbacks<T>) {
		this.getOrder = getOrder;
		this.callbacks = callbacks;
	}

	/** Call on mousedown/pointerdown on a reorderable item. */
	pressStart(itemId: T): void {
		if (this.phase !== "idle") {
			return;
		}
		this.phase = "pending";
		this.activeItemId = itemId;
		this.timerHandle = this.callbacks.setTimeout(() => {
			if (this.phase !== "pending") {
				return;
			}
			this.phase = "dragging";
			this.callbacks.onDragStart(itemId);
		}, LONG_PRESS_MS);
	}

	/**
	 * Call on mouseup/mouseleave that happens before the long-press threshold
	 * elapses. Cancels the pending timer without starting a drag or
	 * suppressing the click that follows.
	 */
	cancelPending(): void {
		if (this.phase !== "pending") {
			return;
		}
		if (this.timerHandle !== null) {
			this.callbacks.clearTimeout(this.timerHandle);
		}
		this.reset();
	}

	/**
	 * Call on mouseup while dragging. Returns true when a drag actually
	 * happened this gesture, so the caller knows to suppress the trailing
	 * click regardless of whether `dropTargetId` produced a reorder.
	 */
	drop(dropTargetId: T | null): boolean {
		if (this.phase !== "dragging" || this.activeItemId === null) {
			return false;
		}
		const itemId = this.activeItemId;
		this.callbacks.onDragEnd(itemId, dropTargetId);
		if (dropTargetId !== null && dropTargetId !== itemId) {
			this.callbacks.onReorder(reorderIds(this.getOrder(), itemId, dropTargetId));
		}
		this.justDragged = true;
		this.reset();
		return true;
	}

	/**
	 * Cancels a pending or in-flight gesture without reordering — Escape, or
	 * surface destroy (unload/window close). Idempotent when already idle.
	 */
	cancel(): void {
		if (this.phase === "dragging" && this.activeItemId !== null) {
			this.callbacks.onDragEnd(this.activeItemId, null);
		} else if (this.phase === "pending" && this.timerHandle !== null) {
			this.callbacks.clearTimeout(this.timerHandle);
		}
		this.reset();
	}

	isDragging(): boolean {
		return this.phase === "dragging";
	}

	/**
	 * Call from the item's click handler, before executing its action. Returns
	 * true (and clears the flag) exactly once per gesture that reached the
	 * dragging phase — the caller should skip executing the action in that
	 * case. A quick click that never reached the dragging phase always
	 * returns false, so normal formatting is unaffected.
	 */
	consumeSuppressClick(): boolean {
		if (!this.justDragged) {
			return false;
		}
		this.justDragged = false;
		return true;
	}

	private reset(): void {
		this.phase = "idle";
		this.timerHandle = null;
		this.activeItemId = null;
	}
}
