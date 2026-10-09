// Obsidian CLI eval diagnostic. Uses only a detached Markdown view and synthetic text.
// No vault file is opened, read, saved, or created. Never register this as a plugin.
(async () => {
	const app = window.app;
	let view;
	const records = [];
	try {
		view = app.viewRegistry.viewByType.markdown({
			app,
			containerEl: document.createElement("div"),
			id: "unisastra-fold-probe",
			history: { backHistory: [], forwardHistory: [] },
			getRoot: () => app.workspace.rootSplit,
		});
		const noop = () => {
			/* Fixture must not schedule any host save. */
		};
		view.requestSave = noop;
		view.editMode.requestSaveFolds = noop;
		view.editMode.requestOnInternalDataChange = noop;
		view.currentMode = view.editMode;
		view.containerEl.style.cssText =
			"position:fixed;left:-10000px;top:0;width:800px;height:600px;visibility:hidden";
		document.body.appendChild(view.containerEl);
		view.editMode.show();
		const cm = view.editMode.cm;
		const nativeUpdate = cm.update.bind(cm);
		cm.update = (transactions) => {
			records.push(
				...transactions.map((tr) => ({
					changed: tr.docChanged,
					selection: Boolean(tr.selection),
					effects: tr.effects.map((effect) => ({
						value: effect.value,
						type: effect.type.map.toString(),
					})),
					annotations: tr.annotations.map((annotation) => ({
						value: annotation.value,
						type: annotation.type.toString(),
					})),
				})),
			);
			nativeUpdate(transactions);
		};
		view.editMode.set("- Parent ^ol-probe\n  - Child ^ol-child\n    - Grandchild\n- Next", true);
		cm.requestMeasure();
		await new Promise((resolve) => setTimeout(resolve, 500));
		records.length = 0;
		const before = cm.state.selection.toJSON();
		const text = view.editor.getValue();
		view.editor.foldMore();
		const folded = view.editMode.getFoldInfo();
		const foldRecords = records.splice(0);
		view.editor.foldLess();
		const unfolded = view.editMode.getFoldInfo();
		return JSON.stringify({
			scope: "detached native Markdown view, synthetic content, save callbacks disabled",
			foldable: view.editor.getAllFoldableLines(),
			folded,
			unfolded,
			foldRecords,
			unfoldRecords: records,
			textUnchanged: view.editor.getValue() === text,
			selectionUnchanged: JSON.stringify(cm.state.selection.toJSON()) === JSON.stringify(before),
		});
	} finally {
		view?.editMode.destroy();
		view?.containerEl.remove();
		view?.unload();
	}
})();
