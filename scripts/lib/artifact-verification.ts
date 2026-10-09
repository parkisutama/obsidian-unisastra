import { existsSync, readFileSync, statSync } from "node:fs";
import {
	floatyToolbarLicenseBanner,
	mononoteLicenseBanner,
	writingFocusLicenseBanner,
} from "./license-banner.ts";

const THIRD_PARTY_NOTICES = [
	{
		banner: floatyToolbarLicenseBanner,
		distPath: "dist/licenses/floaty-toolbar-MIT.txt",
		label: "Floaty Toolbar MIT",
		sourcePath: "licenses/floaty-toolbar-MIT.txt",
	},
	{
		banner: writingFocusLicenseBanner,
		distPath: "dist/licenses/writing-focus-MPL2.0.txt",
		label: "Obsidian Focus Mode MPL-2.0",
		sourcePath: "licenses/writing-focus-MPL2.0.txt",
	},
	{
		banner: mononoteLicenseBanner,
		distPath: "dist/licenses/mononote-MIT.txt",
		label: "MonoNote MIT",
		sourcePath: "licenses/mononote-MIT.txt",
	},
] as const;

interface ManifestJson {
	id: string;
	name: string;
	version: string;
}

interface PackageJson {
	name: string;
	version: string;
}

type VersionsJson = Record<string, string>;

function readJsonFile<T>(path: string): T {
	try {
		return JSON.parse(readFileSync(path, "utf-8")) as T;
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		throw new Error(`${path} is not valid JSON: ${message}`);
	}
}

export function assertNonEmptyFile(path: string): void {
	if (!existsSync(path)) {
		throw new Error(`${path} is missing.`);
	}

	const stats = statSync(path);
	if (!stats.isFile()) {
		throw new Error(`${path} is not a file.`);
	}

	if (stats.size === 0) {
		throw new Error(`${path} is empty.`);
	}
}

function readRequiredTextFile(path: string): string {
	if (!existsSync(path)) {
		throw new Error(`${path} is missing.`);
	}
	return readFileSync(path, "utf-8");
}

/**
 * Confirms each third-party notice survived into the built artifacts: the
 * full notice embedded as a `dist/main.js` banner (present even in the
 * minified build, since esbuild's `banner` option is not run through the
 * minifier — see license-banner.ts), and a standalone copy under
 * `dist/licenses/` for the release zip. Fails if either is missing, or if
 * the dist copy has drifted out of sync with the source `licenses/*.txt`
 * (e.g. the source notice was edited without rebuilding) — never by
 * deleting or altering either file, only by reading them.
 */
function assertThirdPartyNoticesPreserved(): void {
	const mainJs = readRequiredTextFile("dist/main.js");

	for (const { banner, distPath, label, sourcePath } of THIRD_PARTY_NOTICES) {
		const sourceNotice = readRequiredTextFile(sourcePath);
		const expectedBanner = banner(sourceNotice);
		if (!mainJs.includes(expectedBanner)) {
			throw new Error(
				`dist/main.js is missing the ${label} notice banner, or it does not match ${sourcePath}. Rebuild after any change to the source notice.`,
			);
		}

		assertNonEmptyFile(distPath);
		const distNotice = readRequiredTextFile(distPath);
		if (distNotice !== sourceNotice) {
			throw new Error(`${distPath} does not match ${sourcePath}.`);
		}
	}
}

export function verifyArtifacts(): string {
	assertNonEmptyFile("dist/main.js");
	assertNonEmptyFile("dist/styles.css");
	assertNonEmptyFile("dist/manifest.json");
	assertThirdPartyNoticesPreserved();

	const packageJson = readJsonFile<PackageJson>("package.json");
	const manifest = readJsonFile<ManifestJson>("dist/manifest.json");
	const versions = readJsonFile<VersionsJson>("versions.json");

	if (manifest.version !== packageJson.version) {
		throw new Error(
			`dist/manifest.json version ${manifest.version} does not match package.json version ${packageJson.version}.`,
		);
	}

	if (
		packageJson.name !== "unisastra" ||
		manifest.id !== "unisastra" ||
		manifest.name !== "Unisastra"
	) {
		throw new Error(
			"Release identity must use package unisastra, manifest ID unisastra, and display name Unisastra.",
		);
	}

	if (!Object.hasOwn(versions, packageJson.version)) {
		throw new Error(`versions.json is missing key ${packageJson.version}.`);
	}

	return packageJson.version;
}
