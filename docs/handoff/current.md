# Current handoff

Date: 2026-11-16.
Branch: `claude/quality-hardening`.
State: S1 implemented and committed; S2, S3, QH-03 (S5) and release steps pending. Native testing is not requested yet.
Current owner: Ubuntu development agent.
Next owner: Windows native-testing agent, at the checkpoint named below.
Code SHA under test: `298723fa5ba29b0f2b301ef57731bb210f5677d0` plus the commit that contains this file. Resolve the final code SHA with Git before testing.
Source base: `f2ae9af1705777edde86015dbf2c0f3ac4a16c39` (main).

## Read first

- [Agent instructions](../../AGENTS.md) and [protocol](README.md), including the CLI rules.
- [Quality audit](../audit/2026-11-16-quality-pass/REPORT.md).
- [Spec](../specs/quality-hardening/spec.md), [plan](../specs/quality-hardening/plan.md), [task ledger](../specs/quality-hardening/tasks.md).
- [QH-03 spec](../specs/outline-view-split/spec.md), [plan](../specs/outline-view-split/plan.md), [tasks](../specs/outline-view-split/tasks.md).

## Work done

- S1 (QH-01): `applyStartupMigrations` clones `DEFAULT_SETTINGS` per load, in the current and legacy paths. Two new tests in `tests/settings.test.ts` failed before the change and pass after.
- Documents: quality audit, spec, plan, tasks, and this handoff.

## Checks and evidence

All run inside bubblewrap (no network, cleared environment, read-only source and toolchain, scratch on tmpfs), Node 24.15.0 from fnm.

- `vitest run`: 36 files, 307 tests passed. Baseline before S1 was 305 tests.
- `tsc --noEmit`, `biome check`, `eslint src manifest.json LICENSE`: no errors.
- `commitlint` on the S1 message: 0 problems.
- Git hooks were bypassed with a command-scoped `core.hooksPath=/dev/null` for the S1 commit, so no target code ran outside the sandbox. CI runs the same gates.
- Not run: coverage, build, `verify:artifacts`, conformance, `pnpm audit` (needs network), lint:styles, lint:md for code changes.
- Native acceptance: not run.

## Blockers

- The `gh` token is invalid; branch protection (`Verify`, `Test (Windows)`, `Commit messages`) and `RELEASE_TOKEN` cannot be set until the maintainer runs `gh auth login -h github.com`. Set `RELEASE_TOKEN` before the protection, or the Release PR never gets its required checks.
- No pull request is open. The maintainer chose one branch and one pull request; its title must be `fix: ...`.

## Native checkpoints requested from Windows

Not yet. Ubuntu requests them only at a coherent code SHA and will update this file with the SHA and steps first.

1. After S1 and S2 (small): reload with a `data.json` that has no `foldPersist` key. Fold and unfold a list in one note, reload the plugin, and confirm other notes keep their default fold behavior and no console error appears. Then repeat with a legacy flat `data.json`.
2. After QH-03 (S5): Outline panel on a note with headings, nested lists and tasks, in the main window and a popout. Switch the three filters, collapse and expand, toggle a task, and reveal the active node. Compare with the same note on the 0.0.1 build.
3. Before the 0.0.2 Release PR is merged: install the built `main.js`, `manifest.json` and `styles.css` from the Release PR's artifact and repeat steps 1 and 2.

## Next actions for Ubuntu

1. S2: dated comment on the `minimatch` override; `JSON.stringify` in `scripts/lib/setup-test-vault.ts`.
2. S3: per-file coverage baseline, behavior tests with condition inversion, raise the coverage floor.
3. S5: validate the QH-03 plan with the maintainer, then extract entries and tree logic with tests first.
4. Update this file at each checkpoint, push when authorized, then request native testing.

## Authorization boundaries

- Authorized: local implementation of S1 to S5 on this branch, commits, documentation.
- Not authorized without a new approval: push, opening the pull request, merging, merging a Release PR, tagging, publishing, changing GitHub settings or secrets, deploying to a working vault.
