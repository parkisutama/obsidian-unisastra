# Unisastra rebrand implementation plan

Status: Local implementation authorized by maintainer on 2026-09-29.

1. Record the identity decision in ADR-005 and inventory current source,
   selectors, tests, scripts, metadata, and active documentation.
2. Change the manifest ID/name, command key, view type, frontmatter key, CSS
   prefix, and internal product-named types together with their consumers.
   Keep editor algorithms and settings schema unchanged.
3. Update package metadata, lockfile, release archive naming, development
   fixture path, GitHub URL references, VitePress source configuration, and
   active installation docs.
4. Add focused identity regression checks. Run targeted tests, then
   `pnpm run check` and `pnpm run check:ci`. Repair concrete failures.
5. Review residual old-name matches by category: historical records, active
   product text, old identifiers, and third-party attribution. Update current
   state, architecture baseline, development status, and changelog.

The remote GitHub repository remains named `obsidian-md-writer` until the
maintainer renames it to `obsidian-unisastra`. Local source URLs point to the
target name; Git remote configuration is left untouched.
