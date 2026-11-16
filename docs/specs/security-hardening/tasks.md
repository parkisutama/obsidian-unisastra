# Security hardening implementation ledger

Authorized scope: [spec](spec.md), [plan](plan.md). One writer; no commit/push.

| Slice | Requirement | Area | Acceptance / evidence | State |
| --- | --- | --- | --- | --- |
| T1 | SEC-H01 | CI audit and advisory baseline | Full graph; unchanged high floor; dated triage | Implemented; audit high floor exit 0 |
| T2 | SEC-H02 | Shared toolbar executor + tests | Delayed document/focus changes cancel; normal actions preserved | Implemented; targeted tests pass |
| C1 | Checkpoint | Targeted tests + check | Record actual results after T1/T2 | Passed: 35 files / 248 tests |
| T3 | SEC-H03 | Link serialization + tests + ADR | Safe destinations, controls, offsets, unwrap, undo | Implemented; targeted tests pass |
| T4 | SEC-H04 | Release workflow + helper/tests | Local tag/SHA/event mismatches fail closed | Implemented; 13 fixture tests pass |
| C2 | Final gate | verify + review + docs | Record automated and outstanding native/hosted acceptance | Automated gate passed; native/hosted pending |

T2 precedes T3 to avoid editing the shared Link path concurrently. T1 and T4
have no runtime dependency. Every slice includes its docs/evidence update.
Native Obsidian acceptance and first-release provenance inspection remain open
until observed; automated tests cannot close those rows.

## Execution evidence

- T1: baseline full audit exit 1: 1 high, 6 moderate, 3 low. Narrow Vite
  override 6.4.3 to 6.4.4, regenerated lockfile, frozen install succeeded.
  Superseded: #34 moved Vite to 8.3.8, so the override is not part of the
  merged change set.
  Post-patch full audit exit 1 at default floor: 4 moderate, 2 low. The exact
  new CI command pnpm audit --audit-level high exited 0; no ignore was added.
- T2: two new deferred clipboard regressions failed before the fix and passed
  afterwards. C1 pnpm run check exited 0: 35 files / 248 tests and all lint/type checks.
- T3: 10 newly exercised URL/control cases failed before serialization changes.
  34 toolbar tests then passed; reviewer found a missing smartUrl revocation
  check. Its regression failed first, then passed with the new guard. Final
  focused toolbar run: 35 tests passed. The unrelated-state/direction case passes.
- T4: test initially failed because the guard module did not exist. Implemented
  guard then passed all 13 tests using disposable local Git repositories,
  including lightweight/annotated tags and same-version different-commit cases.
- Independent code-review-and-quality review: one required smartUrl correction
  resolved and re-reviewed; no additional concrete blocker reported.
- No command/settings keys, manifest/package versions, deployment paths or
  runtime dependencies changed. New Node-only helper remains in scripts/.

## Remaining acceptance

- Native Obsidian desktop/popout: final destination interpretation, Link/unwrap/undo
  and clipboard timing. No operational vault deployment was performed.
- Hosted CI and real release provenance/source identity: pending a normal
  maintainer-controlled release; no release or workflow dispatch was triggered.
- Earlier formal security-audit Windows no-follow/host blockers remain open.
- Six remaining moderate/low advisories are open, documented in
  [dependency review](dependency-review.md), not suppressed or declared harmless.
- Pending CHANGELOG notes must be placed into the version heading assigned by
  the Release PR; no next version or shipped release is invented here.

## Final automated gate

2026-11-16: pnpm run verify exited 0 on the implemented source tree:

- 36 Vitest files, 276 tests; no skips or deleted regression tests.
- Coverage: statements 31.74%, branches 34.50%, functions 30.68%, lines 31.69%;
  existing thresholds unchanged.
- TypeScript, Biome, Obsidian ESLint, Stylelint and Markdown lint passed.
- Build and artifact verification passed for unchanged plugin version 0.0.1.
- All 20 conformance tests passed; shared conformance source unchanged.
- pnpm audit --audit-level high exited 0: 4 moderate and 2 low remain open.
- Documentation-only result updates after verify are checked separately with
  targeted Markdown lint and static link checks; no implementation changed.

The earlier audit files remain a historical source snapshot. These test results
are implementation verification, not a retroactive full security-audit pass.
