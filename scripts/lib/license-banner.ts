// SPDX-License-Identifier: GPL-3.0-only
// Copyright (C) 2025-2026 Parkis Utama

/**
 * Renders a third-party notice as a `/*! ... *\/` banner comment. esbuild's
 * `banner` option prepends this text to the built output unmodified —
 * unlike ordinary source comments, it survives a minified build, since it
 * is added after minification rather than parsed by it. Both build.ts (to
 * embed it) and artifact-verification.ts (to check it wasn't lost or
 * edited out of sync with the source notice file) call this with the same
 * source text, so there is one place that defines the exact expected
 * banner.
 */
export function buildLicenseBanner(headerLines: readonly string[], notice: string): string {
	const noticeLines = notice.trimEnd().split("\n");
	return [
		"/*!",
		...headerLines.map((line) => ` * ${line}`),
		" *",
		...noticeLines.map((line) => (line ? ` * ${line}` : " *")),
		" */",
	].join("\n");
}

/** Repository folder that holds the upstream notice files. */
export const NOTICES_SOURCE_DIR = "third-party-notices";
/** Folder inside `dist/` the notice files are shipped in. */
export const NOTICES_DIST_DIR = "licenses";

export interface ThirdPartyNotice {
	/** File name, the same in `NOTICES_SOURCE_DIR` and in `dist/licenses/`. */
	fileName: string;
	/** Short name used in verification messages. */
	label: string;
	/** Renders the `dist/main.js` banner for the notice text. */
	banner: (notice: string) => string;
}

function notice(fileName: string, label: string, headerLines: readonly string[]): ThirdPartyNotice {
	return { fileName, label, banner: (text) => buildLicenseBanner(headerLines, text) };
}

/**
 * Every upstream whose code ships in the plugin. The build embeds each notice in `dist/main.js`
 * and copies it to `dist/licenses/`; artifact verification checks both. Add an upstream here and
 * its notice file under `third-party-notices/`, and the build, the verification, and the tests
 * pick it up.
 */
export const THIRD_PARTY_NOTICES: readonly ThirdPartyNotice[] = [
	notice("typewriter-mode-MIT.txt", "Typewriter Mode MIT", [
		"Unisastra is derived from Typewriter Mode by Davis Riedel, MIT licensed.",
		"https://github.com/davisriedel/obsidian-typewriter-mode",
	]),
	notice("typewriter-scroll-MIT.txt", "Typewriter Scroll MIT", [
		"Unisastra includes code from Typewriter Scroll by death_au, MIT licensed, inherited through Typewriter Mode.",
		"https://github.com/deathau/cm-typewriter-scroll-obsidian",
	]),
	notice("obsidian-zoom-MIT.txt", "Obsidian Zoom MIT", [
		"Unisastra includes code adapted from Obsidian Zoom by Viacheslav Slinko, MIT licensed.",
		"https://github.com/vslinko/obsidian-zoom",
	]),
	notice("floaty-toolbar-MIT.txt", "Floaty Toolbar MIT", [
		"Unisastra includes code adapted from Floaty Toolbar by 0png, MIT licensed.",
		"https://github.com/0png/Floaty-Toolbar",
	]),
	notice("writing-focus-MPL2.0.txt", "Obsidian Focus Mode MPL-2.0", [
		"Unisastra includes code adapted from Obsidian Focus Mode by ryanpcmcquen, MPL-2.0 licensed.",
		"https://github.com/ryanpcmcquen/obsidian-focus-mode",
	]),
	notice("mononote-MIT.txt", "MonoNote MIT", [
		"Unisastra includes code adapted from MonoNote by Carlo Zottmann, MIT licensed.",
		"https://github.com/czottmann/obsidian-mononote",
	]),
	notice("remember-cursor-position-MIT.txt", "Remember Cursor Position MIT", [
		"Unisastra includes code adapted from Remember Cursor Position by Dmitry Savosh, MIT licensed.",
		"https://github.com/dy-sh/obsidian-remember-cursor-position",
	]),
	notice("focus-active-sentence-MIT.txt", "Focus Active Sentence MIT", [
		"Unisastra includes code adapted from Focus Active Sentence by artisticat, MIT licensed.",
		"https://github.com/artisticat1/focus-active-sentence",
	]),
];

const bannerFor = (fileName: string) => {
	const found = THIRD_PARTY_NOTICES.find((entry) => entry.fileName === fileName);
	if (!found) throw new Error(`No third-party notice named ${fileName}`);
	return found.banner;
};

export const floatyToolbarLicenseBanner = bannerFor("floaty-toolbar-MIT.txt");
