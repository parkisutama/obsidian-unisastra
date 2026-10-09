// SPDX-License-Identifier: GPL-3.0-only
// Copyright (C) 2025-2026 Parkis Utama

import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { validateReleaseMetadata } from "../scripts/lib/release-validation";

const originalCwd = process.cwd();

function writeJson(path: string, value: unknown): void {
	writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}

function createReleaseFixture({
	manifestVersion = "1.2.3",
	packageVersion = "1.2.3",
	versions = { "1.2.3": "1.11.0" },
}: {
	manifestVersion?: string;
	packageVersion?: string;
	versions?: Record<string, string>;
} = {}): string {
	const dir = mkdtempSync(join(tmpdir(), "unisastra-release-"));
	mkdirSync(join(dir, "dist"));
	writeJson(join(dir, "package.json"), {
		obsidianMinAppVersion: "1.11.0",
		version: packageVersion,
	});
	writeJson(join(dir, "manifest.json"), {
		minAppVersion: "1.11.0",
		version: manifestVersion,
	});
	writeJson(join(dir, "versions.json"), versions);
	return dir;
}

afterEach(() => {
	process.chdir(originalCwd);
});

describe("release metadata validation", () => {
	it("accepts synchronized package, manifest, and versions metadata", () => {
		process.chdir(createReleaseFixture());

		expect(validateReleaseMetadata("1.2.3")).toEqual({
			minAppVersion: "1.11.0",
			version: "1.2.3",
		});
	});

	it("rejects a package and manifest version mismatch", () => {
		process.chdir(createReleaseFixture({ manifestVersion: "1.2.4" }));

		expect(() => validateReleaseMetadata("1.2.3")).toThrow("Version mismatch");
	});

	it("rejects a missing versions.json entry for the current version", () => {
		process.chdir(createReleaseFixture({ versions: {} }));

		expect(() => validateReleaseMetadata("1.2.3")).toThrow(
			"versions.json must map 1.2.3 to 1.11.0",
		);
	});
});
