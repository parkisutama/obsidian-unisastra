// SPDX-License-Identifier: GPL-3.0-only AND MIT
// Derived from Typewriter Mode (https://github.com/davisriedel/obsidian-typewriter-mode)
// Copyright (c) 2023-2026 Davis Riedel
// Modifications Copyright (C) 2025-2026 Parkis Utama

import { readFileSync } from "node:fs";

export function getPackageMetadata() {
	console.log("Reading package.json");
	const pkg = JSON.parse(readFileSync("package.json", "utf-8"));
	const targetVersion = pkg.version;
	const minAppVersion = pkg.obsidianMinAppVersion;
	return { targetVersion, minAppVersion };
}
