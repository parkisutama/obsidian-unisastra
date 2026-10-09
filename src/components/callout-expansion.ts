// SPDX-License-Identifier: GPL-3.0-only
// Copyright (C) 2025-2026 Parkis Utama

import type { Component } from "obsidian";

export function bindCalloutExpansion(
	preview: HTMLElement,
	configuration: HTMLElement,
	label: string,
	component: Component,
): void {
	let expanded = false;
	configuration.hidden = true;
	preview.setAttribute("role", "button");
	preview.setAttribute("tabindex", "0");
	preview.setAttribute("aria-label", `Configure ${label}`);
	preview.setAttribute("aria-expanded", "false");
	const toggle = (event: Event): void => {
		const target = event.target as Element | null;
		if (target?.closest?.(".callout-content")) {
			return;
		}
		event.preventDefault();
		expanded = !expanded;
		configuration.hidden = !expanded;
		preview.classList.toggle("is-expanded", expanded);
		preview.setAttribute("aria-expanded", String(expanded));
	};
	const keydown = (event: KeyboardEvent): void => {
		if (event.key === "Enter" || event.key === " ") {
			toggle(event);
		}
	};
	preview.addEventListener("click", toggle);
	preview.addEventListener("keydown", keydown);
	component.register(() => {
		preview.removeEventListener("click", toggle);
		preview.removeEventListener("keydown", keydown);
	});
}
