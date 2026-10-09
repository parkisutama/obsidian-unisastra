// SPDX-License-Identifier: GPL-3.0-only AND MIT
// Derived from Typewriter Mode (https://github.com/davisriedel/obsidian-typewriter-mode)
// Copyright (c) 2023-2026 Davis Riedel
// Modifications Copyright (C) 2025-2026 Parkis Utama

// Show-whitespace concept inspired by deathau's cm-show-whitespace-obsidian
// (https://github.com/deathau/cm-show-whitespace-obsidian). No code ported;
// this uses CodeMirror 6's own `highlightWhitespace`/
// `highlightTrailingWhitespace` extensions, not upstream's CM5-era
// `showInvisibles` option.

import type { Extension } from "@codemirror/state";
import {
	Decoration,
	type DecorationSet,
	type EditorView,
	highlightTrailingWhitespace,
	highlightWhitespace,
	ViewPlugin,
	type ViewUpdate,
} from "@codemirror/view";

const strictBreakMark = Decoration.mark({ class: "cm-strictLineBreak" });

function buildStrictLineBreakPlugin(): Extension {
	return ViewPlugin.fromClass(
		class {
			decorations: DecorationSet;

			constructor(view: EditorView) {
				this.decorations = this.buildDecorations(view);
			}

			update(update: ViewUpdate) {
				if (update.docChanged || update.viewportChanged) {
					this.decorations = this.buildDecorations(update.view);
				}
			}

			buildDecorations(view: EditorView): DecorationSet {
				const builder: ReturnType<typeof strictBreakMark.range>[] = [];
				const doc = view.state.doc;

				for (const { from, to } of view.visibleRanges) {
					const text = doc.sliceString(from, to);
					const re = / {2}(?=\n)/g;
					let match = re.exec(text);
					while (match !== null) {
						const start = from + match.index;
						builder.push(strictBreakMark.range(start, start + 2));
						match = re.exec(text);
					}
				}

				return Decoration.set(builder, true);
			}
		},
		{ decorations: (v) => v.decorations },
	);
}

// Extensions are always active. Visibility is controlled purely by CSS body
// classes (unisastra-show-whitespace, unisastra-show-spaces, unisastra-show-tabs, etc.) set by
// the FeatureToggle system. This avoids relying on CM6 extension reconfiguration
// via updateOptions() which can miss applying body classes to the DOM.
export function createShowWhitespaceExtension(): Extension {
	return [highlightWhitespace(), highlightTrailingWhitespace(), buildStrictLineBreakPlugin()];
}
