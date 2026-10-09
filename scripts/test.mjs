import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";

const vitestBin = fileURLToPath(new URL("../node_modules/vitest/vitest.mjs", import.meta.url));
const temporaryDirectory = process.platform === "win32" ? tmpdir() : "/tmp";
const result = spawnSync(process.execPath, [vitestBin, "run"], {
	env: {
		...process.env,
		TEMP: temporaryDirectory,
		TMP: temporaryDirectory,
		TMPDIR: temporaryDirectory,
	},
	stdio: "inherit",
});

if (result.error) {
	throw result.error;
}

process.exit(result.status ?? 1);
