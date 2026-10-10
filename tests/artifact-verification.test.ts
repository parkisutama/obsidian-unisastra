// SPDX-License-Identifier: GPL-3.0-only
// Copyright (C) 2025-2026 Parkis Utama

import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { assertNonEmptyFile, verifyArtifacts } from "../scripts/lib/artifact-verification";
import {
	floatyToolbarLicenseBanner,
	NOTICES_SOURCE_DIR,
	THIRD_PARTY_NOTICES,
} from "../scripts/lib/license-banner";

const originalCwd = process.cwd();

const FLOATY_TOOLBAR_NOTICE = "Notice for floaty-toolbar-MIT.txt\n\nCopyright (c) its authors\n";

// One fixture per notice the build ships, so a notice added to the shared list is covered here
// without editing this file.
const NOTICE_FIXTURES = THIRD_PARTY_NOTICES.map(({ banner, fileName, label }) => ({
	banner,
	distName: fileName,
	label,
	notice: `Notice for ${fileName}\n\nCopyright (c) its authors\n`,
}));

function writeJson(path: string, value: unknown): void {
	writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}

function createArtifactFixture({
	manifestId = "unisastra",
	manifestName = "Unisastra",
	packageName = "unisastra",
	distManifestVersion = "1.2.3",
	packageVersion = "1.2.3",
	versions = { "1.2.3": "1.11.0" },
	omitBannerFor = [],
	omitDistNoticeFor = [],
	noticeOverrides = {},
	distNoticeOverrides = {},
}: {
	manifestId?: string;
	manifestName?: string;
	packageName?: string;
	distManifestVersion?: string;
	packageVersion?: string;
	versions?: Record<string, string>;
	omitBannerFor?: string[];
	omitDistNoticeFor?: string[];
	noticeOverrides?: Record<string, string>;
	distNoticeOverrides?: Record<string, string>;
} = {}): string {
	const dir = mkdtempSync(join(tmpdir(), "unisastra-artifacts-"));
	mkdirSync(join(dir, "dist"));
	mkdirSync(join(dir, NOTICES_SOURCE_DIR));
	mkdirSync(join(dir, "dist", "licenses"));

	let bannerText = "";
	for (const { banner, distName, notice } of NOTICE_FIXTURES) {
		const sourceNotice = noticeOverrides[distName] ?? notice;
		writeFileSync(join(dir, NOTICES_SOURCE_DIR, distName), sourceNotice);

		if (!omitBannerFor.includes(distName)) {
			bannerText += `${banner(sourceNotice)}\n`;
		}

		if (!omitDistNoticeFor.includes(distName)) {
			writeFileSync(
				join(dir, "dist", "licenses", distName),
				distNoticeOverrides[distName] ?? sourceNotice,
			);
		}
	}
	writeFileSync(join(dir, "dist", "main.js"), `${bannerText}console.log('built');\n`);

	writeFileSync(join(dir, "dist", "styles.css"), ".unisastra {}\n");
	writeJson(join(dir, "dist", "manifest.json"), {
		id: manifestId,
		name: manifestName,
		version: distManifestVersion,
		minAppVersion: "1.11.0",
	});
	writeJson(join(dir, "package.json"), {
		name: packageName,
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
			"dist/manifest.json version 1.2.4 does not match package.json version 1.2.3",
		);
	});

	it("rejects old plugin identity in release artifacts", () => {
		for (const options of [
			{ manifestId: "md-writer" },
			{ manifestName: "MD Writer" },
			{ packageName: "md-writer" },
		]) {
			process.chdir(createArtifactFixture(options));
			expect(() => verifyArtifacts()).toThrow("Release identity must use");
		}
	});

	it("rejects a versions.json with no applicable entry", () => {
		process.chdir(createArtifactFixture({ versions: {} }));

		expect(() => verifyArtifacts()).toThrow("versions.json has no entry at or before 1.2.3");
	});

	it("accepts a release that inherits the minimum app version of an earlier entry", () => {
		process.chdir(createArtifactFixture({ versions: { "0.0.1": "1.11.0" } }));

		expect(verifyArtifacts()).toBe("1.2.3");
	});

	it("rejects a raised minimum app version that has no versions.json entry", () => {
		process.chdir(createArtifactFixture({ versions: { "0.0.1": "1.10.0" } }));

		expect(() => verifyArtifacts()).toThrow(
			"versions.json assigns minimum app version 1.10.0 to 1.2.3",
		);
	});

	it("rejects a missing file directly", () => {
		process.chdir(createArtifactFixture());

		expect(() => assertNonEmptyFile("dist/missing.js")).toThrow("dist/missing.js is missing");
	});

	it("rejects dist/main.js missing the Floaty Toolbar MIT notice banner", () => {
		process.chdir(createArtifactFixture({ omitBannerFor: ["floaty-toolbar-MIT.txt"] }));

		expect(() => verifyArtifacts()).toThrow(
			"dist/main.js is missing the Floaty Toolbar MIT notice banner",
		);
	});

	it("rejects dist/main.js missing the Obsidian Focus Mode MPL-2.0 notice banner", () => {
		process.chdir(createArtifactFixture({ omitBannerFor: ["writing-focus-MPL2.0.txt"] }));

		expect(() => verifyArtifacts()).toThrow(
			"dist/main.js is missing the Obsidian Focus Mode MPL-2.0 notice banner",
		);
	});

	it("rejects dist/main.js missing the MonoNote MIT notice banner", () => {
		process.chdir(createArtifactFixture({ omitBannerFor: ["mononote-MIT.txt"] }));

		expect(() => verifyArtifacts()).toThrow(
			"dist/main.js is missing the MonoNote MIT notice banner",
		);
	});

	it("rejects a banner that no longer matches the current source notice", () => {
		const dir = createArtifactFixture({
			noticeOverrides: {
				"floaty-toolbar-MIT.txt": "MIT License\n\nCopyright (c) 2027 0png\n",
			},
			distNoticeOverrides: {
				"floaty-toolbar-MIT.txt": "MIT License\n\nCopyright (c) 2027 0png\n",
			},
			omitBannerFor: ["floaty-toolbar-MIT.txt"],
		});
		// dist/main.js still carries the OLD banner (as if the source notice
		// changed after the last build, without rebuilding).
		process.chdir(dir);
		const otherBanners = NOTICE_FIXTURES.filter(
			({ distName }) => distName !== "floaty-toolbar-MIT.txt",
		)
			.map(({ banner, notice }) => banner(notice))
			.join("\n");
		const stale = `${otherBanners}\n${floatyToolbarLicenseBanner(FLOATY_TOOLBAR_NOTICE)}\nconsole.log('built');\n`;
		writeFileSync("dist/main.js", stale);

		expect(() => verifyArtifacts()).toThrow(
			"dist/main.js is missing the Floaty Toolbar MIT notice banner",
		);
	});

	it("rejects a missing dist/licenses/floaty-toolbar-MIT.txt", () => {
		process.chdir(createArtifactFixture({ omitDistNoticeFor: ["floaty-toolbar-MIT.txt"] }));

		expect(() => verifyArtifacts()).toThrow("dist/licenses/floaty-toolbar-MIT.txt is missing");
	});

	it("rejects a dist notice copy that no longer matches the source notice", () => {
		process.chdir(
			createArtifactFixture({
				distNoticeOverrides: {
					"floaty-toolbar-MIT.txt": "MIT License\n\nCopyright (c) 2019 someone-else\n",
				},
			}),
		);

		expect(() => verifyArtifacts()).toThrow(
			"dist/licenses/floaty-toolbar-MIT.txt does not match third-party-notices/floaty-toolbar-MIT.txt",
		);
	});
});

describe("third-party notice list", () => {
	it("covers every upstream whose code the plugin adapts", () => {
		expect(THIRD_PARTY_NOTICES.map((notice) => notice.fileName).sort()).toEqual([
			"floaty-toolbar-MIT.txt",
			"focus-active-sentence-MIT.txt",
			"mononote-MIT.txt",
			"obsidian-zoom-MIT.txt",
			"remember-cursor-position-MIT.txt",
			"typewriter-mode-MIT.txt",
			"typewriter-scroll-MIT.txt",
			"writing-focus-MPL2.0.txt",
		]);
	});

	it.each(THIRD_PARTY_NOTICES.map((notice) => notice.fileName))(
		"rejects a build whose main.js lacks the %s banner",
		(fileName) => {
			process.chdir(createArtifactFixture({ omitBannerFor: [fileName] }));

			expect(() => verifyArtifacts()).toThrow("notice banner");
		},
	);
});
