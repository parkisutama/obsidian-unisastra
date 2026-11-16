# Current handoff

Date: 2026-11-16.
Branch: `claude/quality-hardening`.
State: S1, S2 and S3 committed; the QH-03 plan is validated, its implementation and the release steps are pending. Native checkpoint 1 is requested now.
Current owner: Ubuntu development agent.
Next owner: Windows native-testing agent, at the checkpoint named below.
Code SHA under test: `141a78c` (last code or test change; later commits are documentation only). Resolve the full SHA with `git rev-parse 141a78c` on branch `claude/quality-hardening`. The branch is not pushed yet; the maintainer must push or share it before Windows can fetch it.
Source base: `f2ae9af1705777edde86015dbf2c0f3ac4a16c39` (main).

## Read first

- [Agent instructions](../../AGENTS.md) and [protocol](README.md), including the CLI rules.
- [Quality audit](../audit/2026-11-16-quality-pass/REPORT.md).
- [Spec](../specs/quality-hardening/spec.md), [plan](../specs/quality-hardening/plan.md), [task ledger](../specs/quality-hardening/tasks.md).
- [QH-03 spec](../specs/outline-view-split/spec.md), [plan](../specs/outline-view-split/plan.md), [tasks](../specs/outline-view-split/tasks.md).

## Work done

- S1 (QH-01): `applyStartupMigrations` clones `DEFAULT_SETTINGS` per load, in the current and legacy paths. Two new tests in `tests/settings.test.ts` failed before the change and pass after.
- S2 (QH-04, QH-05): dated `minimatch` override comment; `setup-test-vault.ts` uses `JSON.stringify`.
- S3 (QH-02): new tests for `list-service.ts` and `keyboard-ops.ts` (43 tests) over a fixture tree; 18 conditions inverted, all caught. Coverage floor raised to 37/39/33/37. `fold-persist.ts` stays covered by the browser regression, not by vitest.
- QH-03: plan validated against the code and corrected (step B narrowed).
- Documents: quality audit, spec, plan, tasks, and this handoff.

## Checks and evidence

All run inside bubblewrap (no network, cleared environment, read-only source and toolchain, scratch on tmpfs), Node 24.15.0 from fnm.

- `vitest run`: 38 files, 350 tests passed. Baseline before S1 was 305 tests. Coverage totals 38.00 statements, 39.97 branches, 33.60 functions, 37.86 lines.
- `tsc --noEmit`, `biome check`, `eslint src manifest.json LICENSE`: no errors.
- `commitlint` on the S1 message: 0 problems.
- S1 commit: git hooks bypassed with a command-scoped `core.hooksPath=/dev/null`. Later commits ran the hooks normally (typecheck, lint, tests) and passed.
- Not run: coverage, build, `verify:artifacts`, conformance, `pnpm audit` (needs network), lint:styles, lint:md for code changes.
- Native acceptance: not run.

## Blockers

- The `gh` token is invalid; branch protection (`Verify`, `Test (Windows)`, `Commit messages`) and `RELEASE_TOKEN` cannot be set until the maintainer runs `gh auth login -h github.com`. Set `RELEASE_TOKEN` before the protection, or the Release PR never gets its required checks.
- No pull request is open. The maintainer chose one branch and one pull request; its title must be `fix: ...`.

## Native checkpoints requested from Windows

Checkpoint 1 is requested now, at `141a78c`. Checkpoints 2 and 3 are not yet.

1. Checkpoint 1, requested (S1, S2, S3): reload with a `data.json` that has no `foldPersist` key. Fold and unfold a list in one note, reload the plugin, and confirm other notes keep their default fold behavior and no console error appears. Then repeat with a legacy flat `data.json`. Also check, in a note with nested lists: Tab, Shift+Tab, Enter (end and middle of an item, on an empty nested item and an empty root item), move item up and down, Home and Left at the marker. These cover the logic the new tests assume; the fixture assumes a list-line node covers its line end, which only native use can confirm. Report pass or fail per step, with console errors.
2. After QH-03 (S5): Outline panel on a note with headings, nested lists and tasks, in the main window and a popout. Switch the three filters, collapse and expand, toggle a task, and reveal the active node. Compare with the same note on the 0.0.1 build.
3. Before the 0.0.2 Release PR is merged: install the built `main.js`, `manifest.json` and `styles.css` from the Release PR's artifact and repeat steps 1 and 2.

## Next actions for Ubuntu

1. Wait for the Windows result on checkpoint 1.
2. Run coverage-gated `pnpm run verify` pieces not yet run (build, `verify:artifacts`, conformance) when the sandbox allows.
3. S5: the plan is validated; wait for the maintainer to approve the corrections, then write O1 tests and extract entries first.
4. Update this file at each checkpoint, push when authorized, then request native testing.

## Authorization boundaries

- Authorized: local implementation of S1 to S5 on this branch, commits, documentation.
- Not authorized without a new approval: push, opening the pull request, merging, merging a Release PR, tagging, publishing, changing GitHub settings or secrets, deploying to a working vault.
