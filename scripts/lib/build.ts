import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { builtinModules } from "node:module";
import esbuild from "esbuild";
import { compile as sassCompile } from "sass";
import {
	floatyToolbarLicenseBanner,
	mononoteLicenseBanner,
	writingFocusLicenseBanner,
} from "./license-banner.ts";

const LEADING_BOM = /^﻿/;

const THIRD_PARTY_NOTICES = [
	{
		banner: floatyToolbarLicenseBanner,
		distName: "floaty-toolbar-MIT.txt",
		sourcePath: "licenses/floaty-toolbar-MIT.txt",
	},
	{
		banner: writingFocusLicenseBanner,
		distName: "writing-focus-MPL2.0.txt",
		sourcePath: "licenses/writing-focus-MPL2.0.txt",
	},
	{
		banner: mononoteLicenseBanner,
		distName: "mononote-MIT.txt",
		sourcePath: "licenses/mononote-MIT.txt",
	},
] as const;

export interface BuildOptions {
	entrypoints?: {
		main?: string;
		styles?: string;
	};
	format?: "cjs" | "esm";
	minify?: boolean;
	outDir?: string;
	rootDir?: string;
	srcDir?: string;
	stripDebug?: boolean;
}

export async function build({
	rootDir = ".",
	srcDir = "src",
	entrypoints: { main = "main.ts", styles = "styles/index.scss" } = {},
	outDir = "dist",
	format = "cjs",
	minify = false,
	stripDebug = false,
}: BuildOptions = {}) {
	// Create outdir
	mkdirSync(`${rootDir}/${outDir}`, { recursive: true });

	// Build scss
	console.log("Building styles");
	const scssResult = sassCompile(`${rootDir}/${srcDir}/${styles}`, {
		style: "compressed",
	});
	// Dart Sass prepends a UTF-8 BOM when the compiled output contains
	// non-ASCII characters. Obsidian injects this file's contents directly as
	// a <style> element's text, and a leading BOM there corrupts the parse of
	// the very first CSS rule (it's silently dropped), so strip it here.
	const css = scssResult.css.replace(LEADING_BOM, "");
	writeFileSync(`${rootDir}/${outDir}/styles.css`, css);

	console.log("Copying manifest");
	copyFileSync(`${rootDir}/manifest.json`, `${rootDir}/${outDir}/manifest.json`);

	console.log("Copying license notices");
	const licensesOutDir = `${rootDir}/${outDir}/licenses`;
	mkdirSync(licensesOutDir, { recursive: true });
	const noticeBanners = THIRD_PARTY_NOTICES.map(({ banner, distName, sourcePath }) => {
		const notice = readFileSync(`${rootDir}/${sourcePath}`, "utf-8");
		copyFileSync(`${rootDir}/${sourcePath}`, `${licensesOutDir}/${distName}`);
		return banner(notice);
	});

	// Build js
	console.log("Building main");
	const esbuildFormat = format === "cjs" ? "cjs" : "esm";
	await esbuild.build({
		entryPoints: [`${rootDir}/${srcDir}/${main}`],
		outdir: `${rootDir}/${outDir}`,
		bundle: true,
		minifyWhitespace: minify,
		minifyIdentifiers: minify,
		minifySyntax: minify || stripDebug,
		sourcemap: minify ? false : "inline",
		target: "es2022",
		platform: "browser",
		format: esbuildFormat,
		// Embedded raw (not run through the minifier), so the notices survive a
		// minified/stripDebug build the same as an unminified dev build.
		banner: { js: noticeBanners.join("\n") },
		// `drop: ["console"]` removes every console.* call; `pure` + minifySyntax
		// only eliminates the specific debug/log calls listed here, so
		// console.error/console.warn survive into the production bundle.
		pure: stripDebug ? ["console.log", "console.debug"] : [],
		external: [
			"obsidian",
			"electron",
			"@electron/remote",
			"@codemirror/autocomplete",
			"@codemirror/collab",
			"@codemirror/commands",
			"@codemirror/language",
			"@codemirror/lint",
			"@codemirror/search",
			"@codemirror/state",
			"@codemirror/view",
			"@lezer/common",
			"@lezer/highlight",
			"@lezer/lr",
			...builtinModules,
		],
	});
}
