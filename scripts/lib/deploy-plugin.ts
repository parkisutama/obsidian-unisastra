// SPDX-License-Identifier: GPL-3.0-only
// Copyright (C) 2025-2026 Parkis Utama

import {
	copyFileSync,
	existsSync,
	lstatSync,
	mkdirSync,
	readFileSync,
	realpathSync,
} from "node:fs";
import { basename, dirname, join, relative, resolve } from "node:path";
import { readActiveVault } from "./obsidian-vault.ts";

const DIST_FILES = ["main.js", "styles.css", "manifest.json"] as const;
const OBSIDIAN_VAULT_PLUGIN_PATH_PATTERN = /^OBSIDIAN_VAULT_PLUGIN_PATH=(.+)$/m;

interface DeployPluginOptions {
	distDir?: string;
	envPath?: string;
	required?: boolean;
}

function readPluginDir(
	envPath: string,
	required: boolean,
): { pluginDir: string; verification: "runtime" | "structural" } | null {
	if (!existsSync(envPath)) {
		if (required) {
			throw new Error("Missing .env file. Create one with OBSIDIAN_VAULT_PLUGIN_PATH=<path>");
		}

		return null;
	}

	const envText = readFileSync(envPath, "utf-8");
	const match = envText.match(OBSIDIAN_VAULT_PLUGIN_PATH_PATTERN);
	if (!match?.[1].trim()) {
		if (required) {
			throw new Error("OBSIDIAN_VAULT_PLUGIN_PATH not found in .env");
		}

		return null;
	}

	const verification =
		envText.match(/^OBSIDIAN_DEPLOY_VERIFICATION=(.*)$/m)?.[1].trim() || "runtime";
	if (verification !== "runtime" && verification !== "structural") {
		throw new Error("Invalid deployment verification mode; use runtime or structural");
	}
	return { pluginDir: match[1].trim(), verification };
}

function existingEntry(path: string) {
	try {
		return lstatSync(path);
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
		throw error;
	}
}

function verifiedPluginDir(pluginDir: string, verification: "runtime" | "structural"): string {
	const pluginsDir = dirname(resolve(pluginDir));
	const configPath = dirname(pluginsDir);
	const vaultPath = dirname(configPath);
	if (basename(pluginsDir) !== "plugins") {
		throw new Error("Deployment target must use <vault>/<config>/plugins/<plugin-id>");
	}
	const active =
		verification === "runtime"
			? readActiveVault(vaultPath)
			: { vaultPath, configDir: basename(configPath) };
	if (
		![basename(configPath), active.configDir].every(
			(name) => /^\.[^/\\\p{Cc}]+$/u.test(name) && name !== "..",
		)
	) {
		throw new Error("Invalid Obsidian config directory name");
	}
	if (relative(realpathSync(vaultPath), realpathSync(active.vaultPath)) !== "") {
		throw new Error("Obsidian CLI vault does not match the configured target vault");
	}
	const activeConfigPath = realpathSync(join(active.vaultPath, active.configDir));
	if (relative(realpathSync(configPath), activeConfigPath) !== "") {
		throw new Error("Deployment target does not match the active config directory");
	}
	const canonicalPlugins = realpathSync(pluginsDir);
	if (relative(join(activeConfigPath, "plugins"), canonicalPlugins) !== "") {
		throw new Error("The plugins root is linked or redirected outside the verified config");
	}
	const entry = existingEntry(pluginDir);
	if (entry && (!entry.isDirectory() || entry.isSymbolicLink())) {
		throw new Error("The plugin folder is linked, redirected, or not a directory");
	}
	if (verification === "structural") {
		console.warn("Structural verification only: active config is not verified by Obsidian.");
	}
	return join(canonicalPlugins, basename(resolve(pluginDir)));
}

export function deployPlugin({
	distDir = "./dist",
	envPath = "./.env",
	required = false,
}: DeployPluginOptions = {}) {
	const target = readPluginDir(envPath, required);
	if (!target?.pluginDir) {
		console.log("Skipping Obsidian vault deploy; OBSIDIAN_VAULT_PLUGIN_PATH not set");
		return;
	}
	const { pluginDir, verification } = target;

	for (const file of DIST_FILES) {
		const sourcePath = resolve(distDir, file);
		if (!existsSync(sourcePath)) {
			throw new Error(`Missing dist/${file}; run the build first`);
		}
		if (!lstatSync(sourcePath).isFile()) {
			throw new Error(`dist/${file} must be a regular file`);
		}
	}

	const manifest = JSON.parse(readFileSync(resolve(distDir, "manifest.json"), "utf-8")) as {
		id?: string;
	};
	const destinationId = basename(resolve(pluginDir));
	if (typeof manifest.id !== "string" || !manifest.id || destinationId !== manifest.id) {
		throw new Error(
			`Configured plugin folder "${destinationId}" does not match built plugin ID "${manifest.id ?? "missing"}". Update OBSIDIAN_VAULT_PLUGIN_PATH before deploying.`,
		);
	}

	// A typo in .env must not create a stray vault structure: only the plugin folder itself is
	// created, inside a plugins folder that already exists.
	const pluginsDir = dirname(resolve(pluginDir));
	if (!existsSync(pluginsDir)) {
		throw new Error(
			`OBSIDIAN_VAULT_PLUGIN_PATH: parent folder does not exist: ${pluginsDir}. Point it at the plugin folder inside an existing vault.`,
		);
	}

	const destination = verifiedPluginDir(pluginDir, verification);
	for (const file of DIST_FILES) {
		const entry = existingEntry(join(destination, file));
		if (entry && (!entry.isFile() || entry.nlink !== 1)) {
			throw new Error(`Destination ${file} must be a regular, unlinked file`);
		}
	}
	if (!existsSync(destination)) {
		mkdirSync(destination);
		console.log(`Created ${destination}`);
	}

	for (const file of DIST_FILES) {
		const sourcePath = resolve(distDir, file);
		const destinationPath = resolve(destination, file);
		copyFileSync(sourcePath, destinationPath);
		console.log(`Copied dist/${file} to ${destinationPath}`);
	}

	console.log(`Deployed to ${destination}`);
}
