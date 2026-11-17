# Quality hardening implementation plan

Status: Authorized 2026-11-16. Maintainer decisions: one branch and one pull request for all slices; QH-03 lands before 0.0.2; release 0.0.2 after S3 and QH-03.
Date: 2026-11-16.
Source baseline: `f2ae9af1705777edde86015dbf2c0f3ac4a16c39`.
Requirements: [spec.md](spec.md). Evidence: [quality audit](../../audit/2026-11-16-quality-pass/REPORT.md).
Working branch: `claude/quality-hardening`, one commit per slice, one pull request.

## Execution rules

- One writer, sequential slices, one pull request, squash-merged. The pull request title becomes
  the only commit on `main`, so it must be `fix: ...` for release-please to propose a patch;
  the `test`, `refactor` and `chore` commits inside it are not read. Keep the title honest:
  it names the settings fix.
- Run target code (tests, builds, probes) inside bubblewrap, as the sibling repo
  `obsidian-unimian` does: all namespaces unshared, no network, cleared environment,
  read-only source and toolchain, tmpfs scratch, process and time limits. Do not let
  `pnpm run` install packages; install once, outside the sandbox, from the frozen lockfile.
- Checkpoint after S1 and after S3.

## Slices

| Slice | Requirement | Depends on | Size | Commit type |
| --- | --- | --- | --- | --- |
| S1 | QH-01 settings defaults isolation | None | Small | `fix` |
| S2 | QH-04, QH-05 tooling hygiene | None | XS | `chore` |
| S3 | QH-02 coverage for risky editor logic | S1 | Medium | `test` |
| S4 | Release the fix as 0.0.2 | S1, S3 and S5 merged | Small | release-please |
| S5 | QH-03 split `outline-view.ts` | S3 | Medium–large | `refactor` |
| S6 | Required checks on `main` | GitHub login | XS | none (repository setting) |

QH-03 (S5) is in scope, after S3 gives it a safety net. A `refactor:` commit is hidden in the
changelog and does not raise the version (pre-1.0 config: `fix` and `feat` raise the patch,
only a breaking change raises the minor), so it ships inside 0.0.2 without a changelog entry.
It needs its own spec and plan, validated before implementation:
[outline-view-split](../outline-view-split/spec.md).
One large pull request raises review and regression risk; the order inside the branch keeps
S1 and S3 independently reviewable commits.

### S1: settings defaults isolation

**Approach:** write the failing regression test in `tests/settings.test.ts` first.
Then make `applyStartupMigrations` start from fresh objects: clone `DEFAULT_SETTINGS`
once per call and keep the existing per-group merge. Grep every spread of
`DEFAULT_SETTINGS` (`migrateSettings`, `mergeWritingModeSettings`, normalizers) and
cover the legacy-format branch with the same assertion.

**Risk:** a clone that drops a non-cloneable value. The defaults are plain data; the
test compares the cloned result to the old result for several inputs.
**Files:** `src/capabilities/settings.ts`, `tests/settings.test.ts`.
**Gate:** `pnpm run check`, then `pnpm run verify` in the sandbox.

### S2: tooling hygiene

Add a dated comment on the `minimatch` override in `pnpm-workspace.yaml`
(removal condition: the transitive dependency moves past the advisory range).
Replace the template string in `scripts/lib/setup-test-vault.ts` with
`JSON.stringify([pluginName])`, with a test if the helper has none.
Internal tooling needs no changelog entry.

### S3: coverage for risky editor logic

1. Measure per-file coverage for `src/cm6/outliner/keyboard-ops.ts`,
   `src/cm6/list-service.ts` and `src/cm6/outliner/fold-persist.ts`; record it in tasks.md.
2. For each, write behavior tests over indent, outdent, move up and down, fold capture and
   restore, including empty list, last item and mixed indentation.
3. Per the review skill, prove each test by inverting one condition, running the suite,
   and restoring the file.
4. Raise the thresholds in `vitest.config.ts` to just below the new totals.

Browser or Obsidian-only behavior stays under native acceptance; do not fake it with mocks.

### S6: required checks on `main`

A repository setting, not a file. Required status checks: `Verify`, `Test (Windows)`,
`Commit messages` (the job names in `.github/workflows/ci.yml`). Strict (up to date) on.
The `Commit messages` job runs only on pull requests, which matches a squash-merge flow.
**Blocker 1:** the `gh` token is invalid; the maintainer must run `gh auth login -h github.com`.
**Blocker 2:** pull requests opened with the default token start no workflows, so the
release-please Release PR would wait forever for required checks. Set secret `RELEASE_TOKEN`
first, or the 0.0.2 release stalls. Apply the protection only after `RELEASE_TOKEN` exists.
Record the final rule in `docs/` once applied.

### S4: release

The flow already exists: every push to `main` updates one Release PR through
release-please; merging it creates the tag and GitHub release; the `build` job re-runs
`pnpm run verify`; `publish` attests and uploads. This plan adds checks, not machinery.

Before merging the Release PR:

- Maintainer decision 2026-11-16: release 0.0.2 after S3, not after S1 alone.
- A `fix:` commit from S1 is in the changelog; the proposed version is a patch (0.0.2).
- CI ran on the Release PR. Without secret `RELEASE_TOKEN`, push a commit to the Release
  PR branch or close and reopen it, or the required checks never ran.
- `pnpm run verify` is green in CI, including `pnpm audit --audit-level high`.
- `versions.json` and `manifest.json` carry the new version (checked by `verify:artifacts`
  and `scripts/versions-map.mjs`).
- Native acceptance in Obsidian: load a vault whose `data.json` lacks `foldPersist`, change
  fold state in one note, reload, and confirm other notes keep default fold behavior.
  Record the result in `docs/releases/` or the Release PR description. If not run, say so.

After publishing:

- Download the release assets and run `gh attestation verify` against them.
- Confirm `manifest.json`, `main.js` and `styles.css` are attached and the tag has no `v` prefix.

## Alternatives considered

- Freeze `DEFAULT_SETTINGS` with `Object.freeze`: it throws on the first write and is
  shallow by default, so it hides the bug instead of removing sharing. Rejected.
- Rewrite `applyStartupMigrations` as a schema validator: larger than the bug needs. Rejected.

## Open questions

- Who sets `RELEASE_TOKEN`? S6 and the 0.0.2 Release PR depend on it.
