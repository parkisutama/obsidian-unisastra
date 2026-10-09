// SPDX-License-Identifier: GPL-3.0-only AND MIT
// Derived from Typewriter Mode (https://github.com/davisriedel/obsidian-typewriter-mode)
// Copyright (c) 2023-2026 Davis Riedel
// Modifications Copyright (C) 2025-2026 Parkis Utama

import type UnisastraCore from "@/lib";
import CurrentLineHighlightColorBase from "./current-line-highlight-color-base";

export default class CurrentLineHighlightColorLight extends CurrentLineHighlightColorBase {
	constructor(tm: UnisastraCore) {
		super(tm, "light");
	}
}
