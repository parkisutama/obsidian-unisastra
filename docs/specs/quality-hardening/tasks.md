# Quality hardening task ledger

Source: [spec](spec.md), [plan](plan.md). Authorized 2026-11-16; implementation in progress on `claude/quality-hardening`.

| Slice | Requirement | Area | Acceptance / evidence | State |
| --- | --- | --- | --- | --- |
| S1a | QH-01 | `tests/settings.test.ts` | Regression test fails on current code | Reproduced in a bubblewrap probe; not yet committed as a test |
| S1b | QH-01 | `src/capabilities/settings.ts` | Defaults never mutated; legacy branch covered; existing tests pass | Pending |
| C1 | Checkpoint | `pnpm run check` in sandbox | Record file and test counts | Pending |
| S2a | QH-04 | `pnpm-workspace.yaml` | Dated comment and removal condition | Pending |
| S2b | QH-05 | `scripts/lib/setup-test-vault.ts` | `JSON.stringify` output equals old output | Pending |
| S3a | QH-02 | Coverage baseline | Per-file numbers for three files recorded here | Pending |
| S3b | QH-02 | Outliner and list tests | Each test proven by condition inversion | Pending |
| S3c | QH-02 | `vitest.config.ts` | Thresholds raised below measured totals, never lowered | Pending |
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
  default-mutation check. The probe is not part of the repo yet.
