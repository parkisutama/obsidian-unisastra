// SPDX-License-Identifier: GPL-3.0-only AND MIT
// Derived from Typewriter Mode (https://github.com/davisriedel/obsidian-typewriter-mode)
// Copyright (c) 2023-2026 Davis Riedel
// Modifications Copyright (C) 2025-2026 Parkis Utama

import Loadable from "./loadable";

export abstract class AbstractCommand extends Loadable {
	abstract readonly commandKey: string;
	abstract readonly commandTitle: string;

	protected abstract registerCommand(): void;
}
