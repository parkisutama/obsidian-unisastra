# Quality hardening task ledger

Source: [spec](spec.md), [plan](plan.md). Authorized 2026-11-16; implementation in progress on `claude/quality-hardening`.

| Slice | Requirement | Area | Acceptance / evidence | State |
| --- | --- | --- | --- | --- |
| S1a | QH-01 | `tests/settings.test.ts` | Regression test fails on current code | Done: two tests failed before the fix (commit `298723f`) |
| S1b | QH-01 | `src/capabilities/settings.ts` | Defaults never mutated; legacy branch covered; existing tests pass | Done: 36 files / 307 tests in bubblewrap |
| C1 | Checkpoint | check gates in sandbox | Record file and test counts | Done for typecheck, biome, eslint, vitest; native reload check pending, see [handoff](../../handoff/current.md) |
| S2a | QH-04 | `pnpm-workspace.yaml` | Dated comment and removal condition | Done |
| S2b | QH-05 | `scripts/lib/setup-test-vault.ts` | `JSON.stringify` output equals old output | Done |
| S3a | QH-02 | Coverage baseline | Per-file numbers for three files recorded here | Done. Stmts, branches: keyboard-ops 7.93, 0; list-service 2.2, 0; fold-persist 0, 0 (2026-11-16, totals 32.36, 35.66) |
| S3b | QH-02 | Outliner and list tests | Each test proven by condition inversion | Done. keyboard-ops 97.61/91.3, list-service 93.39/78.57 (stmts/branches); 17 conditions inverted, all caught. `fold-persist.ts` stays under the browser regression in conformance; not faked in node |
| S3c | QH-02 | `vitest.config.ts` | Thresholds raised below measured totals, never lowered | Done. 30/33/30/30 to 37/39/33/37 against measured 38.00/39.97/33.60/37.86 |
| S5a | QH-03 | `docs/specs/outline-view-split/` | Spec, plan, tasks validated by the maintainer | Pending |
| S5b | QH-03 | `src/components/outline-view.ts` | Behavior-preserving split; tests unchanged and green | Pending |
| C2 | Checkpoint | `pnpm run verify` in sandbox | Record results | Pending |
| S6 | Repo policy | GitHub branch protection | `Verify`, `Test (Windows)`, `Commit messages` required; `RELEASE_TOKEN` set first | Blocked: `gh` token invalid |
| S4a | Release | Release PR | `fix:` in changelog; CI ran on the PR; tag equals manifest | Pending |
| S4b | Release | Native acceptance | Reload test in Obsidian recorded, or listed untested | Pending |
| S4c | Release | Provenance | `gh attestation verify` on the published assets | Pending |

## Evidence

- Baseline 2026-11-16: 36 files, 305 tests pass; coverage 32.36% statements, 35.66%
  branches, 30.91% functions, 32.3% lines; `pnpm audit --audit-level high` clean.
- QH-01 probe, run inside bubblewrap: 1 failed, 305 passed. The failing assertion is the
  default-mutation check. The probe became the regression tests of S1.
- S1 evidence: red run 2 failed; green run 36 files / 307 tests; `tsc`, `biome`, `eslint` clean, all in bubblewrap. Native checkpoints for the Windows agent are in [the handoff](../../handoff/current.md).

## Findings after native checkpoint 1b (2026-11-17)

| Item | Finding | State |
| --- | --- | --- |
| QH-06 | The Outline panel reads list depth from text with `Math.floor(indent / 2)` in `createTextListOutlineEntry` (`src/components/outline-view.ts`). A tab counts as one character, so a one-tab child sits level with its parent and a two-tab item drops one level. Four spaces count as two levels. The syntax-tree path and Live Preview are correct. Seen on 2026-11-17 in a note indented by tabs; after the maintainer turned off "Indent using tabs" the panel read the same note correctly | Text-path depth fixed: failing tests first (4 of 5 red), then a nesting-based fix; 11 tests in `tests/outline-text-depth.test.ts`. Still open: when the panel uses the text path instead of the tree path. The live tree names list lines `HyperMD-list-line-N`, while the tree collector looks for `ListItem`; check natively whether notes with headings lose their lists in the panel |
| QH-07 | Maintainer direction: use Obsidian Smart lists, remove the plugin's editor list commands and keyboard flags, keep the Outline panel operations. See [ADR-008](../../reference/decisions/ADR-008-native-smart-lists-and-outline-ops.md) | Direction accepted; spec, migration plan and tests pending |
| QH-08 | With the five keyboard flags on, the palette commands "Indent list item" and "Move list item up" change nothing; with them off they work (maintainer report, real key presses and palette). Cause unknown | Open; retired by QH-07 if the commands are removed |
