// SPDX-License-Identifier: GPL-3.0-only
// Copyright (C) 2026 Parkis Utama

// How Obsidian reads versions.json: an entry is only needed for a plugin version that changed the
// minimum app version. A plugin version without its own entry inherits the entry of the nearest
// earlier version. This file is identical in every plugin repository; the master copy lives in
// the workspace repository under templates/plugin/scripts/.

const SEMVER = /^(\d+)\.(\d+)\.(\d+)$/;

function parse(version) {
	const match = SEMVER.exec(version);
	if (!match) throw new Error(`Not a plugin version (expected x.y.z): ${JSON.stringify(version)}`);
	return [Number(match[1]), Number(match[2]), Number(match[3])];
}

/** Negative when `a` is the earlier version, positive when it is the later one, 0 when equal. */
export function compareVersions(a, b) {
	const left = parse(a);
	const right = parse(b);
	for (let i = 0; i < 3; i += 1) {
		if (left[i] !== right[i]) return left[i] - right[i];
	}
	return 0;
}

/**
 * The minimum app version versions.json assigns to `version`: the entry for that version, or for
 * the nearest earlier one. Returns null when no entry applies.
 */
export function minAppVersionFor(versions, version) {
	const applicable = Object.keys(versions)
		.filter((key) => compareVersions(key, version) <= 0)
		.sort(compareVersions)
		.at(-1);
	return applicable === undefined ? null : versions[applicable];
}

/**
 * Describes what is wrong with versions.json for this manifest, or returns null when it is right.
 * It is wrong when the minimum app version it assigns to the plugin version differs from the
 * manifest's, which happens when `minAppVersion` was raised without adding an entry.
 */
export function versionsMapProblem(versions, manifest) {
	const assigned = minAppVersionFor(versions, manifest.version);
	if (assigned === manifest.minAppVersion) return null;
	if (assigned === null) {
		return `versions.json has no entry at or before ${manifest.version}; add "${manifest.version}": "${manifest.minAppVersion}".`;
	}
	return `versions.json assigns minimum app version ${assigned} to ${manifest.version}, but manifest.json says ${manifest.minAppVersion}; add "${manifest.version}": "${manifest.minAppVersion}".`;
}
