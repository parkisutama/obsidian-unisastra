import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

import { getPackageMetadata } from "./get-package-metadata";
import { updateManifests } from "./update-manifests";

export function setupTestVault(
	distDir: string,
	pluginName: string,
	testVaultPath = "./test-vault",
) {
	const obsidianConfigPath = `${testVaultPath}/.obsidian`;
	const pluginPath = `${obsidianConfigPath}/plugins/${pluginName}`;

	console.log("Creating test vault");
	mkdirSync(pluginPath, { recursive: true });

	if (existsSync(`${obsidianConfigPath}/community-plugins.json`)) {
		console.log("Community plugins already configured in test vault");
	} else {
		console.log("Creating community-plugins.json");
		writeFileSync(`${obsidianConfigPath}/community-plugins.json`, `["${pluginName}"]`);
	}

	console.log("Cleaning test vault");
	for (const file of ["main.js", "styles.css", "manifest.json"]) {
		const filePath = resolve(pluginPath, file);
		if (existsSync(filePath)) {
			rmSync(filePath);
		}
	}

	console.log("Copying plugin dist files");
	const distFiles = readdirSync(distDir);
	for (const file of distFiles) {
		cpSync(resolve(distDir, file), resolve(pluginPath, file), {
			recursive: true,
		});
	}

	console.log("Copying updated manifest");
	const { targetVersion, minAppVersion } = getPackageMetadata();
	updateManifests(targetVersion, minAppVersion, pluginPath);

	console.log("Test vault successfully prepared");
}
