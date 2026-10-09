import { spawnSync } from "node:child_process";
import { chmodSync, existsSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const workspaceRoot = resolve(__dirname, "..");
const rumdlBin = resolve(workspaceRoot, "node_modules/rumdl/bin/rumdl");
const rumdlPackageDir = resolve(workspaceRoot, "node_modules/@rumdl");

function ensureRumdlBinariesAreExecutable() {
	if (process.platform === "win32" || !existsSync(rumdlPackageDir)) {
		return;
	}

	for (const entry of readdirSync(rumdlPackageDir, { withFileTypes: true })) {
		if (!entry.isDirectory()) {
			continue;
		}

		const binaryPath = join(rumdlPackageDir, entry.name, "rumdl");
		if (!existsSync(binaryPath)) {
			continue;
		}

		chmodSync(binaryPath, 0o755);
	}
}

ensureRumdlBinariesAreExecutable();

const result = spawnSync(process.execPath, [rumdlBin, ...process.argv.slice(2)], {
	cwd: workspaceRoot,
	stdio: "inherit",
});

if (result.error) {
	throw result.error;
}

process.exit(result.status ?? 1);
