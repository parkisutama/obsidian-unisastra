// SPDX-License-Identifier: GPL-3.0-only
// Copyright (C) 2025-2026 Parkis Utama

import {
	existsSync,
	linkSync,
	mkdirSync,
	mkdtempSync,
	readFileSync,
	rmdirSync,
	rmSync,
	symlinkSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { deployPlugin } from "../scripts/lib/deploy-plugin";

const temporaryRoots: string[] = [];
const runCLI = vi.hoisted(() => vi.fn());
vi.mock("node:child_process", () => ({ execFileSync: runCLI }));

function fixture(pluginId = "unisastra", configDir = ".obsidian") {
	const root = mkdtempSync(join(tmpdir(), "unisastra-deploy-"));
	temporaryRoots.push(root);
	const distDir = join(root, "dist");
	mkdirSync(distDir);
	writeFileSync(join(distDir, "manifest.json"), JSON.stringify({ id: pluginId }));
	writeFileSync(join(distDir, "main.js"), "built");
	writeFileSync(join(distDir, "styles.css"), ".unisastra {}");
	const envPath = join(root, ".env");
	const vaultDir = join(root, "vault");
	const pluginsDir = join(vaultDir, configDir, "plugins");
	mkdirSync(pluginsDir, { recursive: true });
	const pluginDir = join(pluginsDir, pluginId);
	writeFileSync(envPath, `OBSIDIAN_VAULT_PLUGIN_PATH=${pluginDir}\n`);
	runCLI.mockReset().mockReturnValue(`=> ${JSON.stringify({ vaultPath: vaultDir, configDir })}\n`);
	return { root, distDir, envPath, vaultDir, pluginsDir, pluginDir };
}

afterEach(() => {
	for (const root of temporaryRoots.splice(0)) {
		if (dirname(root) !== tmpdir()) throw new Error("Fixture escaped temporary directory");
		rmSync(root, { recursive: true, force: true });
	}
});

describe("plugin deployment", () => {
	it("rejects a stale MD Writer destination before writing any file", () => {
		const { root, distDir, envPath } = fixture("unisastra");
		const oldPluginDir = join(root, "vault", ".obsidian", "plugins", "md-writer");
		writeFileSync(envPath, `OBSIDIAN_VAULT_PLUGIN_PATH=${oldPluginDir}\n`);

		expect(() => deployPlugin({ distDir, envPath, required: true })).toThrow(
			'Configured plugin folder "md-writer" does not match built plugin ID "unisastra"',
		);
		expect(existsSync(oldPluginDir)).toBe(false);
	});

	it("deploys artifacts to a folder matching the built ID", () => {
		const { root, distDir, envPath } = fixture("unisastra");
		const pluginsDir = join(root, "vault", ".obsidian", "plugins");
		mkdirSync(pluginsDir, { recursive: true });
		const pluginDir = join(pluginsDir, "unisastra");
		writeFileSync(envPath, `OBSIDIAN_VAULT_PLUGIN_PATH=${pluginDir}\n`);

		deployPlugin({ distDir, envPath, required: true });

		expect(readFileSync(join(pluginDir, "main.js"), "utf-8")).toBe("built");
		expect(JSON.parse(readFileSync(join(pluginDir, "manifest.json"), "utf-8")).id).toBe(
			"unisastra",
		);
	});

	it("refuses to create a vault structure when the plugins folder does not exist", () => {
		const { root, distDir, envPath } = fixture("unisastra");
		const pluginDir = join(root, "no-vault", ".obsidian", "plugins", "unisastra");
		writeFileSync(envPath, `OBSIDIAN_VAULT_PLUGIN_PATH=${pluginDir}\n`);

		expect(() => deployPlugin({ distDir, envPath, required: true })).toThrow(
			"parent folder does not exist",
		);
		expect(existsSync(join(root, "no-vault"))).toBe(false);
	});

	it("fails an explicit deploy when no vault is configured", () => {
		const { distDir, envPath } = fixture("unisastra");
		writeFileSync(envPath, "OBSIDIAN_VAULT_PLUGIN_PATH=\n");

		expect(() => deployPlugin({ distDir, envPath, required: true })).toThrow(
			"OBSIDIAN_VAULT_PLUGIN_PATH",
		);
	});
	it("uses the running vault's custom config and a fixed read-only CLI query", () => {
		const f = fixture("unisastra", ".obsidian-desktop");
		deployPlugin({ ...f, required: true });
		expect(readFileSync(join(f.pluginDir, "main.js"), "utf8")).toBe("built");
		expect(runCLI).toHaveBeenCalledOnce();
		const [binary, args, options] = runCLI.mock.calls[0];
		expect(binary).toBe(process.platform === "win32" ? "Obsidian.com" : "obsidian");
		expect(args[0]).toBe("eval");
		expect(args[1]).toContain("app.vault.configDir");
		expect(args[1]).not.toContain(f.vaultDir);
		expect(options.cwd).toBe(f.vaultDir);
		expect(options.shell ?? false).toBe(false);
		expect(options.timeout).toBeGreaterThan(0);
	});
	it("rejects another selected vault even when the configured structure looks valid", () => {
		const f = fixture();
		const other = join(f.root, "other-vault");
		mkdirSync(other);
		runCLI.mockReturnValue(`=> ${JSON.stringify({ vaultPath: other, configDir: ".obsidian" })}`);
		expect(() => deployPlugin({ ...f, required: true })).toThrow(/vault.*match/i);
		expect(existsSync(f.pluginDir)).toBe(false);
	});
	it("rejects an inactive configuration folder before creating the plugin folder", () => {
		const f = fixture();
		mkdirSync(join(f.vaultDir, ".active", "plugins"), { recursive: true });
		runCLI.mockReturnValue(`=> ${JSON.stringify({ vaultPath: f.vaultDir, configDir: ".active" })}`);
		expect(() => deployPlugin({ ...f, required: true })).toThrow(/active config/i);
		expect(existsSync(f.pluginDir)).toBe(false);
	});
	it.each([
		"",
		"Error: Vault not found",
		"warning\n=> {}",
		"=> null",
		"=> []",
		'=> {"vaultPath":"relative","configDir":".obsidian"}',
	])("rejects invalid CLI metadata %j without falling back", (output) => {
		const f = fixture();
		runCLI.mockReturnValue(output);
		expect(() => deployPlugin({ ...f, required: true })).toThrow(/Obsidian CLI/i);
		expect(existsSync(f.pluginDir)).toBe(false);
	});
	it.each([".", "..", "../config", ".config/sub", ".config\\sub", "plain"])(
		"rejects invalid runtime config directory %j",
		(configDir) => {
			const f = fixture();
			runCLI.mockReturnValue(`=> ${JSON.stringify({ vaultPath: f.vaultDir, configDir })}`);
			expect(() => deployPlugin({ ...f, required: true })).toThrow(/config/i);
			expect(existsSync(f.pluginDir)).toBe(false);
		},
	);
	it("fails closed if the CLI is unavailable, including optional configured deployment", () => {
		const f = fixture();
		runCLI.mockImplementation(() => {
			throw new Error("ENOENT");
		});
		expect(() => deployPlugin(f)).toThrow(/Obsidian CLI/i);
		expect(existsSync(f.pluginDir)).toBe(false);
	});
	it("allows an explicit structural-only offline mode with an assurance warning", () => {
		const f = fixture();
		writeFileSync(
			f.envPath,
			`OBSIDIAN_VAULT_PLUGIN_PATH=${f.pluginDir}\nOBSIDIAN_DEPLOY_VERIFICATION=structural\n`,
		);
		const warning = vi.spyOn(console, "warn").mockImplementation(() => {});
		try {
			deployPlugin(f);
			expect(runCLI).not.toHaveBeenCalled();
			expect(warning).toHaveBeenCalledWith(expect.stringMatching(/active config.*not verified/i));
			expect(readFileSync(join(f.pluginDir, "main.js"), "utf8")).toBe("built");
		} finally {
			warning.mockRestore();
		}
	});
	it("rejects an unknown verification mode before writing", () => {
		const f = fixture();
		writeFileSync(
			f.envPath,
			`OBSIDIAN_VAULT_PLUGIN_PATH=${f.pluginDir}\nOBSIDIAN_DEPLOY_VERIFICATION=auto\n`,
		);
		expect(() => deployPlugin(f)).toThrow(/verification/i);
		expect(existsSync(f.pluginDir)).toBe(false);
	});
	it("skips unconfigured dev deployment without querying Obsidian", () => {
		const f = fixture();
		writeFileSync(f.envPath, "OBSIDIAN_VAULT_PLUGIN_PATH=\n");
		deployPlugin(f);
		expect(runCLI).not.toHaveBeenCalled();
	});
	it("rejects a whitespace-only required destination instead of reporting a skip", () => {
		const f = fixture();
		writeFileSync(f.envPath, "OBSIDIAN_VAULT_PLUGIN_PATH=   \n");
		expect(() => deployPlugin({ ...f, required: true })).toThrow(/OBSIDIAN_VAULT_PLUGIN_PATH/);
		expect(runCLI).not.toHaveBeenCalled();
	});
	it("accepts a vault root junction/alias when runtime canonical identity agrees", () => {
		const f = fixture();
		const alias = join(f.root, "vault-alias");
		symlinkSync(f.vaultDir, alias, process.platform === "win32" ? "junction" : "dir");
		writeFileSync(
			f.envPath,
			`OBSIDIAN_VAULT_PLUGIN_PATH=${join(alias, ".obsidian", "plugins", "unisastra")}\n`,
		);
		deployPlugin(f);
		expect(readFileSync(join(f.pluginDir, "main.js"), "utf8")).toBe("built");
	});
	it("rejects a redirected per-plugin folder", () => {
		const f = fixture();
		const outside = join(f.root, "outside");
		mkdirSync(outside);
		symlinkSync(outside, f.pluginDir, process.platform === "win32" ? "junction" : "dir");
		expect(() => deployPlugin(f)).toThrow(/link|redirect/i);
		expect(existsSync(join(outside, "main.js"))).toBe(false);
	});
	it("rejects a redirected plugins root even if the CLI names that config", () => {
		const f = fixture();
		const outside = join(f.root, "outside");
		mkdirSync(outside);
		rmdirSync(f.pluginsDir);
		symlinkSync(outside, f.pluginsDir, process.platform === "win32" ? "junction" : "dir");
		expect(() => deployPlugin(f)).toThrow(/plugins.*link|plugins.*redirect/i);
		expect(existsSync(join(outside, "unisastra"))).toBe(false);
	});
	it("rejects a hardlinked destination before overwriting any existing artifact", () => {
		const f = fixture();
		mkdirSync(f.pluginDir);
		writeFileSync(join(f.pluginDir, "main.js"), "original");
		const outside = join(f.root, "outside.css");
		writeFileSync(outside, "external");
		linkSync(outside, join(f.pluginDir, "styles.css"));
		expect(() => deployPlugin(f)).toThrow(/linked|regular/i);
		expect(readFileSync(join(f.pluginDir, "main.js"), "utf8")).toBe("original");
		expect(readFileSync(outside, "utf8")).toBe("external");
	});
	it("checks every destination file type before the first copy", () => {
		const f = fixture();
		mkdirSync(f.pluginDir);
		writeFileSync(join(f.pluginDir, "main.js"), "original");
		mkdirSync(join(f.pluginDir, "styles.css"));
		expect(() => deployPlugin(f)).toThrow(/regular/i);
		expect(readFileSync(join(f.pluginDir, "main.js"), "utf8")).toBe("original");
	});
	it("checks every source file type before overwriting any destination", () => {
		const f = fixture();
		mkdirSync(f.pluginDir);
		writeFileSync(join(f.pluginDir, "main.js"), "original");
		rmSync(join(f.distDir, "styles.css"));
		mkdirSync(join(f.distDir, "styles.css"));
		expect(() => deployPlugin(f)).toThrow(/regular/i);
		expect(readFileSync(join(f.pluginDir, "main.js"), "utf8")).toBe("original");
	});
	it("rejects a dangling plugin folder junction before copying", () => {
		const f = fixture();
		symlinkSync(
			join(f.root, "missing"),
			f.pluginDir,
			process.platform === "win32" ? "junction" : "dir",
		);
		expect(() => deployPlugin(f)).toThrow(/link|redirect/i);
		expect(existsSync(join(f.root, "missing"))).toBe(false);
	});
	it("accepts a config alias pointing to the active canonical config directory", () => {
		const f = fixture();
		symlinkSync(
			join(f.vaultDir, ".obsidian"),
			join(f.vaultDir, ".alias"),
			process.platform === "win32" ? "junction" : "dir",
		);
		writeFileSync(
			f.envPath,
			`OBSIDIAN_VAULT_PLUGIN_PATH=${join(f.vaultDir, ".alias", "plugins", "unisastra")}\n`,
		);
		deployPlugin(f);
		expect(readFileSync(join(f.pluginDir, "main.js"), "utf8")).toBe("built");
	});
	it("rejects a destination outside the plugins hierarchy before querying the CLI", () => {
		const f = fixture();
		const parent = join(f.vaultDir, ".obsidian", "other");
		mkdirSync(parent);
		writeFileSync(f.envPath, `OBSIDIAN_VAULT_PLUGIN_PATH=${join(parent, "unisastra")}\n`);
		expect(() => deployPlugin(f)).toThrow(/plugins/i);
		expect(runCLI).not.toHaveBeenCalled();
		expect(existsSync(join(parent, "unisastra"))).toBe(false);
	});
});
