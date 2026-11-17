# Quality hardening spec

Status: Authorized 2026-11-16 for S1 to S4 and QH-03, on one branch and one pull request. The QH-03 plan still needs maintainer validation before its implementation.
Date: 2026-11-16.
Source baseline: `f2ae9af1705777edde86015dbf2c0f3ac4a16c39`.
Source requirements: [quality audit](../../audit/2026-11-16-quality-pass/REPORT.md).

## Problem

Settings normalization writes into the shared `DEFAULT_SETTINGS` object, risky editor
logic has little automated coverage, and the release path has no explicit rule that a
fix must pass through the existing gates before a patch version ships.

## Scope

- QH-01: `applyStartupMigrations` never mutates `DEFAULT_SETTINGS`.
- QH-02: tests for folding, outliner keyboard operations and list operations that fail
  when the logic breaks; coverage floor raised to the measured result.
- QH-03: split `src/components/outline-view.ts` by task, with no behavior change (own spec: [outline-view-split](../outline-view-split/spec.md)).
- QH-04, QH-05: small tooling hygiene.
- Repository policy: `verify`, `test-windows` and `commitlint` are required checks on `main`.
- Release: ship 0.0.2 through the existing release-please flow after S1, S3 and QH-03 are merged.

## Non-goals

- No new CI system, SBOM tooling or extra release service.
- No change to plugin ID, command IDs, settings keys, frontmatter keys or Markdown block IDs.

## Acceptance criteria

1. **QH-01.** A test calls `applyStartupMigrations` with data that lacks `foldPersist`,
   writes to the returned group, and asserts `DEFAULT_SETTINGS` is unchanged. It fails
   before the fix and passes after. Every existing settings test still passes.
   The persisted `data.json` shape and every settings key stay the same.
2. **QH-02.** Per-file coverage is measured and recorded first. Each added test is shown
   to fail when the targeted condition is inverted, then the file is restored. The floor
   in `vitest.config.ts` is raised to just below the new measured numbers and is never lowered.
3. **QH-04.** The `minimatch` override has a comment with a review date and removal condition.
4. **QH-05.** `setup-test-vault.ts` writes `community-plugins.json` through `JSON.stringify`.
5. **Release.** The fix appears in the changelog under Fixed, the Release PR passes the
   full CI gate, the tag equals the manifest version, and the published files carry a
   provenance attestation that verifies against the tagged commit.
6. **Runtime.** Acceptance in Obsidian is recorded separately. Until observed, it is
   listed as untested, not shipped-ready.

## Compatibility contract

Existing `data.json` files must load to the same effective settings as before, except
that default objects are no longer shared. Legacy-format migration and the callout, toolbar
and fold-state normalizers keep their current behavior.
