import { readFileSync } from "node:fs";

const OBSIDIAN_RELEASE_VERSION_REGEX = /^\d+\.\d+\.\d+$/;

interface RootManifest {
	minAppVersion: string;
	version: string;
}

interface PackageMetadata {
	obsidianMinAppVersion: string;
	version: string;
}

type VersionsMap = Record<string, string>;

function readJsonFile<T>(path: string): T {
	return JSON.parse(readFileSync(path, "utf-8")) as T;
}

export function isObsidianReleaseVersion(version: string): boolean {
	return OBSIDIAN_RELEASE_VERSION_REGEX.test(version);
}

export function assertObsidianReleaseVersion(version: string): void {
	if (!isObsidianReleaseVersion(version)) {
		throw new Error(`Invalid release version "${version}". Obsidian releases must use x.y.z.`);
	}
}

export function validateReleaseMetadata(expectedTag?: string): {
	minAppVersion: string;
	version: string;
} {
	const packageJson = readJsonFile<PackageMetadata>("package.json");
	const manifest = readJsonFile<RootManifest>("manifest.json");
	const versions = readJsonFile<VersionsMap>("versions.json");

	assertObsidianReleaseVersion(packageJson.version);

	if (packageJson.version !== manifest.version) {
		throw new Error(
			`Version mismatch: package.json=${packageJson.version}, manifest.json=${manifest.version}.`,
		);
	}

	if (packageJson.obsidianMinAppVersion !== manifest.minAppVersion) {
		throw new Error(
			`minAppVersion mismatch: package.json=${packageJson.obsidianMinAppVersion}, manifest.json=${manifest.minAppVersion}.`,
		);
	}

	const recordedMinAppVersion = versions[packageJson.version];
	if (recordedMinAppVersion !== manifest.minAppVersion) {
		throw new Error(`versions.json must map ${packageJson.version} to ${manifest.minAppVersion}.`);
	}

	if (expectedTag && expectedTag !== packageJson.version) {
		throw new Error(`Tag mismatch: git tag=${expectedTag}, package.json=${packageJson.version}.`);
	}

	return {
		version: packageJson.version,
		minAppVersion: packageJson.obsidianMinAppVersion,
	};
}
