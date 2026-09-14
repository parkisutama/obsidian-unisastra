/**
 * Renders the Floaty Toolbar MIT notice as a `/*! ... *\/` banner comment.
 * esbuild's `banner` option prepends this text to the built output
 * unmodified — unlike ordinary source comments, it survives a minified
 * build, since it is added after minification rather than parsed by it.
 * Both build.ts (to embed it) and artifact-verification.ts (to check it
 * wasn't lost or edited out of sync with the source notice file) call this
 * with the same source text, so there is one place that defines the exact
 * expected banner.
 */
export function floatyToolbarLicenseBanner(notice: string): string {
  const lines = notice.trimEnd().split("\n");
  return [
    "/*!",
    " * MD Writer includes code adapted from Floaty Toolbar by 0png, MIT licensed.",
    " * https://github.com/0png/Floaty-Toolbar",
    " *",
    ...lines.map((line) => (line ? ` * ${line}` : " *")),
    " */",
  ].join("\n");
}
