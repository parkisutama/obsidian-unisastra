// SPDX-License-Identifier: GPL-3.0-only
// Copyright (C) 2025-2026 Parkis Utama

// Run through Obsidian CLI eval. Exercises native methods on detached elements.
// No vault contents, live sidebar widths, or layout JSON are read or written.
(async () => {
	const native = window.app.workspace.leftSplit;
	const doc = native.containerEl.ownerDocument;
	const records = [];
	const workspaceEl = doc.createElement("div");
	Object.defineProperty(workspaceEl, "clientWidth", { value: 1000 });
	const el = doc.createElement("div");
	const handle = doc.createElement("hr");
	const calls = { saves: 0, resizes: 0 };
	const ribbon = {
		setCollapsedState() {
			/* Detached test ribbon. */
		},
	};
	const fake = {
		app: {
			disableCssTransition() {
				/* No live styles. */
			},
			enableCssTransition() {
				/* No live styles. */
			},
		},
		workspace: {
			containerEl: workspaceEl,
			layoutReady: true,
			leftRibbon: ribbon,
			rightRibbon: ribbon,
			requestSaveLayout() {
				calls.saves++;
			},
			requestResize() {
				calls.resizes++;
			},
			updateFrameless() {
				/* No live window changes. */
			},
		},
		containerEl: el,
		resizeHandleEl: handle,
		children: [{ containerEl: doc.createElement("div") }],
		size: 320,
		collapsed: false,
		side: "left",
		setSize: native.setSize,
		collapse: native.collapse,
		expand: native.expand,
	};
	const grabBefore = doc.body.classList.contains("is-grabbing");
	const target = new EventTarget();
	const settle = () => new Promise((resolve) => setTimeout(resolve, 220));
	try {
		native.onSidedockResizeStart.call(fake, { button: 0, win: target });
		for (const x of [100, 350, 900]) {
			target.dispatchEvent(new PointerEvent("pointermove", { clientX: x }));
			records.push({
				action: "drag",
				x,
				size: fake.size,
				collapsed: fake.collapsed,
			});
		}
		target.dispatchEvent(new PointerEvent("pointerup"));
		fake.collapse();
		records.push({
			action: "collapse-start",
			size: fake.size,
			collapsed: fake.collapsed,
			overflow: el.style.overflow,
		});
		await settle();
		records.push({
			action: "collapse-end",
			size: fake.size,
			collapsed: fake.collapsed,
			display: el.style.display,
			overflow: el.style.overflow,
		});
		fake.expand();
		records.push({
			action: "expand-start",
			size: fake.size,
			collapsed: fake.collapsed,
			overflow: el.style.overflow,
		});
		await settle();
		records.push({
			action: "expand-end",
			size: fake.size,
			collapsed: fake.collapsed,
			overflow: el.style.overflow,
		});
		native.onSidedockResizeStart.call(fake, { button: 0, win: target });
		target.dispatchEvent(new PointerEvent("pointermove", { clientX: 350 }));
		target.dispatchEvent(new PointerEvent("pointercancel"));
		target.dispatchEvent(new PointerEvent("pointermove", { clientX: 500 }));
		records.push({ action: "cancel-drag", size: fake.size });
		fake.collapse();
		fake.expand();
		await settle();
		records.push({
			action: "interrupted-animation",
			size: fake.size,
			collapsed: fake.collapsed,
			overflow: el.style.overflow,
		});
		return JSON.stringify({ records, calls, liveSidebarUntouched: true });
	} finally {
		target.dispatchEvent(new PointerEvent("pointercancel"));
		doc.body.classList.toggle("is-grabbing", grabBefore);
	}
})();
