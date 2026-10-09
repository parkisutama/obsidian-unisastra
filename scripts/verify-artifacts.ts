// SPDX-License-Identifier: GPL-3.0-only
// Copyright (C) 2025-2026 Parkis Utama

import { verifyArtifacts } from "./lib/artifact-verification.ts";

try {
	const version = verifyArtifacts();
	console.log(`Artifacts verified for version ${version}.`);
} catch (error) {
	const message = error instanceof Error ? error.message : String(error);
	console.error(message);
	process.exit(1);
}
