// SPDX-License-Identifier: GPL-3.0-only
// Copyright (C) 2025-2026 Parkis Utama

import { history, redo, undo } from "@codemirror/commands";
import {
	foldEffect,
	foldedRanges,
	foldService,
	foldState,
	StreamLanguage,
	unfoldEffect,
} from "@codemirror/language";
import { EditorState, StateEffect } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { FoldPersistenceCoordinator } from "../../src/capabilities/features/fold-persist/coordinator";
import {
	createBlockIdHiderPlugin,
	generateUniqueBlockId,
	insertBlockId,
} from "../../src/cm6/outliner/block-id";
import {
	createFoldPersistExtension,
	internalFoldChange,
} from "../../src/cm6/outliner/fold-persist";
import type UnisastraCore from "../../src/lib";
import { editorInfoField, editorLivePreviewField } from "./fold-obsidian";

const GENERATED_ID = /\^ol-[a-z0-9]{5}/;
async function runFoldRegression() {
	const failures: string[] = [];
	let checks = 0;
	const check = (value: boolean, label: string) => {
		checks++;
		if (!value) {
			failures.push(label);
		}
	};
	const frames = async () => {
		for (let n = 0; n < 5; n++) {
			await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
		}
	};
	const snapshots: Record<string, Record<string, boolean>> = {};
	let writes = 0;
	const settings = {
		general: { isPluginActivated: true, enabledPlatforms: "all" },
		blockId: {
			isBlockIdEnabled: true,
			isAutoGenerateOnFoldEnabled: true,
			isHideIdsInLivePreviewEnabled: true,
		},
		foldPersist: { isFoldPersistEnabled: true, foldState: snapshots },
		hemingwayMode: { isHemingwayModeEnabled: false },
	};
	let frontmatter: Record<string, boolean> | undefined;
	const coordinator = new FoldPersistenceCoordinator({
		enabled: () => settings.foldPersist.isFoldPersistEnabled,
		state: () => snapshots,
		persist: () => {
			writes++;
			return Promise.resolve();
		},
	});
	const tm = {
		settings,
		foldPersistence: coordinator,
		plugin: {
			app: { metadataCache: { getFileCache: () => ({ frontmatter }) } },
		},
	} as unknown as UnisastraCore;
	const make = (doc: string, path = "fixture.md", preview = true) => {
		const fold = createFoldPersistExtension(tm);
		const hide = createBlockIdHiderPlugin(tm);
		const view = new EditorView({
			parent: document.body,
			state: EditorState.create({
				doc,
				extensions: [
					history(),
					StreamLanguage.define({
						token(stream) {
							stream.skipToEnd();
							return null;
						},
					}),
					foldState,
					foldService.of((state, from) => {
						const line = state.doc.lineAt(from);
						return line.number < state.doc.lines &&
							state.doc.line(line.number + 1).text.startsWith("  ")
							? { from: line.to + 1, to: state.doc.length }
							: null;
					}),
					editorInfoField,
					editorLivePreviewField.init(() => preview),
					fold,
					hide,
				],
			}),
		});
		const info = view.state.field(editorInfoField);
		info.editor.cm = view;
		info.file.path = path;
		view.dispatch({});
		return { view, hide };
	};
	const f = make("- Parent\n  - Child");
	await frames();
	const range = {
		from: f.view.state.doc.line(1).to + 1,
		to: f.view.state.doc.length,
	};
	const unrelated = StateEffect.define<{ from: number; to: number }>();
	f.view.dispatch({ effects: unrelated.of(range) });
	await frames();
	check(!f.view.state.doc.toString().includes("^ol-"), "non-fold effect cannot insert ID");
	f.view.dispatch({ effects: foldEffect.of(range) });
	await frames();
	check(GENERATED_ID.test(f.view.state.doc.toString()), "native fold auto-inserts ID");
	const generated = f.view.state.doc.toString();
	check(
		Object.values(snapshots["fixture.md"] ?? {}).includes(true),
		"capture after mapped insertion",
	);
	check(undo(f.view), "insertion is undoable");
	await frames();
	check(!f.view.state.doc.toString().includes("^ol-"), "undo does not regenerate ID");
	check(redo(f.view), "insertion supports redo");
	await frames();
	check(f.view.state.doc.toString() === generated, "redo preserves ID");
	f.view.destroy();
	snapshots["restore.md"] = { saved: true };
	const restored = make("- Parent ^saved\n  - Child", "restore.md");
	const selection = restored.view.state.selection;
	const text = restored.view.state.doc.toString();
	await frames();
	check(foldedRanges(restored.view.state).size === 1, "restore applies fold effect");
	check(
		restored.view.state.selection.eq(selection) && restored.view.state.doc.toString() === text,
		"restore preserves selection/text",
	);
	check(
		(restored.view.plugin(restored.hide)?.decorations.size ?? 0) === 1,
		"Live Preview hides ID",
	);
	restored.view.dispatch({
		selection: { anchor: restored.view.state.doc.line(1).to },
	});
	check(
		restored.view.plugin(restored.hide)?.decorations.size === 0,
		"caret exposes editable suffix",
	);
	settings.blockId.isBlockIdEnabled = false;
	restored.view.dispatch({ selection: { anchor: 0 } });
	check(
		restored.view.plugin(restored.hide)?.decorations.size === 0,
		"master off removes decoration",
	);
	restored.view.destroy();
	settings.blockId.isBlockIdEnabled = true;
	const internal = make("- Parent\n  - Child", "internal.md");
	await frames();
	internal.view.dispatch({
		effects: foldEffect.of(range),
		annotations: internalFoldChange.of(true),
	});
	await frames();
	check(!internal.view.state.doc.toString().includes("^"), "internal restore never generates ID");
	internal.view.dispatch({ effects: unfoldEffect.of(range) });
	internal.view.dispatch({ effects: foldEffect.of(range) });
	settings.blockId.isAutoGenerateOnFoldEnabled = false;
	await frames();
	check(!internal.view.state.doc.toString().includes("^"), "disable cancels deferred insertion");
	internal.view.destroy();
	settings.blockId.isAutoGenerateOnFoldEnabled = true;
	for (const guard of ["hemingway", "frontmatter", "plugin", "platform", "readOnly"] as const) {
		settings.hemingwayMode.isHemingwayModeEnabled = guard === "hemingway";
		settings.general.isPluginActivated = guard !== "plugin";
		settings.general.enabledPlatforms = guard === "platform" ? "mobile" : "both";
		frontmatter = guard === "frontmatter" ? { unisastra: false } : undefined;
		const guarded = make("- Parent\n  - Child", guard);
		if (guard === "readOnly") {
			guarded.view.dispatch({
				effects: StateEffect.appendConfig.of(EditorState.readOnly.of(true)),
			});
		}
		guarded.view.dispatch({ effects: foldEffect.of(range) });
		await frames();
		check(!guarded.view.state.doc.toString().includes("^"), `${guard} guard preserves text`);
		guarded.view.destroy();
	}
	settings.hemingwayMode.isHemingwayModeEnabled = false;
	settings.general.isPluginActivated = true;
	settings.general.enabledPlatforms = "both";
	frontmatter = undefined;
	const source = make("- Source ^existing", "source.md", false);
	check(source.view.plugin(source.hide)?.decorations.size === 0, "Source mode keeps ID visible");
	source.view.destroy();
	settings.blockId.isAutoGenerateOnFoldEnabled = false;
	const left = make("- Parent ^shared\n  - Child", "shared.md");
	const right = make("- Parent ^shared\n  - Child", "shared.md");
	await frames();
	const sharedRange = {
		from: left.view.state.doc.line(1).to + 1,
		to: left.view.state.doc.length,
	};
	left.view.dispatch({ effects: foldEffect.of(sharedRange) });
	right.view.dispatch({ effects: foldEffect.of(sharedRange) });
	right.view.dispatch({ effects: unfoldEffect.of(sharedRange) });
	await frames();
	check(
		snapshots["shared.md"]?.shared === false,
		"latest pane action wins before deferred capture",
	);
	check(foldedRanges(left.view.state).size === 1, "capture does not synchronize sibling pane");
	left.view.destroy();
	right.view.destroy();
	settings.blockId.isAutoGenerateOnFoldEnabled = true;
	const closed: EditorView[] = [];
	for (let n = 0; n < 50; n++) {
		const closing = make("- Parent\n  - Child", `close-${n}.md`);
		closing.view.dispatch({ effects: foldEffect.of(range) });
		closing.view.destroy();
		closed.push(closing.view);
	}
	await frames();
	check(
		closed.every((view) => !view.state.doc.toString().includes("^")),
		"50 disposed editors cannot insert IDs",
	);
	check(
		!Object.keys(snapshots).some((path) => path.startsWith("close-")),
		"50 disposed editors cannot capture pending folds",
	);
	const switched = make("- Parent\n  - Child", "old.md");
	switched.view.dispatch({ effects: foldEffect.of(range) });
	switched.view.state.field(editorInfoField).file.path = "new.md";
	await frames();
	check(
		!switched.view.state.doc.toString().includes("^"),
		"file identity change cancels pending insertion",
	);
	switched.view.destroy();
	settings.blockId.isBlockIdEnabled = false;
	const manual = make("- Manual");
	const id = insertBlockId(manual.view);
	check(
		insertBlockId(manual.view) === id,
		"manual insertion preserves existing ID with master off",
	);
	manual.view.destroy();
	const random = Math.random;
	try {
		Math.random = () => 0;
		let refused = false;
		try {
			generateUniqueBlockId(new Set(["ol-aaaaa"]));
		} catch {
			refused = true;
		}
		check(refused, "collision exhaustion refuses duplicate insertion");
	} finally {
		Math.random = random;
	}
	coordinator.destroy();
	const count = writes;
	await frames();
	check(writes === count, "destroy leaves no new saves");
	return { checks, failures };
}
Object.assign(window, { runFoldRegression });
