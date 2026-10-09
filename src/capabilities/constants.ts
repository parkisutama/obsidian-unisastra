// SPDX-License-Identifier: GPL-3.0-only AND MIT
// Derived from Typewriter Mode (https://github.com/davisriedel/obsidian-typewriter-mode)
// Copyright (c) 2023-2026 Davis Riedel
// Modifications Copyright (C) 2025-2026 Parkis Utama

export const DIM_UNFOCUSED_EDITORS_BEHAVIOR = {
	NONE: "dim-none",
	DIM: "dim",
	ALL: "dim-all",
} as const;

export type DimUnfocusedEditorsBehavior =
	(typeof DIM_UNFOCUSED_EDITORS_BEHAVIOR)[keyof typeof DIM_UNFOCUSED_EDITORS_BEHAVIOR];

export const DIM_UNFOCUSED_MODE = {
	PARAGRAPHS: "paragraphs",
	SENTENCES: "sentences",
} as const;

export type DimUnfocusedMode = (typeof DIM_UNFOCUSED_MODE)[keyof typeof DIM_UNFOCUSED_MODE];

export const CURRENT_LINE_HIGHLIGHT_STYLE = {
	BOX: "box",
	UNDERLINE: "underline",
} as const;

export type CurrentLineHighlightStyle =
	(typeof CURRENT_LINE_HIGHLIGHT_STYLE)[keyof typeof CURRENT_LINE_HIGHLIGHT_STYLE];

export const ENABLED_PLATFORMS = {
	BOTH: "both",
	DESKTOP: "desktop",
	MOBILE: "mobile",
} as const;

export type EnabledPlatforms = (typeof ENABLED_PLATFORMS)[keyof typeof ENABLED_PLATFORMS];
