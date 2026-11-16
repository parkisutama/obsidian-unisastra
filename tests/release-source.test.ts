// SPDX-License-Identifier: GPL-3.0-only
// Copyright (C) 2026 Parkis Utama

import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { verifyReleaseSource } from "../scripts/verify-release-source.mjs";

let rootDir: string;
let releaseSha: string;
function git(...args: string[]): string {
	return execFileSync(
		"git",
		[
			"-c",
			`core.hooksPath=${join(rootDir, "no-hooks")}`,
			"-c",
			"commit.gpgsign=false",
			"-c",
			"user.name=Fixture",
			"-c",
			"user.email=fixture@example.invalid",
			...args,
		],
		{
			cwd: rootDir,
			encoding: "utf8",
			stdio: ["ignore", "pipe", "pipe"],
			timeout: 10_000,
		},
	).trim();
}
beforeEach(() => {
	rootDir = mkdtempSync(join(tmpdir(), "unisastra-release-source-"));
	git("init");
	writeFileSync(join(rootDir, "manifest.json"), JSON.stringify({ version: "0.0.2" }));
	git("add", "manifest.json");
	git("commit", "-m", "fixture");
	releaseSha = git("rev-parse", "HEAD");
});
afterEach(() => {
	if (dirname(rootDir) !== tmpdir()) throw new Error("Fixture escaped temporary directory");
	rmSync(rootDir, { recursive: true, force: true });
});
const verify = (tagName = "0.0.2", eventSha = releaseSha) =>
	verifyReleaseSource({ rootDir, releaseSha, tagName, eventSha });

describe("release source identity", () => {
	it.each([false, true])("accepts a matching lightweight/annotated tag (%s)", (annotated) => {
		git("tag", ...(annotated ? ["-a", "0.0.2", "-m", "fixture tag"] : ["0.0.2"]));
		expect(verify()).toBe(releaseSha);
	});
	it("rejects a tag on a different commit with the same manifest version", () => {
		git("tag", "0.0.2");
		git("commit", "--allow-empty", "-m", "same version different source");
		releaseSha = git("rev-parse", "HEAD");
		expect(() => verify()).toThrow(/tag.*commit/i);
	});
	it("rejects a checkout that differs from the released source", () => {
		git("tag", "0.0.2");
		git("commit", "--allow-empty", "-m", "newer checkout");
		expect(() => verify()).toThrow(/checkout/i);
	});
	it("rejects an event SHA that would attest a different source", () => {
		git("tag", "0.0.2");
		expect(() => verify("0.0.2", "a".repeat(40))).toThrow(/event/i);
	});
	it("rejects a missing tag", () => {
		expect(() => verify()).toThrow(/tag/i);
	});
	it.each(["", "--upload-pack=other", "0.0.2^{commit}"])(
		"rejects invalid tag input %j",
		(tagName) => {
			expect(() => verify(tagName)).toThrow(/tag/i);
		},
	);
	it.each(["", "HEAD", "a".repeat(39)])("rejects invalid release SHA %j", (sha) => {
		expect(() =>
			verifyReleaseSource({ rootDir, releaseSha: sha, tagName: "0.0.2", eventSha: sha }),
		).toThrow(/SHA/i);
	});
	it("fails the real CLI closed on missing release output", () => {
		const script = fileURLToPath(new URL("../scripts/verify-release-source.mjs", import.meta.url));
		const result = spawnSync(process.execPath, [script], {
			cwd: rootDir,
			encoding: "utf8",
			timeout: 10_000,
			env: { ...process.env, RELEASE_SHA: "", TAG_NAME: "0.0.2", GITHUB_SHA: releaseSha },
		});
		expect(result.status).toBe(1);
		expect(result.stderr).toMatch(/SHA/i);
	});
});
