import { build } from "./lib/build";

await build({
	entrypoints: { main: "main.ts" },
	outDir: "dist",
	format: "cjs",
	minify: true,
	stripDebug: true,
});
