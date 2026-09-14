import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  assertNonEmptyFile,
  verifyArtifacts,
} from "../scripts/lib/artifact-verification";
import { floatyToolbarLicenseBanner } from "../scripts/lib/license-banner";

const originalCwd = process.cwd();

const FLOATY_TOOLBAR_NOTICE = "MIT License\n\nCopyright (c) 2026 0png\n";

function writeJson(path: string, value: unknown): void {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}

function createArtifactFixture({
  distManifestVersion = "1.2.3",
  packageVersion = "1.2.3",
  versions = { "1.2.3": "1.11.0" },
  sourceNotice = FLOATY_TOOLBAR_NOTICE,
  distNotice = FLOATY_TOOLBAR_NOTICE,
  includeBanner = true,
  includeDistNotice = true,
}: {
  distManifestVersion?: string;
  packageVersion?: string;
  versions?: Record<string, string>;
  sourceNotice?: string;
  distNotice?: string;
  includeBanner?: boolean;
  includeDistNotice?: boolean;
} = {}): string {
  const dir = mkdtempSync(join(tmpdir(), "md-writer-artifacts-"));
  mkdirSync(join(dir, "dist"));
  mkdirSync(join(dir, "licenses"));
  writeFileSync(join(dir, "licenses", "floaty-toolbar-MIT.txt"), sourceNotice);
  const banner = includeBanner ? floatyToolbarLicenseBanner(sourceNotice) : "";
  writeFileSync(
    join(dir, "dist", "main.js"),
    `${banner}\nconsole.log('built');\n`
  );
  writeFileSync(join(dir, "dist", "styles.css"), ".md-writer {}\n");
  writeJson(join(dir, "dist", "manifest.json"), {
    version: distManifestVersion,
  });
  if (includeDistNotice) {
    mkdirSync(join(dir, "dist", "licenses"));
    writeFileSync(
      join(dir, "dist", "licenses", "floaty-toolbar-MIT.txt"),
      distNotice
    );
  }
  writeJson(join(dir, "package.json"), {
    version: packageVersion,
  });
  writeJson(join(dir, "versions.json"), versions);
  return dir;
}

afterEach(() => {
  process.chdir(originalCwd);
});

describe("artifact verification", () => {
  it("accepts the required non-empty plugin artifacts", () => {
    process.chdir(createArtifactFixture());

    expect(verifyArtifacts()).toBe("1.2.3");
  });

  it("rejects an empty artifact", () => {
    const dir = createArtifactFixture();
    writeFileSync(join(dir, "dist", "styles.css"), "");
    process.chdir(dir);

    expect(() => verifyArtifacts()).toThrow("dist/styles.css is empty");
  });

  it("rejects a manifest version mismatch", () => {
    process.chdir(createArtifactFixture({ distManifestVersion: "1.2.4" }));

    expect(() => verifyArtifacts()).toThrow(
      "dist/manifest.json version 1.2.4 does not match package.json version 1.2.3"
    );
  });

  it("rejects a missing versions.json entry", () => {
    process.chdir(createArtifactFixture({ versions: {} }));

    expect(() => verifyArtifacts()).toThrow(
      "versions.json is missing key 1.2.3"
    );
  });

  it("rejects a missing file directly", () => {
    process.chdir(createArtifactFixture());

    expect(() => assertNonEmptyFile("dist/missing.js")).toThrow(
      "dist/missing.js is missing"
    );
  });

  it("rejects dist/main.js missing the Floaty Toolbar MIT notice banner", () => {
    process.chdir(createArtifactFixture({ includeBanner: false }));

    expect(() => verifyArtifacts()).toThrow(
      "dist/main.js is missing the Floaty Toolbar MIT notice banner"
    );
  });

  it("rejects a banner that no longer matches the current source notice", () => {
    process.chdir(
      createArtifactFixture({
        sourceNotice: "MIT License\n\nCopyright (c) 2027 0png\n",
        distNotice: "MIT License\n\nCopyright (c) 2027 0png\n",
        includeBanner: false,
      })
    );
    // dist/main.js still carries the OLD banner (as if the source notice
    // changed after the last build, without rebuilding).
    writeFileSync(
      "dist/main.js",
      `${floatyToolbarLicenseBanner(FLOATY_TOOLBAR_NOTICE)}\nconsole.log('built');\n`
    );

    expect(() => verifyArtifacts()).toThrow(
      "dist/main.js is missing the Floaty Toolbar MIT notice banner"
    );
  });

  it("rejects a missing dist/licenses/floaty-toolbar-MIT.txt", () => {
    process.chdir(createArtifactFixture({ includeDistNotice: false }));

    expect(() => verifyArtifacts()).toThrow(
      "dist/licenses/floaty-toolbar-MIT.txt is missing"
    );
  });

  it("rejects a dist notice copy that no longer matches the source notice", () => {
    process.chdir(
      createArtifactFixture({
        distNotice: "MIT License\n\nCopyright (c) 2019 someone-else\n",
      })
    );

    expect(() => verifyArtifacts()).toThrow(
      "dist/licenses/floaty-toolbar-MIT.txt does not match licenses/floaty-toolbar-MIT.txt"
    );
  });
});
