// SPDX-License-Identifier: GPL-3.0-only AND MIT
// Derived from Typewriter Mode (https://github.com/davisriedel/obsidian-typewriter-mode)
// Copyright (c) 2023-2026 Davis Riedel
// Modifications Copyright (C) 2025-2026 Parkis Utama

// ADAPTED FROM: https://github.com/artisticat1/focus-active-sentence

import type { Line, Range } from "@codemirror/state";
import { Decoration, type EditorView } from "@codemirror/view";

function textStartsWithIgnored(lineText: string, ignoredPatterns: string[], i: number) {
	let foundTitle = false;

	for (const title of ignoredPatterns) {
		if (lineText.slice(i + 1 - title.length, i + 1) === title) {
			foundTitle = true;
			break;
		}
	}

	return foundTitle;
}

interface Settings {
	extraCharacters: string;
	ignoredPatterns: string;
	sentenceDelimiters: string;
}

function findSentenceStart(
	lineText: string,
	sentenceDelimiters: string[],
	extraCharacters: string[],
	ignoredPatterns: string[],
	lineStart: number,
	pos: number,
): number {
	for (let i = pos - lineStart - 1; i >= 0; i--) {
		if (!sentenceDelimiters.contains(lineText[i])) {
			continue;
		}
		if (textStartsWithIgnored(lineText, ignoredPatterns, i)) {
			continue;
		}

		let offset = 1;
		while (lineText[i + offset] === " " && offset < pos - lineStart - 1) {
			offset += 1;
		}
		while (
			extraCharacters.contains(lineText[i + offset]) &&
			sentenceDelimiters.contains(lineText[i + offset - 1]) &&
			offset < pos - lineStart - 1
		) {
			offset += 1;
		}
		return i + offset;
	}
	return 0;
}

function findSentenceEnd(
	lineText: string,
	sentenceDelimiters: string[],
	extraCharacters: string[],
	ignoredPatterns: string[],
	lineStart: number,
	lineLength: number,
	pos: number,
): number | null {
	for (let i = pos - lineStart; i < lineLength; i++) {
		if (!sentenceDelimiters.contains(lineText[i])) {
			continue;
		}
		if (textStartsWithIgnored(lineText, ignoredPatterns, i)) {
			continue;
		}

		let offset = 1;
		while (sentenceDelimiters.contains(lineText[i + offset]) && offset < lineLength) {
			offset += 1;
		}
		while (extraCharacters.contains(lineText[i + offset]) && offset < lineLength) {
			offset += 1;
		}
		return i + offset;
	}
	return null;
}

function getActiveSentenceBounds(settings: Settings, line: Line, pos: number) {
	const sentenceDelimiters = settings.sentenceDelimiters.split("");
	const extraCharacters = settings.extraCharacters.split("");
	const ignoredPatterns = settings.ignoredPatterns.split("\n");

	const lineStart = line.from;
	const lineText = line.text;

	const start = findSentenceStart(
		lineText,
		sentenceDelimiters,
		extraCharacters,
		ignoredPatterns,
		lineStart,
		pos,
	);

	const end = findSentenceEnd(
		lineText,
		sentenceDelimiters,
		extraCharacters,
		ignoredPatterns,
		lineStart,
		line.length,
		pos,
	);

	if (end !== null) {
		return { start: start + lineStart, end: end + lineStart };
	}
	return { start: start + lineStart, end: null };
}

export function getActiveSentenceDecos(view: EditorView, settings: Settings) {
	const widgets: Range<Decoration>[] = [];
	const selection = view.state.selection.main;
	const pos = selection.from;
	const line = view.state.doc.lineAt(pos);

	let activeSentenceBounds = getActiveSentenceBounds(settings, line, pos);

	if (activeSentenceBounds.end == null && pos > line.from) {
		activeSentenceBounds = getActiveSentenceBounds(settings, line, pos - 1);
	}

	const start = activeSentenceBounds.start;
	let end = activeSentenceBounds.end;
	if (end == null) {
		end = line.to;
	}

	function addWidget(from: number, to: number, className: string) {
		widgets.push(
			Decoration.mark({
				inclusive: true,
				attributes: {},
				class: className,
			}).range(from, to),
		);
	}

	if (start !== end) {
		// Line decoration must come first (lowest startSide) for correct sort order
		widgets.push(Decoration.line({ class: "unisastra-active-sentence-line" }).range(line.from));

		addWidget(start, end, "active-sentence");

		if (line.from !== start) {
			addWidget(line.from, start, "active-paragraph");
		}

		if (end !== line.to) {
			addWidget(end, line.to, "active-paragraph");
		}
	}

	return Decoration.set(widgets, true);
}
