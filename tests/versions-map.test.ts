// SPDX-License-Identifier: GPL-3.0-only
// Copyright (C) 2026 Parkis Utama

import { describe, expect, it } from "vitest";
import { compareVersions, minAppVersionFor, versionsMapProblem } from "../scripts/versions-map.mjs";

describe("compareVersions", () => {
	it("orders by number, not by text", () => {
		expect(compareVersions("0.9.0", "0.10.0")).toBeLessThan(0);
		expect(compareVersions("1.0.0", "0.99.99")).toBeGreaterThan(0);
		expect(compareVersions("1.2.3", "1.2.3")).toBe(0);
	});

	it("rejects anything that is not x.y.z", () => {
		expect(() => compareVersions("v1.0.0", "1.0.0")).toThrow(/Not a plugin version/);
	});
});

describe("minAppVersionFor", () => {
	const versions = { "0.0.1": "1.14.4", "0.3.0": "1.15.0", "0.10.0": "1.16.0" };

	it("uses the entry of the version itself", () => {
		expect(minAppVersionFor(versions, "0.3.0")).toBe("1.15.0");
	});

	it("inherits the entry of the nearest earlier version", () => {
		expect(minAppVersionFor(versions, "0.2.5")).toBe("1.14.4");
		expect(minAppVersionFor(versions, "0.9.9")).toBe("1.15.0");
		expect(minAppVersionFor(versions, "1.0.0")).toBe("1.16.0");
	});

	it("returns null when every entry is later", () => {
		expect(minAppVersionFor({ "0.2.0": "1.14.4" }, "0.1.0")).toBeNull();
	});
});

describe("versionsMapProblem", () => {
	it("accepts a release that did not change the minimum app version", () => {
		expect(
			versionsMapProblem({ "0.0.1": "1.14.4" }, { version: "0.0.2", minAppVersion: "1.14.4" }),
		).toBeNull();
	});

	it("reports a raised minimum app version without a new entry", () => {
		expect(
			versionsMapProblem({ "0.0.1": "1.14.4" }, { version: "0.1.0", minAppVersion: "1.15.0" }),
		).toMatch(/assigns minimum app version 1\.14\.4 to 0\.1\.0.*add "0\.1\.0": "1\.15\.0"/);
	});

	it("reports a versions.json with no applicable entry", () => {
		expect(versionsMapProblem({}, { version: "0.0.1", minAppVersion: "1.14.4" })).toMatch(
			/no entry at or before 0\.0\.1/,
		);
	});
});
