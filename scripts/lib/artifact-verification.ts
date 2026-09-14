import { existsSync, readFileSync, statSync } from "node:fs";
import { floatyToolbarLicenseBanner } from "./license-banner";

const FLOATY_TOOLBAR_LICENSE_PATH = "licenses/floaty-toolbar-MIT.txt";
const DIST_FLOATY_TOOLBAR_LICENSE_PATH = "dist/licenses/floaty-toolbar-MIT.txt";

interface ManifestJson {
  version: string;
}

interface PackageJson {
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
 * Confirms the Floaty Toolbar MIT notice survived into the built artifacts:
 * the full notice embedded as a `dist/main.js` banner (present even in the
 * minified build, since esbuild's `banner` option is not run through the
 * minifier — see license-banner.ts), and a standalone copy at
 * `dist/licenses/floaty-toolbar-MIT.txt` for the release zip. Fails if
 * either is missing, or if the dist copy has drifted out of sync with the
 * source `licenses/floaty-toolbar-MIT.txt` (e.g. the source notice was
 * edited without rebuilding) — never by deleting or altering either file,
 * only by reading them.
 */
function assertFloatyToolbarNoticePreserved(): void {
  const sourceNotice = readRequiredTextFile(FLOATY_TOOLBAR_LICENSE_PATH);
  const mainJs = readRequiredTextFile("dist/main.js");
  const expectedBanner = floatyToolbarLicenseBanner(sourceNotice);
  if (!mainJs.includes(expectedBanner)) {
    throw new Error(
      "dist/main.js is missing the Floaty Toolbar MIT notice banner, or it does not match licenses/floaty-toolbar-MIT.txt. Rebuild after any change to the source notice."
    );
  }

  assertNonEmptyFile(DIST_FLOATY_TOOLBAR_LICENSE_PATH);
  const distNotice = readRequiredTextFile(DIST_FLOATY_TOOLBAR_LICENSE_PATH);
  if (distNotice !== sourceNotice) {
    throw new Error(
      `${DIST_FLOATY_TOOLBAR_LICENSE_PATH} does not match ${FLOATY_TOOLBAR_LICENSE_PATH}.`
    );
  }
}

export function verifyArtifacts(): string {
  assertNonEmptyFile("dist/main.js");
  assertNonEmptyFile("dist/styles.css");
  assertNonEmptyFile("dist/manifest.json");
  assertFloatyToolbarNoticePreserved();

  const packageJson = readJsonFile<PackageJson>("package.json");
  const manifest = readJsonFile<ManifestJson>("dist/manifest.json");
  const versions = readJsonFile<VersionsJson>("versions.json");

  if (manifest.version !== packageJson.version) {
    throw new Error(
      `dist/manifest.json version ${manifest.version} does not match package.json version ${packageJson.version}.`
    );
  }

  if (!Object.hasOwn(versions, packageJson.version)) {
    throw new Error(`versions.json is missing key ${packageJson.version}.`);
  }

  return packageJson.version;
}
