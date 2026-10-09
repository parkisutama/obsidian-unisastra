// SPDX-License-Identifier: GPL-3.0-only
// Copyright (C) 2025-2026 Parkis Utama

import { ViewPlugin } from "@codemirror/view";
import type { ToolbarController } from "@/capabilities/features/toolbar/controller";

export function createToolbarSelectionExtension(controller: ToolbarController) {
	return ViewPlugin.define((view) => {
		controller.attach(view);
		return {
			update: (update) => {
				if (update.docChanged) {
					controller.notifyTyping(view);
				}
				if (
					update.selectionSet ||
					update.docChanged ||
					update.focusChanged ||
					update.viewportChanged
				) {
					controller.changed(view);
				}
			},
			destroy: () => controller.detach(view),
		};
	});
}
