// Sets the plugin version in one step: package.json, manifest.json, and versions.json.
//
//   node scripts/sync-version.mjs 0.2.0
//
// The release tag must equal this version (no `v` prefix); the release workflow checks it.
// Nothing is committed or tagged here.

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SEMVER = /^\d+\.\d+\.\d+$/;

function readJson(file) {
	return JSON.parse(readFileSync(file, "utf8"));
}

function writeJson(file, value) {
	writeFileSync(file, `${JSON.stringify(value, null, "\t")}\n`);
}

/** Updates the three version files under `rootDir`. Returns what was written. */
export function syncVersion({ rootDir = process.cwd(), version }) {
	if (!SEMVER.test(version ?? "")) {
		throw new Error(`Version must look like 1.2.3 (no "v" prefix); got ${JSON.stringify(version)}`);
	}
	const packagePath = path.join(rootDir, "package.json");
	const manifestPath = path.join(rootDir, "manifest.json");
	const versionsPath = path.join(rootDir, "versions.json");

	const pkg = readJson(packagePath);
	const manifest = readJson(manifestPath);
	const versions = readJson(versionsPath);

	pkg.version = version;
	manifest.version = version;
	versions[version] = manifest.minAppVersion;

	writeJson(packagePath, pkg);
	writeJson(manifestPath, manifest);
	writeJson(versionsPath, versions);
	return { version, minAppVersion: manifest.minAppVersion };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
	try {
		const { version, minAppVersion } = syncVersion({ version: process.argv[2] });
		console.log(
			`Version ${version} (minimum Obsidian ${minAppVersion}) written to package.json, manifest.json, versions.json.`,
		);
		console.log(`Next: pnpm run verify, commit, then tag "${version}" (no "v" prefix).`);
	} catch (error) {
		console.error(error.message);
		process.exit(1);
	}
}
