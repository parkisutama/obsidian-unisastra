// SPDX-License-Identifier: GPL-3.0-only AND MIT
// Derived from Typewriter Mode (https://github.com/davisriedel/obsidian-typewriter-mode)
// Copyright (c) 2023-2026 Davis Riedel
// Modifications Copyright (C) 2025-2026 Parkis Utama

import type UnisastraCore from "@/lib";

export default abstract class Loadable {
	protected tm: UnisastraCore;

	constructor(tm: UnisastraCore) {
		this.tm = tm;
	}

	load() {
		// Hook for loading - override in subclass if needed
	}
}
