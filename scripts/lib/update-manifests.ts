// SPDX-License-Identifier: GPL-3.0-only AND MIT
// Derived from Typewriter Mode (https://github.com/davisriedel/obsidian-typewriter-mode)
// Copyright (c) 2023-2026 Davis Riedel
// Modifications Copyright (C) 2025-2026 Parkis Utama

import { readFileSync, writeFileSync } from "node:fs";

export function updateManifests(targetVersion: string, minAppVersion: string, outDir = ".") {
	console.log("Reading manifest");
	const manifest = JSON.parse(readFileSync("manifest.json", "utf-8"));

	const manifestOutPath = `${outDir}/manifest.json`;
	console.log(`Updating ${manifestOutPath}`);
	manifest.version = targetVersion;
	manifest.minAppVersion = minAppVersion;
	writeFileSync(manifestOutPath, `${JSON.stringify(manifest, null, "\t")}\n`);

	return { targetVersion, minAppVersion };
}
