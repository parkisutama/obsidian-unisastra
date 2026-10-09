// SPDX-License-Identifier: GPL-3.0-only
// Copyright (C) 2025-2026 Parkis Utama

import type { Extension } from "@codemirror/state";
import type { Plugin } from "obsidian";
import { registerHoverHandler, rewriteHoverEvent } from "./hover";
import { createLivePreviewPlugin } from "./live-preview";
import { registerNavigationHandlers, registerOpenLinkTextPatch } from "./navigation";
import { registerReadingModePostProcessor } from "./reading-mode";

export function createGFMAnchorLivePreviewExtension(
	plugin: Plugin,
	isEnabled: () => boolean,
): Extension {
	return createLivePreviewPlugin(plugin.app, isEnabled);
}

export function registerGFMAnchorCompatibility(plugin: Plugin, isEnabled: () => boolean): void {
	const app = plugin.app;

	plugin.registerMarkdownPostProcessor(registerReadingModePostProcessor(app, isEnabled));

	const removeNavigationHandlers = registerNavigationHandlers(app, isEnabled);
	plugin.register(removeNavigationHandlers);

	const restoreOpenLinkText = registerOpenLinkTextPatch(app, isEnabled);
	plugin.register(restoreOpenLinkText);

	const originalTrigger = app.workspace.trigger.bind(app.workspace);
	const workspaceWithTrigger = app.workspace as {
		trigger(name: string, ...args: unknown[]): unknown;
	};

	workspaceWithTrigger.trigger = (name: string, ...args: unknown[]) => {
		if (name === "hover-link" && args.length > 0) {
			rewriteHoverEvent(args[0], app, isEnabled);
		}

		return originalTrigger(name, ...args);
	};

	plugin.register(() => {
		workspaceWithTrigger.trigger = originalTrigger;
	});

	plugin.registerEvent(
		// @ts-expect-error hover-link exists at runtime but is not part of Obsidian's public EventRef union.
		app.workspace.on("hover-link", registerHoverHandler(app, isEnabled)),
	);
}
