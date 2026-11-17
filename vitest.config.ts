import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

process.env.TMPDIR ??= "/tmp";
process.env.TEMP ??= process.env.TMPDIR;
process.env.TMP ??= process.env.TMPDIR;

export default defineConfig({
	cacheDir: "node_modules/.cache/vitest",
	resolve: {
		alias: [
			{ find: "@", replacement: fileURLToPath(new URL("./src", import.meta.url)) },
			{
				find: /^obsidian$/,
				replacement: fileURLToPath(new URL("./tests/fixtures/obsidian.ts", import.meta.url)),
			},
		],
	},
	test: {
		environment: "node",
		include: ["tests/**/*.test.ts"],
		// Fail instead of passing silently when a filter or glob matches nothing.
		passWithNoTests: false,
		coverage: {
			provider: "v8",
			include: ["src/**/*.ts", "scripts/**/*.{ts,mjs}"],
			reporter: ["text-summary", "lcov"],
			// Ratchet, set just below the numbers measured on 2026-11-17 after QH-07 (39.41, 42.09, 33.55, 39.24; statements, branches, functions, lines). Most of the editor and UI
			// code is exercised only in Obsidian. Raise the floor as coverage grows; never lower it
			// to make a change pass.
			thresholds: { statements: 39, branches: 41, functions: 33, lines: 39 },
		},
	},
});
