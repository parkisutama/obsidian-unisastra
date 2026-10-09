import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { getPackageMetadata } from "./get-package-metadata.ts";
import { assertObsidianReleaseVersion, validateReleaseMetadata } from "./release-validation.ts";
import { updateManifests } from "./update-manifests.ts";

export function releasePlugin() {
	console.log("Release script started");

	const { targetVersion, minAppVersion } = getPackageMetadata();
	assertObsidianReleaseVersion(targetVersion);

	console.log("Checking git status");
	const result = execSync(`git tag -l "${targetVersion}"`, {
		encoding: "utf-8",
	});
	if (result.trim() === targetVersion) {
		console.error(`Version v${targetVersion} is already published. Exiting...`);
		process.exit(1);
	}
	console.log(`Releasing v${targetVersion}`);

	console.log("Updating manifests");
	updateManifests(targetVersion, minAppVersion);

	console.log("Reading changelog");
	const changelog = readFileSync("CHANGELOG.md", "utf-8");
	const checkChangelogRegex = new RegExp(`^## ${targetVersion}$`, "m");
	if (!checkChangelogRegex.test(changelog)) {
		console.error(`Changelog for v${targetVersion} not found`);
		console.info("Please provide a changelog entry for the new version in CHANGELOG.md");
		process.exit(1);
	}

	// update versions.json with target version and minAppVersion from manifest.json
	console.log("Updating versions.json");
	const versions = JSON.parse(readFileSync("versions.json", "utf-8"));
	versions[targetVersion] = minAppVersion;
	writeFileSync("versions.json", `${JSON.stringify(versions, null, "\t")}\n`);

	console.log("Validating release metadata");
	validateReleaseMetadata(targetVersion);

	console.log("Running release gates");
	execSync("pnpm run verify", {
		stdio: "inherit",
	});

	console.log("Committing new version");
	execSync("git add package.json manifest.json versions.json CHANGELOG.md", {
		stdio: "ignore",
	});
	execSync(`git commit -m "chore(release): ${targetVersion}"`, {
		stdio: "ignore",
	});

	console.log("Tagging new version");
	execSync(`git tag -a "${targetVersion}" -m "${targetVersion}"`, {
		stdio: "ignore",
	});

	console.log("Release script completed");
	console.info("Run `git push --follow-tags` to push and release the new version");
}
