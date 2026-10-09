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
