// SPDX-License-Identifier: GPL-3.0-only
// Copyright (C) 2025-2026 Parkis Utama

import type { App } from "obsidian";
import { formatAnchor, getTargetFile, parseAnchor, resolveSlug } from "./resolver";

interface HoverLinkEvent {
	event: MouseEvent;
	hoverParent: Element;
	linktext: string;
	source: string;
	sourcePath: string;
	targetEl: Element | null;
}

export function rewriteHoverEvent(rawEvent: unknown, app: App, isEnabled: () => boolean): void {
	if (!(isEnabled() && isHoverLinkEvent(rawEvent))) {
		return;
	}

	const parsed = parseAnchor(rawEvent.linktext);
	if (!parsed) {
		return;
	}

	const file = getTargetFile(app, parsed.filePart, rawEvent.sourcePath);
	if (!file) {
		return;
	}

	const heading = resolveSlug(parsed.fragment, file, app);
	if (!heading) {
		return;
	}

	rawEvent.linktext = formatAnchor(parsed.filePart, heading);
}

export function registerHoverHandler(app: App, isEnabled: () => boolean): (event: unknown) => void {
	return (rawEvent: unknown) => rewriteHoverEvent(rawEvent, app, isEnabled);
}

function isHoverLinkEvent(value: unknown): value is HoverLinkEvent {
	if (typeof value !== "object" || value === null) {
		return false;
	}

	const obj = value as Record<string, unknown>;
	return typeof obj.linktext === "string" && typeof obj.sourcePath === "string";
}
