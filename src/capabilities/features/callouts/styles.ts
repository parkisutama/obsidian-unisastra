// SPDX-License-Identifier: GPL-3.0-only
// Copyright (C) 2025-2026 Parkis Utama

import { getIcon } from "obsidian";
import { type CalloutEntrySettings, type CalloutStyling, CUSTOM_ID_PATTERN } from "./settings";

const HEX_COLOR = /^#(?:[\da-f]{3}|[\da-f]{6})$/i;
const LUCIDE_ICON = /^lucide-[a-z0-9]+(?:-[a-z0-9]+)*$/;
type IconResolver = (id: string) => string | null;

function resolveLucideIcon(id: string): string | null {
	return getIcon(id)?.outerHTML ?? null;
}

export function validateCalloutOverride(
	colorInput: string,
	iconInput: string,
	resolveIcon: IconResolver = resolveLucideIcon,
): CalloutStyling | null {
	const color = colorInput.trim() || null;
	const icon = iconInput.trim() || null;
	if (
		(color && !HEX_COLOR.test(color)) ||
		(icon && !(LUCIDE_ICON.test(icon) && resolveIcon(icon)))
	) {
		return null;
	}
	return { mode: "override", color, icon };
}

export function calloutStyleProperties(
	styling: CalloutStyling,
	resolveIcon: IconResolver = resolveLucideIcon,
): Record<string, string> {
	const declarations: Record<string, string> = {};
	if (styling.mode !== "override") {
		return declarations;
	}
	const { color, icon } = styling;
	if (color && HEX_COLOR.test(color)) {
		const hex =
			color.length === 4
				? [...color.slice(1)].map((digit) => digit + digit).join("")
				: color.slice(1);
		const rgb = [0, 2, 4].map((offset) => Number.parseInt(hex.slice(offset, offset + 2), 16));
		declarations["--callout-color"] = rgb.join(",");
	}
	if (icon && LUCIDE_ICON.test(icon)) {
		const svg = resolveIcon(icon);
		if (svg) {
			declarations["--callout-icon"] = icon;
		}
	}
	return declarations;
}

export function calloutCss(
	entries: readonly CalloutEntrySettings[],
	resolveIcon: IconResolver = resolveLucideIcon,
): string {
	const rules: string[] = [];
	for (const entry of entries) {
		if (!CUSTOM_ID_PATTERN.test(entry.id)) {
			continue;
		}
		const declarations = Object.entries(calloutStyleProperties(entry.styling, resolveIcon))
			.map(([key, value]) => `${key}:${value};`)
			.join("");
		if (declarations) {
			rules.push(`.callout[data-callout="${entry.id}"]{${declarations}}`);
		}
	}
	return rules.join("\n");
}

/** Owns only plugin style nodes; never modifies theme, snippet or note files. */
export class CalloutStyles {
	private readonly documents = new Map<Document, HTMLStyleElement | null>();
	private css = "";
	private disposed = false;
	private readonly resolveIcon: IconResolver;

	constructor(resolveIcon: IconResolver = resolveLucideIcon) {
		this.resolveIcon = resolveIcon;
	}

	open(doc: Document): void {
		if (this.disposed || this.documents.has(doc)) {
			return;
		}
		this.documents.set(doc, null);
		this.render(doc);
	}

	update(entries: readonly CalloutEntrySettings[]): boolean {
		if (this.disposed) {
			return false;
		}
		const css = calloutCss(entries, this.resolveIcon);
		if (css === this.css) {
			return false;
		}
		this.css = css;
		for (const doc of this.documents.keys()) {
			this.render(doc);
		}
		return true;
	}

	private render(doc: Document): void {
		let node = this.documents.get(doc);
		if (!this.css) {
			node?.remove();
			this.documents.set(doc, null);
			return;
		}
		if (!node) {
			node = doc.createElement("style");
			doc.head.appendChild(node);
			this.documents.set(doc, node);
		}
		node.textContent = this.css;
	}

	close(doc: Document): void {
		this.documents.get(doc)?.remove();
		this.documents.delete(doc);
	}

	destroy(): void {
		this.disposed = true;
		for (const doc of this.documents.keys()) {
			this.close(doc);
		}
	}
}
