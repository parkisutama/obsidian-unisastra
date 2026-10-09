import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { deployPlugin } from "../scripts/lib/deploy-plugin";

const temporaryRoots: string[] = [];

function fixture(pluginId: string) {
	const root = mkdtempSync(join(tmpdir(), "unisastra-deploy-"));
	temporaryRoots.push(root);
	const distDir = join(root, "dist");
	mkdirSync(distDir);
	writeFileSync(join(distDir, "manifest.json"), JSON.stringify({ id: pluginId }));
	writeFileSync(join(distDir, "main.js"), "built");
	writeFileSync(join(distDir, "styles.css"), ".unisastra {}");
	const envPath = join(root, ".env");
	return { root, distDir, envPath };
}

afterEach(() => {
	for (const root of temporaryRoots.splice(0)) {
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
		const pluginDir = join(root, "vault", ".obsidian", "plugins", "unisastra");
		writeFileSync(envPath, `OBSIDIAN_VAULT_PLUGIN_PATH=${pluginDir}\n`);

		deployPlugin({ distDir, envPath, required: true });

		expect(readFileSync(join(pluginDir, "main.js"), "utf-8")).toBe("built");
		expect(JSON.parse(readFileSync(join(pluginDir, "manifest.json"), "utf-8")).id).toBe(
			"unisastra",
		);
	});
});
