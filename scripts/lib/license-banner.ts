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

export function floatyToolbarLicenseBanner(notice: string): string {
	return buildLicenseBanner(
		[
			"Unisastra includes code adapted from Floaty Toolbar by 0png, MIT licensed.",
			"https://github.com/0png/Floaty-Toolbar",
		],
		notice,
	);
}

export function writingFocusLicenseBanner(notice: string): string {
	return buildLicenseBanner(
		[
			"Unisastra includes code adapted from Obsidian Focus Mode by ryanpcmcquen, MPL-2.0 licensed.",
			"https://github.com/ryanpcmcquen/obsidian-focus-mode",
		],
		notice,
	);
}

export function mononoteLicenseBanner(notice: string): string {
	return buildLicenseBanner(
		[
			"Unisastra includes code adapted from MonoNote by Carlo Zottmann, MIT licensed.",
			"https://github.com/czottmann/obsidian-mononote",
		],
		notice,
	);
}
