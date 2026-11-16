// SPDX-License-Identifier: GPL-3.0-only
// Copyright (C) 2026 Parkis Utama

import { execFileSync } from "node:child_process";
import { isAbsolute } from "node:path";

/** Read both fields in one host snapshot; never interpolate deployment input into eval. */
export function readActiveVault(vaultPath: string): { vaultPath: string; configDir: string } {
	let output: string;
	try {
		output = execFileSync(
			process.platform === "win32" ? "Obsidian.com" : "obsidian",
			[
				"eval",
				"code=JSON.stringify({vaultPath:app.vault.adapter.getBasePath(),configDir:app.vault.configDir})",
			],
			{
				cwd: vaultPath,
				encoding: "utf8",
				timeout: 10_000,
				maxBuffer: 64 * 1024,
				windowsHide: true,
			},
		);
	} catch (cause) {
		throw new Error(
			"Cannot query Obsidian CLI. Enable the CLI and open the target vault, or explicitly select structural verification for offline use.",
			{ cause },
		);
	}
	try {
		const data: unknown = JSON.parse(output.trim().replace(/^=>\s*/, ""));
		if (
			!data ||
			typeof data !== "object" ||
			Array.isArray(data) ||
			!("vaultPath" in data) ||
			typeof data.vaultPath !== "string" ||
			!isAbsolute(data.vaultPath) ||
			!("configDir" in data) ||
			typeof data.configDir !== "string"
		) {
			throw new Error("Invalid metadata shape");
		}
		return { vaultPath: data.vaultPath, configDir: data.configDir };
	} catch (cause) {
		throw new Error(
			"Obsidian CLI did not return valid vault/config metadata; deployment stopped.",
			{ cause },
		);
	}
}
