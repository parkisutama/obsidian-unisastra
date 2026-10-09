import type { Extension } from "@codemirror/state";
import {
	Decoration,
	type DecorationSet,
	type EditorView,
	ViewPlugin,
	type ViewUpdate,
} from "@codemirror/view";
import type UnisastraCore from "@/lib";

const longLineDeco = Decoration.line({
	class: "unisastra-warn-long-line-exceeded",
});

// Extensions are always active. Visibility is controlled purely by CSS body
// classes (unisastra-warn-long-line) set by the FeatureToggle system. The threshold
// is read from tm.settings on every rebuild so changes propagate via
// saveSettings() → updateOptions() → ViewUpdate.
export function createWarnLongLineExtension(tm: UnisastraCore): Extension {
	return ViewPlugin.fromClass(
		class {
			decorations: DecorationSet;
			private threshold: number;

			constructor(view: EditorView) {
				this.threshold = tm.settings.maxChars.warnLongLineChars;
				this.decorations = this.buildDecorations(view);
			}

			update(update: ViewUpdate) {
				const newThreshold = tm.settings.maxChars.warnLongLineChars;
				if (update.docChanged || update.viewportChanged || newThreshold !== this.threshold) {
					this.threshold = newThreshold;
					this.decorations = this.buildDecorations(update.view);
				}
			}

			buildDecorations(view: EditorView): DecorationSet {
				const builder: ReturnType<typeof longLineDeco.range>[] = [];
				const doc = view.state.doc;
				const threshold = this.threshold;

				for (const { from, to } of view.visibleRanges) {
					let pos = from;
					while (pos <= to) {
						const line = doc.lineAt(pos);
						if (line.length > threshold) {
							builder.push(longLineDeco.range(line.from));
						}
						pos = line.to + 1;
					}
				}

				return Decoration.set(builder, true);
			}
		},
		{ decorations: (v) => v.decorations },
	);
}
