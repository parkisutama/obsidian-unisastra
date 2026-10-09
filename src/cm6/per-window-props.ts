// SPDX-License-Identifier: GPL-3.0-only AND MIT
// Derived from Typewriter Mode (https://github.com/davisriedel/obsidian-typewriter-mode)
// Copyright (c) 2023-2026 Davis Riedel
// Modifications Copyright (C) 2025-2026 Parkis Utama

export interface PerWindowProps {
	allBodyClasses: string[]; // All classes that can be active or not
	bodyAttrs: Record<string, string>;
	bodyClasses: string[]; // all active classes
	cssVariables: Record<string, string>;
	persistentBodyClasses: string[];
}
