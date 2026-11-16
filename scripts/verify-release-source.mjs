// SPDX-License-Identifier: GPL-3.0-only
// Copyright (C) 2026 Parkis Utama

import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

export function verifyReleaseSource({
	rootDir = ".",
	releaseSha = "",
	tagName = "",
	eventSha = "",
} = {}) {
	if (!/^[a-f0-9]{40}$/.test(releaseSha)) {
		throw new Error("Missing or invalid release SHA");
	}
	if (!/^\d+\.\d+\.\d+$/.test(tagName)) {
		throw new Error("Missing or invalid release tag");
	}
	// The attestation uses workflow/OIDC identity, not an arbitrary checkout ref.
	if (eventSha !== releaseSha) {
		throw new Error("Workflow event SHA differs from released source");
	}
	const commit = (ref) =>
		execFileSync("git", ["rev-parse", "--verify", ref], {
			cwd: rootDir,
			encoding: "utf8",
			stdio: ["ignore", "pipe", "pipe"],
		}).trim();
	if (commit("HEAD") !== releaseSha) {
		throw new Error("Checkout differs from released source");
	}
	let tagCommit;
	try {
		tagCommit = commit(`refs/tags/${tagName}^{commit}`);
	} catch (cause) {
		throw new Error("Release tag commit is unavailable", { cause });
	}
	if (tagCommit !== releaseSha) {
		throw new Error("Release tag points to a different commit");
	}
	return releaseSha;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
	try {
		const sha = verifyReleaseSource({
			releaseSha: process.env.RELEASE_SHA,
			tagName: process.env.TAG_NAME,
			eventSha: process.env.GITHUB_SHA,
		});
		console.log(`Verified release source: ${sha}`);
	} catch (error) {
		console.error(error instanceof Error ? error.message : String(error));
		process.exitCode = 1;
	}
}
