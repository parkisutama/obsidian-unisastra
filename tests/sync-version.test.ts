// SPDX-License-Identifier: GPL-3.0-only
// Copyright (C) 2025-2026 Parkis Utama

import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { syncVersion } from "../scripts/sync-version.mjs";

let dir: string;

beforeEach(() => {
	dir = mkdtempSync(path.join(tmpdir(), "unisastra-version-"));
	mkdirSync(dir, { recursive: true });
	writeFileSync(path.join(dir, "package.json"), JSON.stringify({ name: "x", version: "0.1.0" }));
	writeFileSync(
		path.join(dir, "manifest.json"),
		JSON.stringify({ id: "unisastra", version: "0.1.0", minAppVersion: "1.14.2" }),
	);
	writeFileSync(path.join(dir, "versions.json"), JSON.stringify({ "0.1.0": "1.14.2" }));
});

afterEach(() => {
	rmSync(dir, { recursive: true, force: true });
});

const read = (file: string) => JSON.parse(readFileSync(path.join(dir, file), "utf8"));

describe("syncVersion", () => {
	it("updates package.json, manifest.json, and versions.json together", () => {
		expect(syncVersion({ rootDir: dir, version: "0.2.0" })).toEqual({
			version: "0.2.0",
			minAppVersion: "1.14.2",
		});
		expect(read("package.json").version).toBe("0.2.0");
		expect(read("manifest.json").version).toBe("0.2.0");
		expect(read("versions.json")).toEqual({ "0.1.0": "1.14.2", "0.2.0": "1.14.2" });
	});

	it("keeps other fields", () => {
		syncVersion({ rootDir: dir, version: "0.2.0" });
		expect(read("package.json").name).toBe("x");
		expect(read("manifest.json").id).toBe("unisastra");
	});

	it.each(["v0.2.0", "0.2", "1.2.3-beta", "", undefined])("rejects %j", (version) => {
		expect(() => syncVersion({ rootDir: dir, version: version as string })).toThrow(
			/Version must look like/,
		);
		expect(read("package.json").version).toBe("0.1.0");
	});
});
