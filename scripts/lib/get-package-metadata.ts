import { readFileSync } from "node:fs";

export function getPackageMetadata() {
	console.log("Reading package.json");
	const pkg = JSON.parse(readFileSync("package.json", "utf-8"));
	const targetVersion = pkg.version;
	const minAppVersion = pkg.obsidianMinAppVersion;
	return { targetVersion, minAppVersion };
}
