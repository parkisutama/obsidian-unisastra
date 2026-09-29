# Unisastra rebrand tasks

Status: Local implementation verified automatically; native Obsidian acceptance
and GitHub repository rename remain open.

- [x] T1 — Record accepted identity decision and exact identifier map in
  ADR-005. Acceptance: every changed contract has a defined new value.
- [x] T2 — Rename runtime identifiers and selectors with targeted tests.
  Acceptance: command, view, frontmatter, and CSS use Unisastra identifiers;
  editor behavior tests pass.
- [x] T3 — Rename package, build/release tooling, and documentation.
  Acceptance: built manifest and release workflow zip naming agree; active install docs and
  repository links use the chosen target slug.
- [x] T4 — Run full automated gate and review residual references.
  Acceptance: `pnpm run check:ci` passes and any old identifiers are either
  historical or documented.
- [x] T5 — Handover local result and native acceptance checklist.
  Acceptance: GitHub rename, push, release, and operational vault installation
  remain with the maintainer.

## Evidence — 2026-09-29

- `pnpm run check:ci`: 34 test files, 216 tests, typecheck, Biome, Obsidian
  ESLint, Stylelint, Markdown, build, artifact verification, and VitePress
  build passed for version `1.2.0`.
- `node scripts/outline-css-regression.cjs`: 440 browser checks passed.
- `node scripts/editor-css-regression.cjs`: 155 browser checks passed. Initial
  run revealed old camelCase fixture data attributes; they were corrected and
  the fixture passed on rerun.
- Settings UI classes using the old `tm-settings` prefix were renamed to
  `unisastra-settings` in rendering, styles, and navigation tests.
- Deploy guard test verifies that a built `unisastra` manifest cannot be copied
  into a plugin folder named `md-writer`.
- The release workflow is configured to create `unisastra.zip`; the zip itself
  has not been produced by this local gate.
- No operational vault deployment or native Obsidian acceptance was performed.

## Native acceptance for the maintainer

1. In a test vault, install the new plugin under
   `.obsidian/plugins/unisastra/` and enable it as Unisastra.
2. Confirm the command palette contains the Unisastra toggle command and
   existing writing/outliner actions still work.
3. Open and reopen the outline panel; confirm its layout and connector styles.
4. Check editor CSS features (dimming, whitespace, focus, toolbar) on the
   desktop themes used, then mobile and popout if those platforms are used.
5. In a test note, verify `unisastra: false` disables the expected editor
   behavior; the old `md-writer: false` key is intentionally unsupported.
6. Confirm the configured development deploy path, if any, ends in
   `.obsidian/plugins/unisastra` before running `pnpm run dev` or
   `pnpm run deploy`.

## GitHub handover

The local `origin` still points to
`https://github.com/parkisutama/obsidian-md-writer.git`. GitHub allows a
repository owner/admin to rename it in **Settings → General → Repository
name**. After renaming to `obsidian-unisastra`, update the local remote with
`git remote set-url origin https://github.com/parkisutama/obsidian-unisastra.git`
before pushing. GitHub redirects the old repository URL, but project site URLs
are an exception; this project has no known published documentation URL to
migrate. See [GitHub's rename guide](https://docs.github.com/en/repositories/creating-and-managing-repositories/renaming-a-repository).
