// SPDX-License-Identifier: GPL-3.0-only
// Copyright (C) 2025-2026 Parkis Utama

import { readFileSync } from "node:fs";

const OBSIDIAN_RELEASE_VERSION_REGEX = /^\d+\.\d+\.\d+$/;

function readJson(path) {
	return JSON.parse(readFileSync(path, "utf-8"));
}

function fail(message) {
	console.error(message);
	process.exit(1);
}

const cliArgs = process.argv.slice(2).filter((arg) => arg !== "--");
const expectedTag = cliArgs[0] ?? process.env.GITHUB_REF_NAME;

if (!expectedTag) {
	fail("Missing tag name. Pass it as an argument or set GITHUB_REF_NAME.");
}

if (!OBSIDIAN_RELEASE_VERSION_REGEX.test(expectedTag)) {
	fail(`Invalid tag "${expectedTag}". GitHub release tags for this repo must use x.y.z.`);
}

const packageJson = readJson("package.json");
const manifest = readJson("manifest.json");
const versions = readJson("versions.json");

if (packageJson.version !== expectedTag) {
	fail(`Tag mismatch: git tag=${expectedTag}, package.json=${packageJson.version}.`);
}

if (manifest.version !== expectedTag) {
	fail(`Tag mismatch: git tag=${expectedTag}, manifest.json=${manifest.version}.`);
}

if (packageJson.obsidianMinAppVersion !== manifest.minAppVersion) {
	fail(
		`minAppVersion mismatch: package.json=${packageJson.obsidianMinAppVersion}, manifest.json=${manifest.minAppVersion}.`,
	);
}

if (versions[expectedTag] !== manifest.minAppVersion) {
	fail(`versions.json must map ${expectedTag} to ${manifest.minAppVersion}.`);
}

console.log(
	`Release metadata validated for tag ${expectedTag} and minAppVersion ${manifest.minAppVersion}.`,
);
