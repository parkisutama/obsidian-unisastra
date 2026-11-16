# Security hardening implementation plan

Status: Authorized 2026-11-16; implemented in #35, #36 and #39. The authorization limits below applied to that work.

Subsequent scope: SEC-H05 is now authorized separately; see the
[deploy verification plan](../deploy-target-verification/plan.md). Deferred
items below preserve the original SEC-H01 through SEC-H04 planning boundary.
Date: 2026-11-16.
Source baseline: `704fc3a16455d2c16c153060e5901deec681a688`.
Working branch: `codex/security-audit-2026-11-16`.
Source requirements: [security audit](../../audit/2026-11-16/REPORT.md).

## Scope and outcome

The maintainer authorized local implementation of SEC-H01 through SEC-H04
on 2026-11-16 and explicitly deferred SEC-H05. The accepted contract is in
[spec.md](spec.md), with implementation evidence in [tasks.md](tasks.md).
Authorization does not establish native or hosted acceptance.

Protect the existing drafting workflow against deferred edits and malformed
link destinations, make dependency checks cover the declared graph, and make
release source identity explicit. These are assurance and integrity improvements;
the audit did not confirm five exploitable vulnerabilities.

| Module | Requirement | Depends on | Size |
| --- | --- | --- | --- |
| dependency-audit | SEC-H01: CI includes development dependencies | None | Small code change; advisory triage uncertain |
| deferred-link | SEC-H02: pending clipboard read cannot apply stale edits | Existing shared toolbar executor | Small–medium |
| markdown-link | SEC-H03: URL destination cannot escape its Markdown link | Existing actions/executor; implement after deferred-link | Medium |
| release-identity | SEC-H04: tag, checkout and build evidence identify the same commit | Existing release-please/build/publish flow | Medium |

Approved delivery order: dependency-audit → deferred-link → markdown-link →
release-identity. This is an execution order, not a new dependency between the
independent CI and editor capabilities. Keep one writer and sequential edits.
Checkpoint after the first two slices, then after the remaining two.

## 1. Dependency audit covers the actual graph

**Outcome:** the CI gate includes packages declared under devDependencies,
without changing the current high-severity threshold or hiding registry failures.

**Approach:** replace `pnpm audit --prod --audit-level high` with
`pnpm audit --audit-level high`, and rename the step to reflect its full scope.
At implementation time, obtain a dated full-graph baseline with
`pnpm audit --json`; record the command exit code as well as its JSON output.
Classify any advisories by build-tool exposure, bundled code or host-provided
modules. Start with existing manifest, lockfile and build external list; do not
build an automated SBOM system for this change.

**Likely files:** `.github/workflows/ci.yml`; a focused CI regression check in
the existing test layout if needed; this initiative's eventual evidence ledger.
Inspect `conformance/standard.test.mjs` for compatibility, but do not change the
shared conformance master merely to add a plugin-specific assertion.

**Acceptance:**

- The selected audit command includes development dependencies and still fails
  on unaccepted high/critical advisories or registry failure.
- Baseline evidence identifies dependency graph, timestamp, exit code and any
  actionable advisories; no vulnerable package is installed just to test the gate.
- No dependency recategorization, broad upgrade, audit auto-fix, blanket ignore,
  or lowered threshold is introduced. Advisory remediation beyond a small,
  compatible fix is a separate scoped decision; it may block completion.

**Verification:** check workflow/config consistency; inspect a full-graph audit
result in the normal authorized network context. If an offline behavior test
of gate handling is needed, use dummy audit results rather than a live vulnerable
package or a new registry service. Do not write a test that only repeats a string.

## 2. Revalidate deferred Link transactions

**Outcome:** the Link action cancels if the document or permissible focused
range changes while clipboard access is pending.

**Approach:** in the shared executor, capture the immutable CodeMirror document
before the await. Immediately before dispatch, retain existing policy/selection
checks, additionally require the same document identity, and check selection
against the latest visible range. Prefer document identity over comparing the
whole EditorState: unrelated state changes need not invalidate valid edits.
Conservatively cancel even if an edit is subsequently undone during the wait.

**Likely files:** `src/capabilities/features/toolbar/executor.ts`,
`tests/toolbar-actions.test.ts`. Review the controller caller; change it only if
the existing policy contract proves insufficient. UI and commands must keep
using the same executor.

**Acceptance:**

- A deferred clipboard promise followed by a document edit at the same selection
  coordinates produces no Link transaction and does not replace newer text.
- A changed focused range that excludes the selection cancels insertion. File,
  editor, enabled, editable, Hemingway and selection checks remain effective.
- Unchanged-document insertion, denied clipboard fallback, smart-URL-off,
  selection direction and existing single-step undo behavior remain compatible.

**Verification:** write failing regression cases before modifying behavior,
then run `pnpm run test -- tests/toolbar-actions.test.ts` and `pnpm run check`.
Native acceptance: ordinary Link insertion and delayed target/focus changes in
Obsidian desktop and popout. Mobile remains correctly unavailable for the toolbar
command path; do not enable a new mobile capability.

## 3. Serialize URL destinations safely for Markdown

**Outcome:** the Link action emits one intended Markdown link for accepted
HTTP/HTTPS input; URL delimiters cannot become additional Markdown structure.

**Approach:** keep HTTP/HTTPS validation, opt-in clipboard access, placeholder
fallback and the existing edit shape. Reject control characters before any trim
or normalization that could conceal them. Use the smallest destination encoding
that handles parentheses, backslashes and Markdown delimiters while retaining
the intended URL semantics. The accepted local implementation uses Markdown backslash escaping for
delimiters (including ampersands) and percent-encoding for whitespace, preserving
ordinary URL spelling. See ADR-006; native rendering remains pending. Do not add a general Markdown parser dependency.

Review all callers of `linkWrapEdit`, `linkUnwrapEdit` and `isLikelyUrl`. Account
for destination selection offsets and the existing unwrap command: a newly
created link must still unwrap correctly. Do not rewrite old vault links.

**Compatibility decision:** this changes generated Markdown destination bytes.
The accepted local decision is recorded in
[ADR-006](../../reference/decisions/ADR-006-safe-link-destinations.md), including
normalization/fallback choices and the unwrap contract. Preserve old ADRs and
leave identifiers/settings/schema unchanged.

**Likely files:** `src/capabilities/features/toolbar/actions.ts`,
`src/capabilities/features/toolbar/executor.ts`, `tests/toolbar-actions.test.ts`;
a focused ADR and relevant documentation as a separate documentation slice.

**Acceptance:**

- Accepted inputs with parentheses, backslashes, Unicode, existing percent
  escapes, query/fragment and delimiter combinations produce one destination
  with the intended URL semantics; controls and non-HTTP(S) input take the
  documented fallback without injecting extra markup.
- Ordinary URLs and the existing placeholder remain compatible. Selection
  offsets, unwrap and undo work for newly serialized links and supported old links.
- Unit tests inspect both emitted Markdown and interpreted link structure using
  an existing appropriate fixture if available; native Obsidian acceptance
  confirms the actual destination without contacting an external host.

**Verification:** failing regression tests first; targeted toolbar tests,
`pnpm run check`, and offline disposable-vault rendering/undo/unwrap acceptance.
No external URL needs to be clicked. If no suitable parser fixture exists,
record the native acceptance dependency rather than inventing a mock renderer
that merely echoes the expected output.

## 4. Bind release artifacts to the released commit

**Outcome:** the build checks out the release commit explicitly, verifies the
tag points to it, and records evidence consistent with the artifact provenance.

**Approach:** expose the existing release-please root output `sha` as a job
output alongside tag_name. Use that SHA for the build checkout. Before install
or build, validate nonempty outputs and require `git rev-parse HEAD` and the
selected tag's peeled commit to equal the expected release SHA. Fetch only the
necessary tag/commit; do not rely on version-text equality or assume a shallow
checkout already contains the tag. Keep the existing tag/version check too.

Pass outputs to shell validation through quoted environment variables, not
inline GitHub-context interpolation. Keep action SHA pins, read-only build
permissions, write permissions confined to publication, and the existing
release_created condition.

Record the actual source SHA in existing build evidence/job summary. Check
whether the pinned attestation action records the workflow event SHA or the
checked-out source SHA. Do not claim that a text file/job summary fixes provenance.
If those differ, use a documented supported source-binding mechanism or stop
publication pending a reviewed workflow adjustment; do not invent provenance
metadata or silently weaken its meaning.

**Likely files:** `.github/workflows/release.yml`; a small helper under
`scripts/` only if necessary for meaningful isolated validation, with a matching
Vitest test. Reuse existing verification patterns; avoid extracting a helper
solely to unit-test a trivial shell comparison. Documentation/evidence is a
separate small slice if the total would exceed roughly five files.

**Acceptance:**

- Correct release SHA/tag passes; missing SHA/tag, a tag on a different commit,
  or a different commit carrying the same version fails before build/upload.
- A lightweight and an annotated local tag are resolved to commit identity.
  No release-created condition means no build/publication, as before.
- The documented provenance source identity matches the commit actually built.
  If actual hosted evidence is unavailable, mark hosted acceptance pending;
  a local fixture does not prove production publication or attestation.

**Verification:** use a disposable local Git repository with dummy commits and
local-only tags to exercise comparisons without touching this repo's tags.
Inspect workflow wiring separately; do not run release-please, dispatch a release,
merge a Release PR, upload assets or publish to prove the plan. Actual first-release
artifact/provenance inspection remains a maintainer-controlled acceptance step.

## Validation and handover

Each implemented slice includes relevant regression proof and `pnpm run check`.
At the final checkpoint run `pnpm run verify`, review compatibility and record
actual commands/results. Existing floors, tests and conformance rules stay intact.
Native acceptance is reported separately from automated tests and CI success.

The planning turn executed no target code; implementation checks are recorded
in the tasks ledger. The earlier audit's Windows
validator/no-follow blocker remains open; planning does not close it. If future
execution uses the security-audit workflow, its full sandbox requirements still
apply. Do not silently convert unrun checks into passes or use dev/deploy for QA.

The implementation ledger traces SEC-H01 through SEC-H04 to tasks, tests,
QA and evidence.
Update development status/current state only for verified changes; do not claim
shipped behavior from this plan. Record user-facing Link fixes in the existing
CHANGELOG/release process without manually changing package/manifest versions.
Preserve the dated audit snapshot and append links to remediation evidence.

## Deferred and non-goals

- SEC-H05: deploy canonical path and symlink/junction policy, explicitly deferred
  by the maintainer. Leave deployment implementation unchanged.
- No UI redesign, new setting, command ID change, schema migration, dependency
  overhaul, broad architecture refactor or custom release system.
- No commit, push, merge, deployment, tag or release is authorized by this plan.
- No new claim of a confirmed vulnerability or a passed formal security audit.

## Implementation decisions

Approved direction: full-graph audit with the existing high threshold;
conservative cancellation of stale Link edits; minimal Markdown-safe destination
serialization with an ADR; explicit release SHA/tag binding with honest provenance.
ADR-006 records destination serialization. The release guard requires the event
SHA to equal the release SHA, avoiding a provenance source override. A targeted
Vite security patch closes the high advisory; remaining moderate/low findings
are recorded without ignores. Unknown advisory results are not advance approval
for broad upgrades.

## Primary references

- [Audit source and recommendations](../../audit/2026-11-16/REPORT.md).
- [Audit execution/host limits](../../audit/2026-11-16/NEEDS-VALIDATION.md).
- [pnpm audit options](https://github.com/pnpm/pnpm/blob/main/pnpm/docs/cli/audit.md):
  --prod excludes development dependencies; --audit-level determines the failure floor.
- [Pinned release-please action outputs](https://github.com/googleapis/release-please-action/blob/45996ed1f6d02564a971a2fa1b5860e934307cf7/README.md#outputs):
  root-component sha is the SHA at which the release was tagged.
