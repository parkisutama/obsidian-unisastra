// SPDX-License-Identifier: GPL-3.0-only AND MIT
// Derived from Typewriter Mode (https://github.com/davisriedel/obsidian-typewriter-mode)
// Copyright (c) 2023-2026 Davis Riedel
// Modifications Copyright (C) 2025-2026 Parkis Utama

import { copyFileSync, readFileSync, writeFileSync } from "node:fs";

import { getPackageMetadata } from "./get-package-metadata.ts";

export function generateCiArtefacts(outDir: string) {
	console.log("Copying updated manifest");
	const { targetVersion } = getPackageMetadata();
	copyFileSync("manifest.json", `${outDir}/manifest.json`);

	console.log("Extracting release notes from change log");
	const changelog = readFileSync("CHANGELOG.md", "utf-8");
	const pattern = `^## ${targetVersion}\\n+((?:([^#]{2})|\\n)+)`;
	const regex = new RegExp(pattern, "gm");
	const matches = regex.exec(changelog);
	const release_notes = matches?.at(1);
	if (!release_notes) {
		console.warn("Release notes not found in changelog");
	}

	console.log("Writing release notes");
	writeFileSync(`${outDir}/release-notes.md`, release_notes ?? "");
}
